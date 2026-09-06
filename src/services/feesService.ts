import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { studentService } from './studentService';
import { auditService } from './auditService';
import {
  FeeStructure,
  PaymentRecord,
  StudentFeeSummary,
  StudentFeeRecord,
  PaymentReceipt,
  RefundRecord,
  FeesDashboardStats,
  FeeFilters,
  calculateFeeStatus
} from '../types/fees';

const FEE_STRUCTURES_COLLECTION = 'feeStructures';
const PAYMENTS_COLLECTION = 'payments';
const STUDENT_FEES_COLLECTION = 'studentFees';
const REFUNDS_COLLECTION = 'refunds';

export const PAYMENT_GATEWAY_CONFIG = {
  enabled: false, // Gateway disabled by default; auto-detected from /api/payment/config
  defaultGateway: 'Razorpay',
};

export const feesService = {
  /**
   * Check if online payment gateway is configured on backend
   */
  async getPaymentGatewayConfig(): Promise<{
    configured: boolean;
    keyId: string | null;
    message: string;
    mode?: string;
  }> {
    try {
      const res = await fetch('/api/payment/config');
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.warn('Note: Could not reach payment config endpoint:', error);
    }
    return {
      configured: false,
      keyId: null,
      message: 'Online payment is currently being configured. Please contact the school office for payment assistance.',
    };
  },

  /**
   * Synchronous check fallback
   */
  isPaymentGatewayEnabled(): boolean {
    return PAYMENT_GATEWAY_CONFIG.enabled;
  },

  /**
   * Initialize backend Razorpay Order
   */
  async createRazorpayOrder(params: {
    feeId: string;
    studentId: string;
    amount: number;
    studentName?: string;
    notes?: Record<string, string>;
  }): Promise<{
    success: boolean;
    configured?: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    error?: string;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err: any) {
      console.error('Error contacting create-order API:', err);
      return {
        success: false,
        error: err.message || 'Network error while initiating payment.',
      };
    }
  },

  /**
   * Verify Razorpay Payment Signature on Server
   */
  async verifyRazorpayPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    feeId: string;
    studentId: string;
    studentUid?: string;
    amount: number;
    studentName?: string;
    className?: string;
    section?: string;
  }): Promise<{
    success: boolean;
    verified?: boolean;
    duplicate?: boolean;
    paymentId?: string;
    receiptNumber?: string;
    error?: string;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err: any) {
      console.error('Error contacting verify API:', err);
      return {
        success: false,
        verified: false,
        error: err.message || 'Network error while verifying payment.',
      };
    }
  },

  // =========================================================================
  // INDIVIDUAL STUDENT FEES MODULE (Requirement 2, 3, 4, 5)
  // =========================================================================

  /**
   * Get all individual student fees with optional filters
   */
  async getStudentFees(filters?: FeeFilters): Promise<StudentFeeRecord[]> {
    try {
      const snapshot = await getDocs(collection(db, STUDENT_FEES_COLLECTION));
      let fees: StudentFeeRecord[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Dynamically evaluate overdue status if dueDate has passed and pending > 0
        const calc = calculateFeeStatus(data.amount, data.paidAmount, data.dueDate, data.status);
        fees.push({
          id: docSnap.id,
          studentId: data.studentId || '',
          studentUid: data.studentUid || '',
          studentName: data.studentName || '',
          class: data.class || data.className || '',
          className: data.class || data.className || '',
          section: data.section || 'A',
          academicYear: data.academicYear || '2026-2027',
          feeMonth: data.feeMonth || 'April 2026',
          feeType: data.feeType || 'Tuition Fee',
          amount: Number(data.amount) || 0,
          dueDate: data.dueDate || '',
          status: calc.status,
          paidAmount: calc.paidAmount,
          pendingAmount: calc.pendingAmount,
          paymentMethod: data.paymentMethod,
          paymentId: data.paymentId,
          orderId: data.orderId,
          receiptId: data.receiptId,
          paidAt: data.paidAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // Filter in-memory
      if (filters?.class || filters?.className) {
        const c = (filters.class || filters.className || '').toLowerCase();
        fees = fees.filter((f) => f.class.toLowerCase() === c || f.className?.toLowerCase() === c);
      }
      if (filters?.section) {
        fees = fees.filter((f) => f.section.toUpperCase() === filters.section?.toUpperCase());
      }
      if (filters?.feeMonth && filters.feeMonth !== 'ALL') {
        fees = fees.filter((f) => f.feeMonth.toLowerCase() === filters.feeMonth?.toLowerCase());
      }
      if (filters?.academicYear && filters.academicYear !== 'ALL') {
        fees = fees.filter((f) => f.academicYear === filters.academicYear);
      }
      if (filters?.status && filters.status !== 'ALL') {
        fees = fees.filter((f) => f.status === filters.status);
      }
      if (filters?.feeType && filters.feeType !== 'ALL') {
        fees = fees.filter((f) => f.feeType === filters.feeType);
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        fees = fees.filter(
          (f) =>
            f.studentName.toLowerCase().includes(q) ||
            f.studentId.toLowerCase().includes(q) ||
            f.feeMonth.toLowerCase().includes(q)
        );
      }

      return fees.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (error) {
      console.warn('Warning/offline fetching student fees:', error);
      return [];
    }
  },

  /**
   * Get student fees for a specific student UID
   */
  async getStudentFeesByStudentUid(studentUid: string): Promise<StudentFeeRecord[]> {
    try {
      const q = query(collection(db, STUDENT_FEES_COLLECTION), where('studentUid', '==', studentUid));
      const snapshot = await getDocs(q);
      const list: StudentFeeRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const calc = calculateFeeStatus(data.amount, data.paidAmount, data.dueDate, data.status);
        list.push({
          id: docSnap.id,
          studentId: data.studentId,
          studentUid: data.studentUid,
          studentName: data.studentName,
          class: data.class || data.className,
          className: data.class || data.className,
          section: data.section,
          academicYear: data.academicYear,
          feeMonth: data.feeMonth,
          feeType: data.feeType,
          amount: Number(data.amount) || 0,
          dueDate: data.dueDate,
          status: calc.status,
          paidAmount: calc.paidAmount,
          pendingAmount: calc.pendingAmount,
          paymentMethod: data.paymentMethod,
          paymentId: data.paymentId,
          orderId: data.orderId,
          receiptId: data.receiptId,
          paidAt: data.paidAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      return list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    } catch (err) {
      console.warn('Warning loading student fees by UID:', err);
      return [];
    }
  },

  /**
   * Get student fees for a specific student Institutional ID (e.g. GP20260001)
   */
  async getStudentFeesByStudentId(studentId: string): Promise<StudentFeeRecord[]> {
    try {
      const q = query(collection(db, STUDENT_FEES_COLLECTION), where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      const list: StudentFeeRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const calc = calculateFeeStatus(data.amount, data.paidAmount, data.dueDate, data.status);
        list.push({
          id: docSnap.id,
          studentId: data.studentId,
          studentUid: data.studentUid,
          studentName: data.studentName,
          class: data.class || data.className,
          className: data.class || data.className,
          section: data.section,
          academicYear: data.academicYear,
          feeMonth: data.feeMonth,
          feeType: data.feeType,
          amount: Number(data.amount) || 0,
          dueDate: data.dueDate,
          status: calc.status,
          paidAmount: calc.paidAmount,
          pendingAmount: calc.pendingAmount,
          paymentMethod: data.paymentMethod,
          paymentId: data.paymentId,
          orderId: data.orderId,
          receiptId: data.receiptId,
          paidAt: data.paidAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      return list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    } catch (err) {
      console.warn('Warning loading student fees by ID:', err);
      return [];
    }
  },

  /**
   * Create an individual Student Fee assessment
   */
  async createStudentFee(
    payload: Omit<StudentFeeRecord, 'id' | 'createdAt' | 'updatedAt' | 'pendingAmount' | 'status'> & {
      status?: any;
    },
    actorUid?: string
  ): Promise<string> {
    try {
      const now = new Date().toISOString();
      const calc = calculateFeeStatus(payload.amount, payload.paidAmount || 0, payload.dueDate, payload.status);

      const feeData = {
        studentId: payload.studentId,
        studentName: payload.studentName,
        class: payload.class || payload.className || '',
        className: payload.class || payload.className || '',
        section: payload.section || 'A',
        academicYear: payload.academicYear || '2026-2027',
        feeMonth: payload.feeMonth,
        feeType: payload.feeType,
        amount: Number(payload.amount),
        dueDate: payload.dueDate,
        status: calc.status,
        paidAmount: calc.paidAmount,
        pendingAmount: calc.pendingAmount,
        studentUid: payload.studentUid || '',
        paymentMethod: payload.paymentMethod || '',
        paymentId: payload.paymentId || '',
        orderId: payload.orderId || '',
        receiptId: payload.receiptId || '',
        paidAt: payload.paidAt || '',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, STUDENT_FEES_COLLECTION), feeData);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_CREATED',
          targetType: 'FEE',
          targetId: docRef.id,
          targetName: `${payload.studentName} - ${payload.feeMonth} (${payload.feeType})`,
          success: true,
          metadata: {
            amount: payload.amount,
            status: calc.status,
            studentId: payload.studentId,
          },
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating student fee:', error);
      handleFirestoreError(error, OperationType.CREATE, STUDENT_FEES_COLLECTION);
      throw error;
    }
  },

  /**
   * Update an existing Student Fee record
   */
  async updateStudentFee(
    id: string,
    payload: Partial<StudentFeeRecord>,
    actorUid?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, STUDENT_FEES_COLLECTION, id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        throw new Error('Fee record not found.');
      }

      const current = existing.data();
      const amount = payload.amount !== undefined ? Number(payload.amount) : Number(current.amount);
      const paidAmount = payload.paidAmount !== undefined ? Number(payload.paidAmount) : Number(current.paidAmount || 0);
      const dueDate = payload.dueDate !== undefined ? payload.dueDate : current.dueDate;
      const statusInput = payload.status !== undefined ? payload.status : current.status;

      const calc = calculateFeeStatus(amount, paidAmount, dueDate, statusInput);

      const updateData: any = {
        ...payload,
        amount,
        paidAmount: calc.paidAmount,
        pendingAmount: calc.pendingAmount,
        status: calc.status,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updateData);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_UPDATED',
          targetType: 'FEE',
          targetId: id,
          targetName: `${current.studentName} - ${current.feeMonth}`,
          success: true,
          metadata: {
            updatedFields: Object.keys(payload),
            newStatus: calc.status,
          },
        });
      }
    } catch (error) {
      console.error('Error updating student fee:', error);
      handleFirestoreError(error, OperationType.UPDATE, `${STUDENT_FEES_COLLECTION}/${id}`);
      throw error;
    }
  },

  /**
   * Delete an existing Student Fee record
   */
  async deleteStudentFee(id: string, actorUid?: string): Promise<void> {
    try {
      const docRef = doc(db, STUDENT_FEES_COLLECTION, id);
      await deleteDoc(docRef);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_DELETED',
          targetType: 'FEE',
          targetId: id,
          targetName: `Student Fee #${id}`,
          success: true,
        });
      }
    } catch (error) {
      console.error('Error deleting student fee:', error);
      handleFirestoreError(error, OperationType.DELETE, `${STUDENT_FEES_COLLECTION}/${id}`);
      throw error;
    }
  },

  /**
   * Fetch all Fee Structures
   */
  async getFeeStructures(): Promise<FeeStructure[]> {
    try {
      const snapshot = await getDocs(collection(db, FEE_STRUCTURES_COLLECTION));
      const structures: FeeStructure[] = [];
      snapshot.forEach((docSnap) => {
        structures.push({
          id: docSnap.id,
          ...(docSnap.data() as FeeStructure),
        });
      });
      return structures.sort((a, b) => a.className.localeCompare(b.className));
    } catch (error) {
      console.warn('Warning/offline fetching fee structures:', error);
      return [];
    }
  },

  /**
   * Save a new Fee Structure
   */
  async createFeeStructure(payload: Omit<FeeStructure, 'id'>, actorUid?: string): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, FEE_STRUCTURES_COLLECTION), {
        ...payload,
        createdAt: now,
        updatedAt: now,
      });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_STRUCTURE_CREATED',
          targetType: 'FEE',
          targetId: docRef.id,
          targetName: `${payload.feeType} - Class ${payload.className}`,
          success: true,
          metadata: {
            amount: payload.amount,
            className: payload.className,
          },
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating fee structure:', error);
      handleFirestoreError(error, OperationType.CREATE, FEE_STRUCTURES_COLLECTION);
      throw error;
    }
  },

  /**
   * Update existing Fee Structure
   */
  async updateFeeStructure(id: string, payload: Partial<FeeStructure>, actorUid?: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      const docRef = doc(db, FEE_STRUCTURES_COLLECTION, id);
      await updateDoc(docRef, {
        ...payload,
        updatedAt: now,
      });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_STRUCTURE_UPDATED',
          targetType: 'FEE',
          targetId: id,
          targetName: payload.feeType || id,
          success: true,
          metadata: {
            updatedFields: Object.keys(payload),
          },
        });
      }
    } catch (error) {
      console.error('Error updating fee structure:', error);
      handleFirestoreError(error, OperationType.UPDATE, `${FEE_STRUCTURES_COLLECTION}/${id}`);
      throw error;
    }
  },

  /**
   * Delete a Fee Structure
   */
  async deleteFeeStructure(id: string, actorUid?: string): Promise<void> {
    try {
      const docRef = doc(db, FEE_STRUCTURES_COLLECTION, id);
      await deleteDoc(docRef);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_STRUCTURE_DELETED',
          targetType: 'FEE',
          targetId: id,
          success: true,
        });
      }
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      handleFirestoreError(error, OperationType.DELETE, `${FEE_STRUCTURES_COLLECTION}/${id}`);
      throw error;
    }
  },

  /**
   * Fetch all payments with optional filtering (Requirement 19: ADMIN PAYMENT HISTORY)
   */
  async getAllPayments(filters?: FeeFilters): Promise<PaymentRecord[]> {
    try {
      const snapshot = await getDocs(collection(db, PAYMENTS_COLLECTION));
      let payments: PaymentRecord[] = [];
      snapshot.forEach((docSnap) => {
        payments.push({
          id: docSnap.id,
          ...(docSnap.data() as PaymentRecord),
        });
      });

      // Filter in-memory
      if (filters?.className || filters?.class) {
        const c = (filters.className || filters.class || '').toLowerCase();
        payments = payments.filter((p) => (p.className || '').toLowerCase() === c);
      }
      if (filters?.section) {
        payments = payments.filter((p) => (p.section || '').toUpperCase() === filters.section?.toUpperCase());
      }
      if (filters?.status && filters.status !== 'ALL') {
        payments = payments.filter((p) => {
          if (filters.status === 'SUCCESS' || filters.status === 'PAID') {
            return p.status === 'SUCCESS' || p.status === 'PAID' || !p.status;
          }
          return p.status === filters.status;
        });
      }
      if (filters?.paymentMode && filters.paymentMode !== 'ALL') {
        payments = payments.filter((p) => p.paymentMode === filters.paymentMode);
      }
      if (filters?.startDate) {
        payments = payments.filter((p) => p.paymentDate >= filters.startDate!);
      }
      if (filters?.endDate) {
        payments = payments.filter((p) => p.paymentDate <= filters.endDate!);
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        payments = payments.filter(
          (p) =>
            (p.studentName || '').toLowerCase().includes(q) ||
            (p.studentId || '').toLowerCase().includes(q) ||
            (p.receiptNumber || '').toLowerCase().includes(q) ||
            (p.razorpayPaymentId || '').toLowerCase().includes(q) ||
            (p.razorpayOrderId || '').toLowerCase().includes(q)
        );
      }

      return payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching payments:', error);
      return [];
    }
  },

  /**
   * Fetch all refunds
   */
  async getRefunds(): Promise<RefundRecord[]> {
    try {
      const snapshot = await getDocs(collection(db, REFUNDS_COLLECTION));
      const refunds: RefundRecord[] = [];
      snapshot.forEach((docSnap) => {
        refunds.push({
          id: docSnap.id,
          ...(docSnap.data() as RefundRecord),
        });
      });
      return refunds.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (e) {
      console.warn('Warning/offline fetching refunds:', e);
      return [];
    }
  },

  /**
   * Record a refund
   */
  async createRefund(
    payload: {
      paymentId: string;
      feeId?: string;
      studentId: string;
      studentName?: string;
      amount: number;
      reason: string;
    },
    actorUid?: string
  ): Promise<string> {
    try {
      const refundId = `RFD-${Date.now().toString().slice(-8)}`;
      const now = new Date().toISOString();

      const docRef = await addDoc(collection(db, REFUNDS_COLLECTION), {
        refundId,
        paymentId: payload.paymentId,
        feeId: payload.feeId || '',
        studentId: payload.studentId,
        studentName: payload.studentName || '',
        amount: Number(payload.amount),
        reason: payload.reason,
        status: 'PROCESSED',
        processedBy: actorUid || 'Admin',
        createdAt: now,
      });

      // Also adjust student fee if feeId exists
      if (payload.feeId) {
        const feeDoc = doc(db, STUDENT_FEES_COLLECTION, payload.feeId);
        const snap = await getDoc(feeDoc);
        if (snap.exists()) {
          const feeData = snap.data();
          const currentPaid = Number(feeData.paidAmount) || 0;
          const totalFee = Number(feeData.amount) || 0;
          const newPaid = Math.max(0, currentPaid - Number(payload.amount));
          const newPending = Math.max(0, totalFee - newPaid);
          const newStatus = newPaid === 0 ? 'PENDING' : 'PARTIALLY_PAID';

          await updateDoc(feeDoc, {
            paidAmount: newPaid,
            pendingAmount: newPending,
            status: newStatus,
            updatedAt: now,
          });
        }
      }

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'FEE_REFUND_RECORDED',
          targetType: 'PAYMENT',
          targetId: payload.paymentId,
          targetName: `Refund ₹${payload.amount} for ${payload.studentName || payload.studentId}`,
          success: true,
          metadata: {
            refundId,
            amount: payload.amount,
            reason: payload.reason,
          },
        });
      }

      return docRef.id;
    } catch (err) {
      console.error('Error creating refund:', err);
      throw err;
    }
  },

  /**
   * Fetch payment history for a student
   */
  async getStudentPayments(studentUid: string): Promise<PaymentRecord[]> {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        where('studentUid', '==', studentUid)
      );
      const snapshot = await getDocs(q);
      const payments: PaymentRecord[] = [];
      snapshot.forEach((docSnap) => {
        payments.push({
          id: docSnap.id,
          ...(docSnap.data() as PaymentRecord),
        });
      });
      return payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching student payments:', error);
      return [];
    }
  },

  /**
   * Generate a unique receipt number formatted: GP-FEE-2026-XXXXX
   */
  async generateReceiptNumber(): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `GP-FEE-${currentYear}-`;

      const payments = await this.getAllPayments();
      let maxNum = 0;

      payments.forEach((p) => {
        if (p.receiptNumber && p.receiptNumber.startsWith(prefix)) {
          const numStr = p.receiptNumber.replace(prefix, '');
          const parsed = parseInt(numStr, 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        }
      });

      const nextNum = maxNum + 1;
      const formattedNum = String(nextNum).padStart(5, '0');
      return `${prefix}${formattedNum}`;
    } catch (error) {
      console.error('Error generating receipt number:', error);
      // Fallback timestamp based unique string if query fails
      return `GP-FEE-2026-${Date.now().toString().slice(-5)}`;
    }
  },

  /**
   * Record a manual payment with duplicate receipt prevention
   */
  async recordManualPayment(
    payload: Omit<PaymentRecord, 'id' | 'receiptNumber' | 'createdAt' | 'updatedAt'>,
    actorUid?: string
  ): Promise<PaymentRecord> {
    try {
      if (payload.amount <= 0) {
        throw new Error('Payment amount must be greater than zero.');
      }

      const receiptNumber = await this.generateReceiptNumber();
      const now = new Date().toISOString();

      const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
        ...payload,
        receiptNumber,
        createdAt: now,
        updatedAt: now,
      });

      // Update student fee record if feeId was provided
      if (payload.feeId) {
        try {
          const feeRef = doc(db, STUDENT_FEES_COLLECTION, payload.feeId);
          const feeSnap = await getDoc(feeRef);
          if (feeSnap.exists()) {
            const feeData = feeSnap.data();
            const currPaid = Number(feeData.paidAmount) || 0;
            const totAmt = Number(feeData.amount) || 0;
            const newPaid = currPaid + payload.amount;
            const newPending = Math.max(0, totAmt - newPaid);
            const newStatus = newPaid >= totAmt ? 'PAID' : 'PARTIALLY_PAID';
            await updateDoc(feeRef, {
              paidAmount: newPaid,
              pendingAmount: newPending,
              status: newStatus,
              paymentMethod: payload.paymentMode,
              receiptId: receiptNumber,
              paidAt: now,
              updatedAt: now,
            });
          }
        } catch (e) {
          console.warn('Note: Could not update student fee record during manual payment:', e);
        }
      }

      const record: PaymentRecord = {
        id: docRef.id,
        ...payload,
        receiptNumber,
        createdAt: now,
        updatedAt: now,
      };

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'PAYMENT_RECORDED',
          targetType: 'PAYMENT',
          targetId: docRef.id,
          targetName: `${payload.studentName} (${payload.studentId}) - ₹${payload.amount}`,
          success: true,
          metadata: {
            receiptNumber,
            amount: payload.amount,
            paymentMode: payload.paymentMode,
            paymentDate: payload.paymentDate,
          },
        });
      }

      return record;
    } catch (error) {
      console.error('Error recording manual payment:', error);
      handleFirestoreError(error, OperationType.CREATE, PAYMENTS_COLLECTION);
      throw error;
    }
  },

  /**
   * Edit/Update an existing manual payment record
   */
  async updateManualPayment(
    paymentId: string,
    payload: Partial<PaymentRecord>,
    actorUid?: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
      await updateDoc(docRef, {
        ...payload,
        updatedAt: now,
      });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'PAYMENT_RECORDED',
          targetType: 'PAYMENT',
          targetId: paymentId,
          targetName: `Updated Payment ${paymentId}`,
          success: true,
          metadata: {
            updatedFields: Object.keys(payload),
          },
        });
      }
    } catch (error) {
      console.error('Error updating manual payment:', error);
      handleFirestoreError(error, OperationType.UPDATE, `${PAYMENTS_COLLECTION}/${paymentId}`);
      throw error;
    }
  },

  /**
   * Get student fee summaries for all active students with filters
   */
  async getStudentFeeSummaries(filters?: FeeFilters): Promise<StudentFeeSummary[]> {
    try {
      const allStudents = await studentService.getStudents();
      const activeStudents = allStudents.filter((s) => s.status === 'ACTIVE');

      const feeStructures = await this.getFeeStructures();
      const activeStructures = feeStructures.filter((f) => f.status === 'ACTIVE');

      const allPayments = await this.getAllPayments();

      // Create payments map grouped by studentUid
      const paymentsByStudent = new Map<string, number>();
      allPayments.forEach((p) => {
        const current = paymentsByStudent.get(p.studentUid) || 0;
        paymentsByStudent.set(p.studentUid, current + Number(p.amount || 0));
      });

      const summaries: StudentFeeSummary[] = activeStudents.map((std) => {
        // Calculate total expected fee for student based on matching class/board fee structures
        const matchingStructures = activeStructures.filter((f) => {
          const matchClass = f.className === std.className || f.className === 'All Classes';
          const matchBoard = !f.board || f.board === 'All' || f.board === std.board;
          return matchClass && matchBoard;
        });

        // Sum matching structure amounts
        let totalFee = matchingStructures.reduce((sum, f) => sum + Number(f.amount || 0), 0);
        // Default base fee if no structure defined yet for that class (e.g. 15000)
        if (totalFee === 0) {
          totalFee = 15000;
        }

        const paidAmount = paymentsByStudent.get(std.uid) || 0;
        const pendingAmount = Math.max(0, totalFee - paidAmount);

        let status: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
        if (paidAmount >= totalFee && totalFee > 0) {
          status = 'PAID';
        } else if (paidAmount > 0) {
          status = 'PARTIAL';
        }

        return {
          studentUid: std.uid,
          studentId: std.studentId,
          studentName: std.name,
          className: std.className,
          section: std.section,
          board: std.board,
          phone: std.phone || '—',
          totalFee,
          paidAmount,
          pendingAmount,
          status,
        };
      });

      // Filter in-memory
      let filtered = summaries;

      if (filters?.className) {
        filtered = filtered.filter((s) => s.className === filters.className);
      }
      if (filters?.section) {
        filtered = filtered.filter((s) => s.section.toUpperCase() === filters.section.toUpperCase());
      }
      if (filters?.board) {
        filtered = filtered.filter((s) => s.board === filters.board);
      }
      if (filters?.feeStatus && filters.feeStatus !== 'ALL') {
        filtered = filtered.filter((s) => s.status === filters.feeStatus);
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.studentName.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q)
        );
      }

      return filtered.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } catch (error) {
      console.warn('Warning/offline fetching student fee summaries:', error);
      return [];
    }
  },

  /**
   * Get single student fee detail
   */
  async getStudentFeeDetail(studentUid: string) {
    try {
      const student = await studentService.getStudentByUid(studentUid);
      if (!student) return null;

      const payments = await this.getStudentPayments(studentUid);
      const individualFees = await this.getStudentFeesByStudentUid(studentUid);
      const feeStructures = await this.getFeeStructures();
      const activeStructures = feeStructures.filter(
        (f) =>
          f.status === 'ACTIVE' &&
          (f.className === student.className || f.className === 'All Classes') &&
          (!f.board || f.board === 'All' || f.board === student.board)
      );

      let totalFee = 0;
      let paidAmount = 0;

      if (individualFees.length > 0) {
        totalFee = individualFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
        paidAmount = individualFees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
      } else {
        totalFee = activeStructures.reduce((sum, f) => sum + Number(f.amount || 0), 0);
        if (totalFee === 0) totalFee = 15000;
        paidAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      }

      const pendingAmount = Math.max(0, totalFee - paidAmount);

      let status: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      if (paidAmount >= totalFee && totalFee > 0) status = 'PAID';
      else if (paidAmount > 0) status = 'PARTIAL';

      return {
        student,
        summary: {
          studentUid: student.uid,
          studentId: student.studentId,
          studentName: student.name,
          className: student.className,
          section: student.section,
          board: student.board,
          phone: student.phone || '—',
          totalFee,
          paidAmount,
          pendingAmount,
          status,
          fees: individualFees,
        },
        payments,
        structures: activeStructures,
        fees: individualFees,
      };
    } catch (error) {
      console.warn('Warning/offline fetching student fee detail:', error);
      return null;
    }
  },

  /**
   * Fetch Dashboard Statistics
   */
  async getFeesDashboardStats(): Promise<FeesDashboardStats> {
    try {
      const summaries = await this.getStudentFeeSummaries();

      let totalExpected = 0;
      let totalCollected = 0;
      let totalPending = 0;
      let studentsWithPending = 0;

      summaries.forEach((s) => {
        totalExpected += s.totalFee;
        totalCollected += s.paidAmount;
        totalPending += s.pendingAmount;
        if (s.pendingAmount > 0) {
          studentsWithPending++;
        }
      });

      return {
        totalExpected,
        totalCollected,
        totalPending,
        studentsWithPending,
      };
    } catch (error) {
      console.error('Error fetching fees dashboard stats:', error);
      return {
        totalExpected: 0,
        totalCollected: 0,
        totalPending: 0,
        studentsWithPending: 0,
      };
    }
  },
};
