export type FeeType =
  | 'Tuition Fee'
  | 'Admission Fee'
  | 'Annual Fee'
  | 'Exam Fee'
  | 'Transport Fee'
  | 'Other';

export type FeeFrequency =
  | 'Monthly'
  | 'Quarterly'
  | 'Half-Yearly'
  | 'Yearly'
  | 'One-Time';

export type FeeStatus = 'ACTIVE' | 'INACTIVE';

export interface FeeStructure {
  id?: string;
  academicSession: string; // e.g. "2026-2027"
  className: string;
  board: string;
  feeType: FeeType;
  amount: number;
  frequency: FeeFrequency;
  status: FeeStatus;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI' | 'Online' | 'Razorpay' | 'Other';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export type FeeRecordStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type GatewayPaymentStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

/**
 * Individual Student Fee record
 */
export interface StudentFeeRecord {
  id?: string;
  studentId: string;
  studentUid?: string;
  studentName: string;
  class: string;
  className?: string;
  section: string;
  academicYear: string;
  feeMonth: string;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  status: FeeRecordStatus;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod?: string;
  paymentId?: string;
  orderId?: string;
  receiptId?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id?: string;
  paymentId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  studentId: string; // Student Institutional ID (e.g. GP20260001)
  studentUid: string; // Firestore student doc UID
  studentName?: string;
  className?: string;
  section?: string;
  board?: string;
  feeId?: string;
  feeType: FeeType;
  feePeriod?: string;
  amount: number;
  currency?: string;
  receiptNumber: string; // e.g. GP-FEE-2026-00001
  receiptId?: string;
  paymentDate: string; // YYYY-MM-DD
  paymentMode: PaymentMode;
  method?: string;
  status?: GatewayPaymentStatus | PaymentStatus;
  verified?: boolean;
  referenceNumber?: string;
  remarks?: string;
  recordedBy: string;
  paidAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PaymentReceipt {
  receiptId: string;
  receiptNumber: string;
  studentName: string;
  studentId: string;
  class: string;
  section?: string;
  feePeriod: string;
  feeType: string;
  amountPaid: number;
  paymentDate: string;
  paymentId: string;
  orderId?: string;
  paymentStatus: string;
  paymentMode: string;
  createdAt: string;
}

export interface RefundRecord {
  id?: string;
  refundId: string;
  paymentId: string;
  feeId?: string;
  studentId: string;
  studentName?: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  processedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentFeeSummary {
  studentUid: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  board: string;
  phone?: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  status: PaymentStatus;
  fees?: StudentFeeRecord[];
}

export type StudentFeeDetail = StudentFeeSummary;
export type StudentFeePayment = PaymentRecord;

export interface PaymentTransaction {
  id?: string;
  studentId: string;
  studentUid?: string;
  amount: number;
  gateway: string;
  orderId: string;
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  createdAt?: any;
  updatedAt?: any;
}

export interface FeesDashboardStats {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  studentsWithPending: number;
}

export interface FeeFilters {
  academicSession?: string;
  academicYear?: string;
  className?: string;
  class?: string;
  section?: string;
  board?: string;
  feeStatus?: string;
  status?: string;
  feeType?: string;
  feeMonth?: string;
  paymentMode?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Calculates fee status and pending amount with strict validations
 * pendingAmount = totalAmount - paidAmount (never < 0)
 * paidAmount >= totalAmount -> PAID
 * paidAmount > 0 and < totalAmount -> PARTIALLY_PAID
 * paidAmount == 0 and due date passed -> OVERDUE
 * unpaid and due date not passed -> PENDING
 */
export function calculateFeeStatus(
  amount: number,
  paidAmount: number,
  dueDate?: string,
  currentStatus?: FeeRecordStatus
): { status: FeeRecordStatus; pendingAmount: number; paidAmount: number } {
  const safeAmount = Math.max(0, Number(amount) || 0);
  const safePaid = Math.max(0, Number(paidAmount) || 0);
  const pending = Math.max(0, safeAmount - safePaid);

  if (currentStatus === 'CANCELLED') {
    return { status: 'CANCELLED', pendingAmount: pending, paidAmount: safePaid };
  }

  if (safePaid >= safeAmount && safeAmount > 0) {
    return { status: 'PAID', pendingAmount: 0, paidAmount: safePaid };
  }

  if (safePaid > 0 && safePaid < safeAmount) {
    return { status: 'PARTIALLY_PAID', pendingAmount: pending, paidAmount: safePaid };
  }

  // safePaid === 0
  if (dueDate) {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today && pending > 0) {
      return { status: 'OVERDUE', pendingAmount: pending, paidAmount: safePaid };
    }
  }

  return { status: 'PENDING', pendingAmount: pending, paidAmount: safePaid };
}

