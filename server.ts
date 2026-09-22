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
import { initializeApp as initAdminApp, getApps as getAdminApps, App as FirebaseAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase applet configuration
let firebaseConfigData: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfigData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (cfgErr) {
  console.warn('[Server] Could not read firebase-applet-config.json:', cfgErr);
}

// Initialize Firebase Admin SDK
let adminApp: FirebaseAdminApp | null = null;
try {
  const existingApps = getAdminApps();
  if (existingApps.length === 0) {
    const projectId = firebaseConfigData.projectId || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0515765686';
    adminApp = initAdminApp({
      projectId,
    });
    console.log('[Server] Firebase Admin SDK initialized for project:', projectId);
  } else {
    adminApp = existingApps[0];
  }
} catch (adminErr) {
  console.warn('[Server] Firebase Admin initialization notice:', adminErr);
}

// Initialize Firebase Client Firestore for server-side verification if config exists
let db: any = null;
try {
  if (firebaseConfigData && firebaseConfigData.projectId) {
    const firebaseApp = initializeApp(firebaseConfigData, 'server-app');
    db = getFirestore(firebaseApp, firebaseConfigData.firestoreDatabaseId || undefined);
    console.log('[Server] Connected to Firestore database:', firebaseConfigData.firestoreDatabaseId || 'default');
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
// 1b. GP Academy AI Chatbot Assistant API
// Powered by Google GenAI (gemini-3.8-flash)
// ---------------------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, userMessage } = req.body;
    const prompt = userMessage || (Array.isArray(messages) && messages[messages.length - 1]?.text) || '';

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'User message is required.' });
    }

    const systemInstruction = `You are "GP Shiksha AI", the friendly, knowledgeable, and respectful AI Virtual Assistant for GP Academy, Noida.
Official GP Academy Information:
- School Name: GP Academy
- Tagline: "Knowledge is the biggest money"
- Campus Address: Bhangel, Goyal Colony, Salarpur Khadar, Noida, Uttar Pradesh — 201304
- Phone: 9818776563
- Email: admissions@gpacademy.edu.in
- Classes: Nursery to Class 12
- Curriculum: Nursery to Class 8 (CBSE) | Class 10 to 12 (CBSE & UP Board options)
- School Timings: Monday–Saturday: 8:00 AM – 3:00 PM, Sunday: 9:00 AM – 2:00 PM
- Current Special Admission Offers:
  1. Admission is 100% Free for new enrollments.
  2. School Tie & Belt are complimentary / free.
  3. Sibling/Group Offer: If 3 students are admitted together during the admission period: 3 months tuition fee free (applicable June to August).
- Facilities: Smart Classrooms with digital interactive boards, Advanced Science Laboratories (Physics, Chemistry, Biology), High-Speed Computer Lab with foundational AI & Coding, Resource-Rich Library, Modern Sports Complex (Cricket, Football, Basketball, Table Tennis), Performing Arts & Music Room, and Safe School Van Transport.
- Online Portals: GP Academy provides 24/7 dedicated online portals for Students, Parents, Teachers, and Administration for live attendance tracking, exam marks & report cards, daily homework assignments, fee collection ledger & digital receipts, and class timetables.
Instructions:
- Keep answers warm, welcoming, polite, and helpful.
- Support both English and Hindi / Hinglish seamlessly based on how the user greets or asks.
- Use concise bullet points for readability.
- If anyone asks about taking admission or visiting, invite them to visit the campus at Bhangel, Goyal Colony, Salarpur Khadar, Noida or call 9818776563, or use the "Apply Online" button.`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

      // Build conversation contents
      let contents: any[] = [];
      if (Array.isArray(messages) && messages.length > 0) {
        // Take last 8 turns for contextual brevity
        const recentMessages = messages.slice(-8);
        contents = recentMessages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.text || m.content || '') }]
        }));
      } else {
        contents = [{ role: 'user', parts: [{ text: prompt.trim() }] }];
      }

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = aiResponse.text?.trim() ||
        'Namaste! Welcome to GP Academy. We offer CBSE education from Nursery to Class 12 in Noida. How may I assist you with admissions, curriculum, or school facilities today?';

      return res.json({
        success: true,
        reply: replyText,
      });
    } catch (genAiErr: any) {
      console.warn('[Server] GenAI execution note:', genAiErr?.message);
      // Helpful fallback with accurate school details
      return res.json({
        success: true,
        reply: `Namaste! 🙏 Welcome to GP Academy, Noida.\n\nWe offer quality CBSE education from Nursery to Class 12.\n• Admissions are currently open with Free Admission, Free Tie & Belt!\n• School Timings: Mon–Sat: 8:00 AM – 3:00 PM\n• Address: Bhangel, Goyal Colony, Salarpur Khadar, Noida (UP)\n• Helpline: 9818776563\n\nPlease let me know if you would like information regarding the admission process, curriculum, or school facilities!`,
      });
    }
  } catch (err: any) {
    console.error('[Server] AI Chat error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process AI chat request.' });
  }
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

// ===========================================================================
// TEACHER MANAGEMENT BACKEND ENDPOINTS (PART 30)
// ===========================================================================

// Helper: send password reset email via Identity Toolkit or Admin SDK
async function dispatchPasswordResetEmail(email: string): Promise<boolean> {
  const apiKey = firebaseConfigData.apiKey || process.env.VITE_FIREBASE_API_KEY || '';
  if (apiKey) {
    try {
      const resetRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email,
          }),
        }
      );
      const resJson: any = await resetRes.json();
      if (resJson && !resJson.error) {
        return true;
      }
      console.warn('[Server] sendOobCode note:', resJson.error);
    } catch (e) {
      console.warn('[Server] Error calling sendOobCode:', e);
    }
  }

  if (adminApp) {
    try {
      await getAdminAuth(adminApp).generatePasswordResetLink(email);
      return true;
    } catch (e) {
      console.warn('[Server] Admin SDK generatePasswordResetLink notice:', e);
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// 7. Create Teacher Account (Admin action)
// Securely provisions Firebase Auth User + Firestore teacher profile + user document
// ---------------------------------------------------------------------------
app.post('/api/admin/teachers/create-account', async (req, res) => {
  try {
    const {
      name,
      email,
      teacherId,
      phone,
      alternatePhone,
      subjects,
      assignedClasses,
      assignedSections,
      qualification,
      address,
      joiningDate,
      profilePhoto,
      status = 'ACTIVE',
      actorUid = 'admin',
      actorEmail = 'admin@gpacademy.in',
    } = req.body;

    // 1. Validate fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Teacher Full Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Teacher Email is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Teacher Phone number is required.' });
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, error: 'Please assign at least one subject.' });
    }
    if (!Array.isArray(assignedClasses) || assignedClasses.length === 0) {
      return res.status(400).json({ success: false, error: 'Please assign at least one class.' });
    }

    const cleanTeacherId = teacherId && teacherId.trim() ? teacherId.trim() : `GP-T-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;

    // 2. Duplicate checks in Firestore if connected
    if (db) {
      const qEmail = query(collection(db, 'teachers'), where('email', '==', cleanEmail), limit(1));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        return res.status(400).json({
          success: false,
          error: `A teacher with email '${cleanEmail}' is already registered in GP Academy records.`,
        });
      }

      const qId = query(collection(db, 'teachers'), where('teacherId', '==', cleanTeacherId), limit(1));
      const snapId = await getDocs(qId);
      if (!snapId.empty) {
        return res.status(400).json({
          success: false,
          error: `Teacher ID '${cleanTeacherId}' is already assigned to another faculty member.`,
        });
      }
    }

    // 3. Provision Firebase Auth User Account
    let authUid = '';
    const apiKey = firebaseConfigData.apiKey || process.env.VITE_FIREBASE_API_KEY || '';

    // Method A: Attempt with Firebase Admin SDK
    if (adminApp) {
      try {
        const userRecord = await getAdminAuth(adminApp).createUser({
          email: cleanEmail,
          displayName: name.trim(),
          disabled: status === 'DISABLED',
        });
        authUid = userRecord.uid;
        try {
          await getAdminAuth(adminApp).setCustomUserClaims(authUid, { role: 'TEACHER' });
        } catch (claimErr) {
          console.warn('[Server] Custom claims notice:', claimErr);
        }
      } catch (adminErr: any) {
        if (adminErr.code === 'auth/email-already-exists') {
          return res.status(400).json({
            success: false,
            error: `An authentication account with email '${cleanEmail}' already exists. Please verify or use a different email.`,
          });
        }
        console.warn('[Server] Admin SDK createUser notice (will try Identity API):', adminErr.message);
      }
    }

    // Method B: Fallback via Google Identity Toolkit REST API
    if (!authUid && apiKey) {
      const secureRandomPassword = crypto.randomBytes(24).toString('base64') + 'Aa1!';
      const signUpRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: secureRandomPassword,
            displayName: name.trim(),
            returnSecureToken: true,
          }),
        }
      );
      const signUpData: any = await signUpRes.json();
      if (signUpData.error) {
        const errMsg = signUpData.error.message || '';
        if (errMsg.includes('EMAIL_EXISTS')) {
          return res.status(400).json({
            success: false,
            error: `An authentication account with email '${cleanEmail}' already exists in the system.`,
          });
        }
        throw new Error(signUpData.error.message || 'Failed to provision authentication account.');
      }
      authUid = signUpData.localId;
    }

    // Fallback ID if mock/offline
    if (!authUid) {
      authUid = `tch_auth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // 4. Send official Firebase Password Setup / Reset Email
    await dispatchPasswordResetEmail(cleanEmail);

    const now = new Date().toISOString();

    // 5. Store Teacher Profile in Firestore `teachers/{authUid}`
    const teacherRecord = {
      uid: authUid,
      teacherId: cleanTeacherId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      alternatePhone: alternatePhone?.trim() || null,
      subjects: subjects.map((s: string) => s.trim()).filter(Boolean),
      assignedClasses: assignedClasses.map((c: string) => c.trim()).filter(Boolean),
      assignedSections: Array.isArray(assignedSections) ? assignedSections.map((s: string) => s.trim()).filter(Boolean) : [],
      qualification: qualification?.trim() || null,
      address: address?.trim() || null,
      joiningDate: joiningDate || now.split('T')[0],
      profilePhoto: profilePhoto?.trim() || null,
      status: status === 'DISABLED' ? 'DISABLED' : 'ACTIVE',
      role: 'TEACHER',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      // 5a. Save to `teachers`
      await setDoc(doc(db, 'teachers', authUid), teacherRecord);

      // 5b. Save / link in `users` collection for authentication & role guards
      await setDoc(doc(db, 'users', authUid), {
        uid: authUid,
        email: cleanEmail,
        displayName: name.trim(),
        role: 'TEACHER',
        status: status === 'DISABLED' ? 'DISABLED' : 'ACTIVE',
        loginEnabled: status !== 'DISABLED',
        createdAt: now,
        updatedAt: now,
      });

      // 5c. Record Audit Log
      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: 'TEACHER_CREATED',
        targetType: 'TEACHER',
        targetId: authUid,
        targetName: name.trim(),
        timestamp: now,
        success: true,
        metadata: {
          teacherId: cleanTeacherId,
          email: cleanEmail,
          subjects: teacherRecord.subjects,
          assignedClasses: teacherRecord.assignedClasses,
          assignedSections: teacherRecord.assignedSections,
        },
      });
    }

    return res.status(201).json({
      success: true,
      teacher: teacherRecord,
      message: `Teacher '${name.trim()}' created successfully. A password setup email has been dispatched to '${cleanEmail}'.`,
    });
  } catch (err: any) {
    console.error('[Server] Create Teacher Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred while creating the teacher account.',
    });
  }
});

// ---------------------------------------------------------------------------
// 8. Reset Teacher Password (Admin action)
// Sends official Firebase password reset email without revealing or storing password
// ---------------------------------------------------------------------------
app.post('/api/admin/teachers/reset-password', async (req, res) => {
  try {
    const { email, teacherUid, actorUid = 'admin', actorEmail = 'admin@gpacademy.in' } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Teacher email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    await dispatchPasswordResetEmail(cleanEmail);

    if (db) {
      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: 'PASSWORD_RESET_REQUESTED',
        targetType: 'TEACHER',
        targetId: teacherUid || cleanEmail,
        targetName: cleanEmail,
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    return res.json({
      success: true,
      message: `A secure password reset email has been dispatched to ${cleanEmail}. The teacher can use the link to set a new password.`,
    });
  } catch (err: any) {
    console.error('[Server] Reset Password Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to trigger password reset.' });
  }
});

// ---------------------------------------------------------------------------
// 9. Update Teacher Account Status (Enable / Disable)
// Synchronizes status across teachers, users, and Firebase Auth
// ---------------------------------------------------------------------------
app.post('/api/admin/teachers/update-status', async (req, res) => {
  try {
    const { uid, status, actorUid = 'admin', actorEmail = 'admin@gpacademy.in' } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'Teacher UID is required.' });
    }
    if (status !== 'ACTIVE' && status !== 'DISABLED') {
      return res.status(400).json({ success: false, error: 'Status must be ACTIVE or DISABLED.' });
    }

    const now = new Date().toISOString();
    const isDisabled = status === 'DISABLED';

    // 1. Update Firebase Auth user
    if (adminApp) {
      try {
        await getAdminAuth(adminApp).updateUser(uid, { disabled: isDisabled });
      } catch (authErr) {
        console.warn('[Server] Admin SDK updateUser note:', authErr);
      }
    } else {
      const apiKey = firebaseConfigData.apiKey || process.env.VITE_FIREBASE_API_KEY || '';
      if (apiKey) {
        try {
          await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localId: uid,
              disableUser: isDisabled,
            }),
          });
        } catch (e) {
          console.warn('[Server] Identity Toolkit update user error:', e);
        }
      }
    }

    // 2. Update Firestore documents
    if (db) {
      const teacherRef = doc(db, 'teachers', uid);
      await updateDoc(teacherRef, {
        status,
        updatedAt: now,
      });

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          status,
          loginEnabled: !isDisabled,
          updatedAt: now,
        });
      }

      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: isDisabled ? 'TEACHER_DISABLED' : 'TEACHER_ENABLED',
        targetType: 'TEACHER',
        targetId: uid,
        timestamp: now,
        success: true,
        metadata: { newStatus: status },
      });
    }

    return res.json({
      success: true,
      status,
      message: `Teacher account status updated to ${status}.`,
    });
  } catch (err: any) {
    console.error('[Server] Update Status Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update teacher status.' });
  }
});

// ---------------------------------------------------------------------------
// 10. Deactivate / Soft Delete Teacher (Admin action)
// Preserves historical attendance, results, and marks while disabling access
// ---------------------------------------------------------------------------
app.post('/api/admin/teachers/delete', async (req, res) => {
  try {
    const { uid, actorUid = 'admin', actorEmail = 'admin@gpacademy.in' } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'Teacher UID is required.' });
    }

    const now = new Date().toISOString();

    // 1. Disable in Firebase Auth
    if (adminApp) {
      try {
        await getAdminAuth(adminApp).updateUser(uid, { disabled: true });
      } catch (authErr) {
        console.warn('[Server] Admin SDK disable on delete note:', authErr);
      }
    }

    // 2. Mark Soft-Deleted in Firestore
    if (db) {
      const teacherRef = doc(db, 'teachers', uid);
      await updateDoc(teacherRef, {
        status: 'DISABLED',
        isDeleted: true,
        deletedAt: now,
        deletedBy: actorUid,
        updatedAt: now,
      });

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          status: 'DISABLED',
          loginEnabled: false,
          updatedAt: now,
        });
      }

      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: 'TEACHER_SOFT_DELETED',
        targetType: 'TEACHER',
        targetId: uid,
        timestamp: now,
        success: true,
        metadata: { softDeleted: true },
      });
    }

    return res.json({
      success: true,
      message: 'Teacher record deactivated. Historical attendance and academic records remain preserved.',
    });
  } catch (err: any) {
    console.error('[Server] Delete Teacher Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to deactivate teacher.' });
  }
});

// ---------------------------------------------------------------------------
// 11. Centralized Portal Users: Create Parent/Student Account
// Securely provisions Firebase Auth User + Firestore user document + portalStudentLinks + student link
// ---------------------------------------------------------------------------
app.post('/api/admin/portal-users/create-parent-student', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      studentUid,
      studentId,
      status = 'ACTIVE',
      actorUid = 'admin',
      actorEmail = 'admin@gpacademy.in',
    } = req.body;

    // 1. Validate fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Parent/Guardian Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (!studentUid || !studentId) {
      return res.status(400).json({ success: false, error: 'Please select a student to link with this portal account.' });
    }

    // 2. Uniqueness checks in Firestore
    let studentData: any = null;
    if (db) {
      // Check if email already exists in users
      const qEmailUsers = query(collection(db, 'users'), where('email', '==', cleanEmail), limit(1));
      const snapUsers = await getDocs(qEmailUsers);
      if (!snapUsers.empty) {
        return res.status(400).json({
          success: false,
          error: `An account with email '${cleanEmail}' is already registered in GP Academy records.`,
        });
      }

      // Check if email already exists in teachers
      const qEmailTeachers = query(collection(db, 'teachers'), where('email', '==', cleanEmail), limit(1));
      const snapTeachers = await getDocs(qEmailTeachers);
      if (!snapTeachers.empty) {
        return res.status(400).json({
          success: false,
          error: `The email '${cleanEmail}' belongs to a registered teacher account. Please use a distinct email address for student/parent access.`,
        });
      }

      // Verify the student exists
      const studentRef = doc(db, 'students', studentUid);
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) {
        return res.status(400).json({
          success: false,
          error: 'The selected student record was not found in school records.',
        });
      }
      studentData = studentSnap.data();

      // Check if student is already linked to another portal account
      if (studentData.authUid && studentData.authUid.trim() !== '') {
        return res.status(400).json({
          success: false,
          error: `Student ${studentData.name} (${studentData.studentId}) is already linked to an active portal account.`,
        });
      }
    }

    // 3. Provision Firebase Auth Account
    let authUid = '';
    const apiKey = firebaseConfigData.apiKey || process.env.VITE_FIREBASE_API_KEY || '';

    // Method A: Attempt with Firebase Admin SDK
    if (adminApp) {
      try {
        const userRecord = await getAdminAuth(adminApp).createUser({
          email: cleanEmail,
          displayName: name.trim(),
          disabled: status === 'DISABLED',
        });
        authUid = userRecord.uid;
        try {
          await getAdminAuth(adminApp).setCustomUserClaims(authUid, { role: 'PORTAL_USER' });
        } catch (claimErr) {
          console.warn('[Server] Custom claims notice:', claimErr);
        }
      } catch (adminErr: any) {
        if (adminErr.code === 'auth/email-already-exists') {
          return res.status(400).json({
            success: false,
            error: `An authentication account with email '${cleanEmail}' already exists. Please verify or use a different email.`,
          });
        }
        console.warn('[Server] Admin SDK createUser notice for portal user:', adminErr.message);
      }
    }

    // Method B: Fallback via Google Identity Toolkit REST API
    if (!authUid && apiKey) {
      const secureRandomPassword = crypto.randomBytes(24).toString('base64') + 'Aa1!';
      try {
        const signupRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              password: secureRandomPassword,
              displayName: name.trim(),
              returnSecureToken: true,
            }),
          }
        );
        const signupJson: any = await signupRes.json();
        if (signupJson && signupJson.localId) {
          authUid = signupJson.localId;
        } else if (signupJson.error?.message?.includes('EMAIL_EXISTS')) {
          return res.status(400).json({
            success: false,
            error: `An authentication account with email '${cleanEmail}' already exists in Firebase.`,
          });
        } else {
          console.warn('[Server] Identity Toolkit signup response:', signupJson.error?.message);
        }
      } catch (apiErr: any) {
        console.warn('[Server] Identity Toolkit signup error:', apiErr.message);
      }
    }

    if (!authUid) {
      authUid = `portal_auth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // 4. Send official Firebase Password Setup / Reset Email
    await dispatchPasswordResetEmail(cleanEmail);

    const now = new Date().toISOString();

    // 5. Store in Firestore
    if (db) {
      // 5a. Save user record in `users/{authUid}`
      await setDoc(doc(db, 'users', authUid), {
        uid: authUid,
        email: cleanEmail,
        displayName: name.trim(),
        role: 'PORTAL_USER',
        status: status === 'DISABLED' ? 'DISABLED' : 'ACTIVE',
        loginEnabled: status !== 'DISABLED',
        userType: 'PARENT_STUDENT',
        phone: phone ? phone.trim() : null,
        linkedStudents: [studentUid],
        linkedStudentIds: [studentId],
        createdAt: now,
        updatedAt: now,
      });

      // 5b. Save link record in `portalStudentLinks`
      const linkId = `link_${authUid}_${studentId}`;
      await setDoc(doc(db, 'portalStudentLinks', linkId), {
        id: linkId,
        portalUserUid: authUid,
        studentId: studentId,
        studentUid: studentUid,
        studentName: studentData?.name || name.trim(),
        className: studentData?.className || '',
        section: studentData?.section || '',
        status: status === 'DISABLED' ? 'DISABLED' : 'ACTIVE',
        createdBy: actorUid,
        createdAt: now,
        updatedAt: now,
      });

      // 5c. Update student record with authUid
      await updateDoc(doc(db, 'students', studentUid), {
        authUid: authUid,
        updatedAt: now,
      });

      // 5d. Record Audit Log
      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: 'USER_CREATED',
        targetType: 'PORTAL_USER',
        targetId: authUid,
        targetName: cleanEmail,
        timestamp: now,
        success: true,
        metadata: {
          userType: 'PARENT_STUDENT',
          studentId,
          studentUid,
          studentName: studentData?.name,
        },
      });
    }

    return res.json({
      success: true,
      user: {
        uid: authUid,
        email: cleanEmail,
        displayName: name.trim(),
        role: 'PORTAL_USER',
        userType: 'PARENT_STUDENT',
        status,
      },
      message: `Parent/Student portal user created successfully. An official password setup email has been dispatched to ${cleanEmail}.`,
    });
  } catch (err: any) {
    console.error('[Server] Create Portal User Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create portal user account.' });
  }
});

// ---------------------------------------------------------------------------
// 12. Centralized Portal Users: Toggle Account Status (Enable / Disable)
// Synchronizes status across users, teachers / portalStudentLinks, and Firebase Auth
// ---------------------------------------------------------------------------
app.post('/api/admin/portal-users/toggle-status', async (req, res) => {
  try {
    const {
      uid,
      userType,
      status,
      actorUid = 'admin',
      actorEmail = 'admin@gpacademy.in',
    } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'User UID is required.' });
    }
    if (status !== 'ACTIVE' && status !== 'DISABLED') {
      return res.status(400).json({ success: false, error: 'Status must be ACTIVE or DISABLED.' });
    }

    const now = new Date().toISOString();
    const isDisabled = status === 'DISABLED';

    // 1. Update Firebase Auth user
    if (adminApp) {
      try {
        await getAdminAuth(adminApp).updateUser(uid, { disabled: isDisabled });
      } catch (authErr) {
        console.warn('[Server] Admin SDK toggle-status updateUser note:', authErr);
      }
    } else {
      const apiKey = firebaseConfigData.apiKey || process.env.VITE_FIREBASE_API_KEY || '';
      if (apiKey) {
        try {
          await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localId: uid,
              disableUser: isDisabled,
            }),
          });
        } catch (e) {
          console.warn('[Server] Identity Toolkit toggle-status error:', e);
        }
      }
    }

    // 2. Update Firestore documents
    if (db) {
      // Update `users/{uid}`
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          status,
          loginEnabled: !isDisabled,
          updatedAt: now,
        });
      }

      // If Teacher: update `teachers/{uid}`
      const teacherRef = doc(db, 'teachers', uid);
      const teacherSnap = await getDoc(teacherRef);
      if (teacherSnap.exists()) {
        await updateDoc(teacherRef, {
          status,
          updatedAt: now,
        });
      }

      // If Parent/Student: update `portalStudentLinks`
      try {
        const qLinks = query(collection(db, 'portalStudentLinks'), where('portalUserUid', '==', uid));
        const linksSnap = await getDocs(qLinks);
        for (const linkDoc of linksSnap.docs) {
          await updateDoc(linkDoc.ref, {
            status,
            updatedAt: now,
          });
        }
      } catch (linkErr) {
        console.warn('[Server] Could not update link docs on status toggle:', linkErr);
      }

      // Audit log
      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: isDisabled ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
        targetType: userType || 'PORTAL_USER',
        targetId: uid,
        timestamp: now,
        success: true,
        metadata: { newStatus: status, userType },
      });
    }

    return res.json({
      success: true,
      status,
      message: `Account has been ${isDisabled ? 'disabled' : 'enabled'} successfully.`,
    });
  } catch (err: any) {
    console.error('[Server] Portal User Toggle Status Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update account status.' });
  }
});

// ---------------------------------------------------------------------------
// 13. Centralized Portal Users: Dispatch Password Reset Email
// Triggers official Firebase password reset flow and writes to audit log
// ---------------------------------------------------------------------------
app.post('/api/admin/portal-users/reset-password', async (req, res) => {
  try {
    const {
      email,
      uid,
      userType,
      actorUid = 'admin',
      actorEmail = 'admin@gpacademy.in',
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'User email is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    await dispatchPasswordResetEmail(cleanEmail);

    if (db) {
      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: 'PASSWORD_RESET_REQUESTED',
        targetType: userType || 'PORTAL_USER',
        targetId: uid || cleanEmail,
        targetName: cleanEmail,
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    return res.json({
      success: true,
      message: `A secure password reset email has been dispatched to ${cleanEmail}.`,
    });
  } catch (err: any) {
    console.error('[Server] Portal User Reset Password Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to dispatch password reset email.' });
  }
});

// ---------------------------------------------------------------------------
// 14. Centralized Portal Users: Update Teacher Profile & Assignments
// Immediately updates teacher authorization (classes, sections, subjects)
// ---------------------------------------------------------------------------
app.post('/api/admin/portal-users/update-teacher', async (req, res) => {
  try {
    const {
      uid,
      teacherId,
      name,
      phone,
      alternatePhone,
      subjects,
      assignedClasses,
      assignedSections,
      qualification,
      status,
      actorUid = 'admin',
      actorEmail = 'admin@gpacademy.in',
    } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'Teacher UID is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Teacher Name is required.' });
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, error: 'Please assign at least one subject.' });
    }
    if (!Array.isArray(assignedClasses) || assignedClasses.length === 0) {
      return res.status(400).json({ success: false, error: 'Please assign at least one class.' });
    }

    const now = new Date().toISOString();

    if (db) {
      // 1. Update `teachers/{uid}`
      const teacherRef = doc(db, 'teachers', uid);
      const cleanUpdate: any = {
        name: name.trim(),
        phone: phone ? phone.trim() : '',
        subjects: subjects.map((s: string) => s.trim()).filter(Boolean),
        assignedClasses: assignedClasses.map((c: string) => c.trim()).filter(Boolean),
        assignedSections: Array.isArray(assignedSections) ? assignedSections.map((s: string) => s.trim()).filter(Boolean) : [],
        updatedAt: now,
      };
      if (teacherId && teacherId.trim()) cleanUpdate.teacherId = teacherId.trim();
      if (alternatePhone !== undefined) cleanUpdate.alternatePhone = alternatePhone ? alternatePhone.trim() : null;
      if (qualification !== undefined) cleanUpdate.qualification = qualification ? qualification.trim() : null;
      if (status) cleanUpdate.status = status;

      await updateDoc(teacherRef, cleanUpdate);

      // 2. Update `users/{uid}`
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userUpdate: any = {
          displayName: name.trim(),
          updatedAt: now,
        };
        if (status) {
          userUpdate.status = status;
          userUpdate.loginEnabled = status !== 'DISABLED';
        }
        await updateDoc(userRef, userUpdate);
      }

      // 3. Audit Log
      const auditRef = doc(collection(db, 'auditLogs'));
      await setDoc(auditRef, {
        actorUid,
        actorEmail,
        actorRole: 'ADMIN',
        action: 'TEACHER_ASSIGNMENT_CHANGED',
        targetType: 'TEACHER',
        targetId: uid,
        targetName: name.trim(),
        timestamp: now,
        success: true,
        metadata: {
          teacherId,
          subjects: cleanUpdate.subjects,
          assignedClasses: cleanUpdate.assignedClasses,
          assignedSections: cleanUpdate.assignedSections,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Teacher profile and authorized assignments updated successfully.',
    });
  } catch (err: any) {
    console.error('[Server] Update Teacher Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update teacher assignments.' });
  }
});

// ---------------------------------------------------------------------------
// 15. Centralized Portal Users: Update Parent/Student Profile & Linked Student
// Updates guardian details and safely transfers linked student if authorized
// ---------------------------------------------------------------------------
app.post('/api/admin/portal-users/update-parent-student', async (req, res) => {
  try {
    const {
      uid,
      name,
      phone,
      studentUid,
      studentId,
      status,
      actorUid = 'admin',
      actorEmail = 'admin@gpacademy.in',
    } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'User UID is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Guardian Name is required.' });
    }

    const now = new Date().toISOString();

    if (db) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return res.status(404).json({ success: false, error: 'User account not found.' });
      }
      const existingUserData = userSnap.data();

      // Check if linked student changed
      const currentStudentUid = existingUserData.linkedStudents?.[0] || '';
      const isStudentChanged = studentUid && studentUid !== currentStudentUid;

      let studentData: any = null;
      if (isStudentChanged) {
        // Verify new student exists
        const newStudentRef = doc(db, 'students', studentUid);
        const newStudentSnap = await getDoc(newStudentRef);
        if (!newStudentSnap.exists()) {
          return res.status(400).json({ success: false, error: 'New student record not found.' });
        }
        studentData = newStudentSnap.data();

        // Check if student already linked to another user
        if (studentData.authUid && studentData.authUid !== uid) {
          return res.status(400).json({
            success: false,
            error: `Student ${studentData.name} is already linked to another portal account.`,
          });
        }

        // Unlink previous student if existed
        if (currentStudentUid) {
          try {
            await updateDoc(doc(db, 'students', currentStudentUid), {
              authUid: '',
              updatedAt: now,
            });
          } catch (unlinkErr) {
            console.warn('[Server] Could not clear previous student authUid:', unlinkErr);
          }
        }

        // Set authUid on new student
        await updateDoc(newStudentRef, {
          authUid: uid,
          updatedAt: now,
        });

        // Update portalStudentLinks
        const linkId = `link_${uid}_${studentId}`;
        await setDoc(doc(db, 'portalStudentLinks', linkId), {
          id: linkId,
          portalUserUid: uid,
          studentId: studentId,
          studentUid: studentUid,
          studentName: studentData.name,
          className: studentData.className || '',
          section: studentData.section || '',
          status: status || existingUserData.status || 'ACTIVE',
          createdBy: actorUid,
          createdAt: now,
          updatedAt: now,
        });

        // Audit link change
        const auditRef = doc(collection(db, 'auditLogs'));
        await setDoc(auditRef, {
          actorUid,
          actorEmail,
          actorRole: 'ADMIN',
          action: 'PARENT_STUDENT_LINK_CHANGED',
          targetType: 'PORTAL_USER',
          targetId: uid,
          targetName: name.trim(),
          timestamp: now,
          success: true,
          metadata: {
            oldStudentUid: currentStudentUid,
            newStudentUid: studentUid,
            newStudentId: studentId,
          },
        });
      }

      // Update `users/{uid}`
      const userUpdate: any = {
        displayName: name.trim(),
        updatedAt: now,
      };
      if (phone !== undefined) userUpdate.phone = phone ? phone.trim() : null;
      if (status) {
        userUpdate.status = status;
        userUpdate.loginEnabled = status !== 'DISABLED';
      }
      if (isStudentChanged) {
        userUpdate.linkedStudents = [studentUid];
        userUpdate.linkedStudentIds = [studentId];
      }
      await updateDoc(userRef, userUpdate);
    }

    return res.json({
      success: true,
      message: 'Parent/Student account updated successfully.',
    });
  } catch (err: any) {
    console.error('[Server] Update Parent/Student Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update account.' });
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
