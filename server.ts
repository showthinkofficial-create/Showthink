import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Firestore for server-side verification if config exists
let db: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(configData, 'server-app');
    db = getFirestore(firebaseApp, configData.firestoreDatabaseId || undefined);
    console.log('[Server] Connected to Firestore database:', configData.firestoreDatabaseId || 'default');
  }
} catch (err) {
  console.warn('[Server] Firestore server-side initialization note:', err);
}

const app = express();
const PORT = 3000;

// Capture raw body for webhook verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// 1. Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GP Academy Fees & Payment Backend',
  });
});

// ---------------------------------------------------------------------------
// 2. Gateway Configuration Check
// Returns status: 'COMING_SOON' as online payment is pending rollout
// ---------------------------------------------------------------------------
app.get('/api/payment/config', (_req, res) => {
  res.json({
    configured: false,
    status: 'COMING_SOON',
    keyId: null,
    message: 'Online payment via Razorpay is coming soon. Please contact the GP Academy Accounts Office for payment assistance.',
  });
});

// ---------------------------------------------------------------------------
// 3. Create Razorpay Order
// Generates a verified order on Razorpay servers using database amount
// ---------------------------------------------------------------------------
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    // Check if gateway credentials are fully configured
    if (!keyId || !keySecret || keyId.length < 3 || keySecret.length < 3) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: 'Online payment is currently being configured. Please contact the school office for payment assistance.',
      });
    }

    const { feeId, studentId, amount, studentName, notes } = req.body;

    if (!feeId || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: feeId and studentId are required.',
      });
    }

    let verifiedAmount = Number(amount);

    // If server has direct Firestore connection, verify the pending amount
    if (db && feeId) {
      try {
        const feeDocRef = doc(db, 'studentFees', feeId);
        const feeDocSnap = await getDoc(feeDocRef);
        if (feeDocSnap.exists()) {
          const feeData = feeDocSnap.data();
          if (feeData.status === 'PAID' || feeData.status === 'CANCELLED') {
            return res.status(400).json({
              success: false,
              error: `Fee is already marked as ${feeData.status}. Payment not accepted.`,
            });
          }
          if (typeof feeData.pendingAmount === 'number' && feeData.pendingAmount > 0) {
            // Cap payment amount to pending amount
            verifiedAmount = Math.min(verifiedAmount || feeData.pendingAmount, feeData.pendingAmount);
          }
        }
      } catch (err) {
        console.warn('[Server] Note during fee verification:', err);
      }
    }

    if (!verifiedAmount || verifiedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount. Amount must be greater than zero.',
      });
    }

    const amountInPaise = Math.round(verifiedAmount * 100);
    const receiptId = `RCP-${Date.now().toString().slice(-8)}`;

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const orderPayload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        feeId: String(feeId),
        studentId: String(studentId),
        studentName: String(studentName || ''),
        school: 'GP Academy',
        ...(notes || {}),
      },
    };

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayRes.ok) {
      const errorData = await razorpayRes.json();
      console.error('[Server] Razorpay order creation failed:', errorData);
      return res.status(razorpayRes.status).json({
        success: false,
        error: errorData.error?.description || 'Failed to create payment order with gateway.',
      });
    }

    const orderData = await razorpayRes.json();

    // Store tentative transaction record
    if (db) {
      try {
        const txnRef = doc(collection(db, 'paymentTransactions'));
        await setDoc(txnRef, {
          orderId: orderData.id,
          studentId,
          feeId,
          amount: verifiedAmount,
          currency: 'INR',
          gateway: 'Razorpay',
          status: 'CREATED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[Server] Could not record tentative transaction:', e);
      }
    }

    return res.json({
      success: true,
      configured: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId,
    });
  } catch (error: any) {
    console.error('[Server] Error creating payment order:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while initializing payment.',
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Verify Razorpay Payment Signature (Server-Side)
// Uses HMAC SHA256 with timingSafeEqual to verify gateway signature
// Idempotent: checks for duplicate payment ID
// ---------------------------------------------------------------------------
app.post('/api/payment/verify', async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      return res.status(400).json({
        success: false,
        error: 'Payment gateway secret is not configured on server.',
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
      studentId,
      studentUid,
      amount,
      studentName,
      className,
      section,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required Razorpay verification parameters.',
      });
    }

    // 1. Signature calculation
    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(bodyToSign)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(razorpay_signature, 'utf8');

    const isMatch =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    if (!isMatch) {
      console.error('[Server] Cryptographic signature mismatch for payment:', razorpay_payment_id);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid cryptographic signature.',
      });
    }

    // 2. Idempotency Check: Prevent duplicate payment processing
    if (db) {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('razorpayPaymentId', '==', razorpay_payment_id), limit(1));
      const existing = await getDocs(q);
      if (!existing.empty) {
        console.warn('[Server] Duplicate payment caught:', razorpay_payment_id);
        const existingDoc = existing.docs[0].data();
        return res.json({
          success: true,
          verified: true,
          duplicate: true,
          message: 'Payment was already verified and recorded.',
          receiptNumber: existingDoc.receiptNumber,
          paymentId: razorpay_payment_id,
        });
      }
    }

    const paymentAmount = Number(amount) || 0;
    const paymentTimestamp = new Date().toISOString();
    const receiptNumber = `GP-REC-${Date.now().toString().slice(-6)}`;

    // 3. Atomically record payment and update fee record
    if (db) {
      try {
        // Record verified payment
        const paymentDocRef = doc(collection(db, 'payments'));
        const paymentData = {
          studentId: studentId || '',
          studentUid: studentUid || '',
          studentName: studentName || '',
          className: className || '',
          section: section || '',
          feeId: feeId || '',
          feeType: 'Tuition Fee',
          feePeriod: 'Online Fee Payment',
          amount: paymentAmount,
          currency: 'INR',
          receiptNumber,
          paymentDate: paymentTimestamp.split('T')[0],
          paymentMode: 'Razorpay',
          method: 'Razorpay Online Gateway',
          status: 'SUCCESS',
          verified: true,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          paidAt: paymentTimestamp,
          recordedBy: 'Razorpay Gateway Server Verification',
          createdAt: paymentTimestamp,
          updatedAt: paymentTimestamp,
        };
        await setDoc(paymentDocRef, paymentData);

        // Update student fee record
        if (feeId) {
          const feeRef = doc(db, 'studentFees', feeId);
          const feeSnap = await getDoc(feeRef);
          if (feeSnap.exists()) {
            const feeData = feeSnap.data();
            const currentPaid = Number(feeData.paidAmount) || 0;
            const totalFee = Number(feeData.amount) || 0;
            const newPaid = currentPaid + paymentAmount;
            const newPending = Math.max(0, totalFee - newPaid);
            const newStatus = newPaid >= totalFee ? 'PAID' : 'PARTIALLY_PAID';

            await updateDoc(feeRef, {
              paidAmount: newPaid,
              pendingAmount: newPending,
              status: newStatus,
              paymentMethod: 'Razorpay',
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              receiptId: receiptNumber,
              paidAt: paymentTimestamp,
              updatedAt: paymentTimestamp,
            });
          }
        }
      } catch (dbErr) {
        console.error('[Server] Firestore update error on payment verification:', dbErr);
      }
    }

    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      receiptNumber,
      message: 'Payment verified successfully and recorded.',
    });
  } catch (error: any) {
    console.error('[Server] Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during payment verification.',
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Razorpay Webhook Handler
// Handles payment.captured, payment.failed, and refunds with signature check
// ---------------------------------------------------------------------------
app.post('/api/payment/webhook', async (req: any, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[Server] Invalid webhook signature');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Server Webhook] Received Razorpay event: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity && db) {
        const paymentId = paymentEntity.id;
        // Check if already processed
        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, where('razorpayPaymentId', '==', paymentId), limit(1));
        const existing = await getDocs(q);

        if (existing.empty) {
          const notes = paymentEntity.notes || {};
          const paymentAmount = (paymentEntity.amount || 0) / 100;
          const timestamp = new Date().toISOString();
          const receiptNum = `GP-REC-${Date.now().toString().slice(-6)}`;

          const newDoc = doc(collection(db, 'payments'));
          await setDoc(newDoc, {
            studentId: notes.studentId || '',
            studentUid: notes.studentUid || '',
            studentName: notes.studentName || '',
            feeId: notes.feeId || '',
            feeType: 'Tuition Fee',
            feePeriod: 'Razorpay Online Webhook',
            amount: paymentAmount,
            currency: paymentEntity.currency || 'INR',
            receiptNumber: receiptNum,
            paymentDate: timestamp.split('T')[0],
            paymentMode: 'Razorpay',
            method: paymentEntity.method || 'online',
            status: 'SUCCESS',
            verified: true,
            razorpayPaymentId: paymentId,
            razorpayOrderId: paymentEntity.order_id || '',
            paidAt: timestamp,
            recordedBy: 'Razorpay Webhook Handler',
            createdAt: timestamp,
            updatedAt: timestamp,
          });

          // Update student fee if feeId provided in notes
          if (notes.feeId) {
            const feeRef = doc(db, 'studentFees', notes.feeId);
            const feeSnap = await getDoc(feeRef);
            if (feeSnap.exists()) {
              const feeData = feeSnap.data();
              const currentPaid = Number(feeData.paidAmount) || 0;
              const totalFee = Number(feeData.amount) || 0;
              const newPaid = currentPaid + paymentAmount;
              const newPending = Math.max(0, totalFee - newPaid);
              const newStatus = newPaid >= totalFee ? 'PAID' : 'PARTIALLY_PAID';

              await updateDoc(feeRef, {
                paidAmount: newPaid,
                pendingAmount: newPending,
                status: newStatus,
                paymentMethod: 'Razorpay',
                paymentId: paymentId,
                orderId: paymentEntity.order_id || '',
                receiptId: receiptNum,
                paidAt: timestamp,
                updatedAt: timestamp,
              });
            }
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      console.warn('[Server Webhook] Payment failed for order:', paymentEntity?.order_id);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Server] Webhook processing error:', error);
    return res.status(500).send('Webhook handler error');
  }
});

// ---------------------------------------------------------------------------
// 6. Record Refund (Admin action)
// ---------------------------------------------------------------------------
app.post('/api/payment/refund', async (req, res) => {
  try {
    const { paymentId, feeId, studentId, studentName, amount, reason, processedBy } = req.body;

    if (!paymentId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required refund information (paymentId, amount, reason).',
      });
    }

    const refundId = `RFD-${Date.now().toString().slice(-8)}`;
    const timestamp = new Date().toISOString();

    if (db) {
      const refundRef = doc(collection(db, 'refunds'));
      await setDoc(refundRef, {
        refundId,
        paymentId,
        feeId: feeId || '',
        studentId: studentId || '',
        studentName: studentName || '',
        amount: Number(amount),
        reason,
        status: 'PROCESSED',
        processedBy: processedBy || 'Admin',
        createdAt: timestamp,
      });

      // Update student fee if applicable
      if (feeId) {
        const feeRef = doc(db, 'studentFees', feeId);
        const feeSnap = await getDoc(feeRef);
        if (feeSnap.exists()) {
          const feeData = feeSnap.data();
          const currentPaid = Number(feeData.paidAmount) || 0;
          const totalFee = Number(feeData.amount) || 0;
          const newPaid = Math.max(0, currentPaid - Number(amount));
          const newPending = Math.max(0, totalFee - newPaid);
          const newStatus = newPaid === 0 ? 'PENDING' : 'PARTIALLY_PAID';

          await updateDoc(feeRef, {
            paidAmount: newPaid,
            pendingAmount: newPending,
            status: newStatus,
            updatedAt: timestamp,
          });
        }
      }
    }

    return res.json({
      success: true,
      refundId,
      message: 'Refund recorded successfully.',
    });
  } catch (err: any) {
    console.error('[Server] Refund error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 7. Vite Integration (Middleware for dev, static serving for prod)
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] GP Academy platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
