import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Save,
  Printer,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Phone,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { feesService } from '../../services/feesService';
import { studentService } from '../../services/studentService';
import {
  FeeStructure,
  PaymentRecord,
  StudentFeeSummary,
  FeesDashboardStats,
  FeeType,
  FeeFrequency,
  PaymentMode,
  FeeFilters
} from '../../types/fees';
import { CLASS_OPTIONS, BOARD_OPTIONS, Student } from '../../types/student';
import PaymentGatewayButton from '../../components/fees/PaymentGatewayButton';
import PrintableReceiptModal from '../../components/fees/PrintableReceiptModal';

interface FeesManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

type TabKey = 'dashboard' | 'structure' | 'students' | 'detail';

const FEE_TYPES: FeeType[] = [
  'Tuition Fee',
  'Admission Fee',
  'Annual Fee',
  'Exam Fee',
  'Transport Fee',
  'Other',
];

const FEE_FREQUENCIES: FeeFrequency[] = [
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Yearly',
  'One-Time',
];

const PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'Bank Transfer',
  'UPI',
  'Online',
  'Other',
];

export default function FeesManager({ currentPath, onNavigate }: FeesManagerProps) {
  const { user } = useAuth();

  // Tab & path routing
  const getTabFromPath = (path: string): { tab: TabKey; studentUid?: string } => {
    if (path.includes('/structure')) return { tab: 'structure' };
    if (path.includes('/students')) return { tab: 'students' };
    if (path.includes('/student/')) {
      const parts = path.split('/student/');
      return { tab: 'detail', studentUid: parts[1] };
    }
    return { tab: 'dashboard' };
  };

  const initialRoute = getTabFromPath(currentPath);
  const [activeTab, setActiveTab] = useState<TabKey>(initialRoute.tab);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string | undefined>(
    initialRoute.studentUid
  );

  useEffect(() => {
    const route = getTabFromPath(currentPath);
    setActiveTab(route.tab);
    if (route.studentUid) {
      setSelectedStudentUid(route.studentUid);
    }
  }, [currentPath]);

  const handleTabChange = (tab: TabKey, studentUid?: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') onNavigate('/admin/fees');
    else if (tab === 'structure') onNavigate('/admin/fees/structure');
    else if (tab === 'students') onNavigate('/admin/fees/students');
    else if (tab === 'detail' && studentUid) {
      setSelectedStudentUid(studentUid);
      onNavigate(`/admin/fees/student/${studentUid}`);
    }
  };

  // ----------------------------------------------------
  // SHARED DASHBOARD STATS
  // ----------------------------------------------------
  const [stats, setStats] = useState<FeesDashboardStats>({
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    studentsWithPending: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const data = await feesService.getFeesDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // ----------------------------------------------------
  // TAB 2: FEE STRUCTURE STATE
  // ----------------------------------------------------
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loadingStructures, setLoadingStructures] = useState<boolean>(false);
  const [showStructureModal, setShowStructureModal] = useState<boolean>(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureForm, setStructureForm] = useState<{
    academicSession: string;
    className: string;
    board: string;
    feeType: FeeType;
    amount: number;
    frequency: FeeFrequency;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    academicSession: '2026-2027',
    className: 'Class 1',
    board: 'CBSE',
    feeType: 'Tuition Fee',
    amount: 1500,
    frequency: 'Monthly',
    status: 'ACTIVE',
  });
  const [savingStructure, setSavingStructure] = useState<boolean>(false);

  const loadFeeStructures = async () => {
    setLoadingStructures(true);
    try {
      const list = await feesService.getFeeStructures();
      setFeeStructures(list);
    } catch (err) {
      console.error('Error loading structures:', err);
    } finally {
      setLoadingStructures(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'structure') loadFeeStructures();
  }, [activeTab]);

  const handleOpenStructureModal = (struct?: FeeStructure) => {
    if (struct) {
      setEditingStructure(struct);
      setStructureForm({
        academicSession: struct.academicSession || '2026-2027',
        className: struct.className,
        board: struct.board,
        feeType: struct.feeType,
        amount: struct.amount,
        frequency: struct.frequency,
        status: struct.status,
      });
    } else {
      setEditingStructure(null);
      setStructureForm({
        academicSession: '2026-2027',
        className: 'Class 1',
        board: 'CBSE',
        feeType: 'Tuition Fee',
        amount: 1500,
        frequency: 'Monthly',
        status: 'ACTIVE',
      });
    }
    setShowStructureModal(true);
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStructure(true);
    try {
      if (editingStructure && editingStructure.id) {
        await feesService.updateFeeStructure(editingStructure.id, structureForm);
      } else {
        await feesService.createFeeStructure(structureForm);
      }
      setShowStructureModal(false);
      loadFeeStructures();
      loadDashboardStats();
    } catch (err) {
      console.error('Error saving structure:', err);
    } finally {
      setSavingStructure(false);
    }
  };

  const handleDeleteStructure = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await feesService.deleteFeeStructure(id);
      loadFeeStructures();
      loadDashboardStats();
    } catch (err) {
      console.error('Error deleting structure:', err);
    }
  };

  // ----------------------------------------------------
  // TAB 3: STUDENT FEES LIST STATE
  // ----------------------------------------------------
  const [studentSummaries, setStudentSummaries] = useState<StudentFeeSummary[]>([]);
  const [loadingStudentSummaries, setLoadingStudentSummaries] = useState<boolean>(false);
  const [filters, setFilters] = useState<FeeFilters>({
    academicSession: '2026-2027',
    className: '',
    section: '',
    board: '',
    feeStatus: 'ALL',
    searchQuery: '',
  });

  const loadStudentSummaries = async () => {
    setLoadingStudentSummaries(true);
    try {
      const list = await feesService.getStudentFeeSummaries(filters);
      setStudentSummaries(list);
    } catch (err) {
      console.error('Error loading student summaries:', err);
    } finally {
      setLoadingStudentSummaries(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'dashboard') {
      loadStudentSummaries();
    }
  }, [activeTab, filters]);

  // ----------------------------------------------------
  // TAB 4: STUDENT FEE DETAIL & MANUAL PAYMENT STATE
  // ----------------------------------------------------
  const [studentDetail, setStudentDetail] = useState<{
    student: Student;
    summary: StudentFeeSummary;
    payments: PaymentRecord[];
    structures: FeeStructure[];
  } | null>(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState<boolean>(false);

  // Manual payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const [paymentForm, setPaymentForm] = useState<{
    feeType: FeeType;
    amount: number;
    paymentDate: string;
    paymentMode: PaymentMode;
    referenceNumber: string;
    remarks: string;
  }>({
    feeType: 'Tuition Fee',
    amount: 1500,
    paymentDate: todayStr,
    paymentMode: 'Cash',
    referenceNumber: '',
    remarks: '',
  });
  const [recordingPayment, setRecordingPayment] = useState<boolean>(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  const loadStudentDetail = async (uid: string) => {
    setLoadingStudentDetail(true);
    try {
      const data = await feesService.getStudentFeeDetail(uid);
      setStudentDetail(data);
    } catch (err) {
      console.error('Error loading student detail:', err);
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'detail' && selectedStudentUid) {
      loadStudentDetail(selectedStudentUid);
    }
  }, [activeTab, selectedStudentUid]);

  const handleOpenPaymentModal = (payToEdit?: PaymentRecord) => {
    setPaymentSuccessMsg(null);
    if (payToEdit) {
      setEditingPayment(payToEdit);
      setPaymentForm({
        feeType: payToEdit.feeType,
        amount: payToEdit.amount,
        paymentDate: payToEdit.paymentDate,
        paymentMode: payToEdit.paymentMode,
        referenceNumber: payToEdit.referenceNumber || '',
        remarks: payToEdit.remarks || '',
      });
    } else {
      setEditingPayment(null);
      const defaultAmount = studentDetail ? Math.min(1500, studentDetail.summary.pendingAmount) : 1500;
      setPaymentForm({
        feeType: 'Tuition Fee',
        amount: defaultAmount > 0 ? defaultAmount : 1500,
        paymentDate: todayStr,
        paymentMode: 'Cash',
        referenceNumber: '',
        remarks: '',
      });
    }
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDetail) return;
    setRecordingPayment(true);
    setPaymentSuccessMsg(null);

    try {
      const recordedBy = user?.displayName || user?.email || 'ADMIN';

      if (editingPayment && editingPayment.id) {
        await feesService.updateManualPayment(editingPayment.id, {
          feeType: paymentForm.feeType,
          amount: Number(paymentForm.amount),
          paymentDate: paymentForm.paymentDate,
          paymentMode: paymentForm.paymentMode,
          referenceNumber: paymentForm.referenceNumber,
          remarks: paymentForm.remarks,
        });
        setPaymentSuccessMsg('Payment record updated successfully.');
      } else {
        const newRecord = await feesService.recordManualPayment({
          studentId: studentDetail.student.studentId,
          studentUid: studentDetail.student.uid,
          studentName: studentDetail.student.name,
          className: studentDetail.student.className,
          section: studentDetail.student.section,
          board: studentDetail.student.board,
          feeType: paymentForm.feeType,
          amount: Number(paymentForm.amount),
          paymentDate: paymentForm.paymentDate,
          paymentMode: paymentForm.paymentMode,
          referenceNumber: paymentForm.referenceNumber,
          remarks: paymentForm.remarks,
          recordedBy,
        });
        setPaymentSuccessMsg('Payment recorded successfully.');
        setActiveReceipt(newRecord); // Show receipt immediately
      }

      setShowPaymentModal(false);
      loadStudentDetail(studentDetail.student.uid);
      loadDashboardStats();
    } catch (err: any) {
      console.error('Error recording payment:', err);
      alert(err.message || 'Failed to record payment.');
    } finally {
      setRecordingPayment(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER & TOP NAV TABS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#001c46] text-[#FFC907] rounded-xl shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#001c46] tracking-tight">
                Fees Management
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Fee structure setup, student balance tracking & manual receipt generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PaymentGatewayButton />
          </div>
        </div>

        {/* TOP SUB-NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Fees</span>
          </button>

          <button
            onClick={() => handleTabChange('structure')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Fee Structure</span>
          </button>

          {activeTab === 'detail' && (
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#001c46] text-white shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Student Details</span>
            </button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* FEES DASHBOARD STATS CARDS */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expected */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expected</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#001c46]">
            {loadingStats ? '...' : `₹${stats.totalExpected.toLocaleString('en-IN')}`}
          </div>
          <p className="text-[11px] font-semibold text-gray-400">Total institutional fee assessment</p>
        </div>

        {/* Total Collected */}
        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Total Collected</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {loadingStats ? '...' : `₹${stats.totalCollected.toLocaleString('en-IN')}`}
          </div>
          <p className="text-[11px] font-extrabold text-emerald-800">
            {stats.totalExpected > 0
              ? `${Math.round((stats.totalCollected / stats.totalExpected) * 100)}% Collected`
              : '0% Collected'}
          </p>
        </div>

        {/* Total Pending */}
        <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pending</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {loadingStats ? '...' : `₹${stats.totalPending.toLocaleString('en-IN')}`}
          </div>
          <p className="text-[11px] font-extrabold text-rose-800">Outstanding balance</p>
        </div>

        {/* Students With Pending Fees */}
        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Students</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800">
            {loadingStats ? '...' : stats.studentsWithPending}
          </div>
          <p className="text-[11px] font-extrabold text-amber-800">Students with unpaid balance</p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#001c46]">Student Fee Status Summary</h2>
                <p className="text-xs text-gray-500 font-medium">Quick glance at recent student ledger records</p>
              </div>
              <button
                onClick={() => handleTabChange('students')}
                className="text-xs font-extrabold text-[#001c46] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Students</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loadingStudentSummaries ? (
              <div className="p-12 text-center text-gray-500 text-xs font-bold">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#001c46] mb-2" />
                Loading fee records...
              </div>
            ) : studentSummaries.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs font-bold">
                No active students or fee structures available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-black text-gray-600 uppercase border-b border-gray-200">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class & Sec</th>
                      <th className="py-3 px-4">Total Fee</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Pending</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {studentSummaries.slice(0, 5).map((s) => (
                      <tr key={s.studentUid} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          <div>{s.studentName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">ID: {s.studentId}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-700">
                          {s.className} ({s.section})
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          ₹{s.totalFee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          ₹{s.paidAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-rose-700">
                          ₹{s.pendingAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              s.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : s.status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleTabChange('detail', s.studentUid)}
                            className="p-1.5 bg-gray-100 hover:bg-[#001c46] text-gray-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Manage Student Fees"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: FEE STRUCTURE MANAGEMENT */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <div>
              <h2 className="text-base font-black text-[#001c46]">Institutional Fee Structure</h2>
              <p className="text-xs font-medium text-gray-500">
                Define academic fees, frequency rules and class fee allocations
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenStructureModal()}
              className="px-4 py-2.5 bg-[#001c46] hover:bg-[#001535] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FFC907]" />
              <span>Create Fee Structure</span>
            </button>
          </div>

          {loadingStructures ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-xs font-bold text-gray-500">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto mb-2" />
              Loading fee structures...
            </div>
          ) : feeStructures.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No Fee Structures Created Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Create a fee structure for classes to start mapping student tuition and operational fees.
              </p>
              <button
                onClick={() => handleOpenStructureModal()}
                className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                + Add First Structure
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100/80 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Session</th>
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4">Board</th>
                      <th className="py-3.5 px-4">Fee Type</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Frequency</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feeStructures.map((struct) => (
                      <tr key={struct.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{struct.academicSession}</td>
                        <td className="py-3.5 px-4 font-extrabold text-[#001c46]">{struct.className}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-700">{struct.board || 'All'}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">{struct.feeType}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-800">
                          ₹{Number(struct.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-600">{struct.frequency}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              struct.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            }`}
                          >
                            {struct.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenStructureModal(struct)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                              title="Edit Structure"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => struct.id && handleDeleteStructure(struct.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Structure"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CREATE/EDIT FEE STRUCTURE MODAL */}
          {showStructureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001c46]/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-lg font-black text-[#001c46]">
                    {editingStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
                  </h3>
                  <button
                    onClick={() => setShowStructureModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveStructure} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Academic Session
                      </label>
                      <input
                        type="text"
                        required
                        value={structureForm.academicSession}
                        onChange={(e) =>
                          setStructureForm({ ...structureForm, academicSession: e.target.value })
                        }
                        placeholder="2026-2027"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Class</label>
                      <select
                        value={structureForm.className}
                        onChange={(e) =>
                          setStructureForm({ ...structureForm, className: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        <option value="All Classes">All Classes</option>
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Board</label>
                      <select
                        value={structureForm.board}
                        onChange={(e) =>
                          setStructureForm({ ...structureForm, board: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        <option value="All">All Boards</option>
                        {BOARD_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Fee Type
                      </label>
                      <select
                        value={structureForm.feeType}
                        onChange={(e) =>
                          setStructureForm({
                            ...structureForm,
                            feeType: e.target.value as FeeType,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        {FEE_TYPES.map((ft) => (
                          <option key={ft} value={ft}>
                            {ft}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={structureForm.amount}
                        onChange={(e) =>
                          setStructureForm({ ...structureForm, amount: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={structureForm.frequency}
                        onChange={(e) =>
                          setStructureForm({
                            ...structureForm,
                            frequency: e.target.value as FeeFrequency,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        {FEE_FREQUENCIES.map((freq) => (
                          <option key={freq} value={freq}>
                            {freq}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={structureForm.status}
                      onChange={(e) =>
                        setStructureForm({
                          ...structureForm,
                          status: e.target.value as 'ACTIVE' | 'INACTIVE',
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowStructureModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingStructure}
                      className="px-6 py-2.5 rounded-xl bg-[#001c46] hover:bg-[#001535] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {savingStructure ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FFC907]" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-[#FFC907]" />
                          <span>Save Fee Structure</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: STUDENT FEES LIST */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#FFC907]" />
              Search & Filter Student Fee Ledgers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Name / ID / Phone"
                    value={filters.searchQuery || ''}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>

              {/* Class */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Class</label>
                <select
                  value={filters.className || ''}
                  onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                >
                  <option value="">All Classes</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Board */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Board</label>
                <select
                  value={filters.board || ''}
                  onChange={(e) => setFilters({ ...filters, board: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                >
                  <option value="">All Boards</option>
                  {BOARD_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Status */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Payment Status</label>
                <select
                  value={filters.feeStatus || 'ALL'}
                  onChange={(e) => setFilters({ ...filters, feeStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      academicSession: '2026-2027',
                      className: '',
                      section: '',
                      board: '',
                      feeStatus: 'ALL',
                      searchQuery: '',
                    })
                  }
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* STUDENT FEES TABLE */}
          {loadingStudentSummaries ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-xs font-bold text-gray-500">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto mb-2" />
              Loading student fee records...
            </div>
          ) : studentSummaries.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No student fee records found.</h3>
              <p className="text-xs text-gray-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider">
                  Student Fee Directory ({studentSummaries.length} Students)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Student ID</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Class & Sec</th>
                      <th className="py-3.5 px-4">Board</th>
                      <th className="py-3.5 px-4">Total Fee</th>
                      <th className="py-3.5 px-4">Paid Amount</th>
                      <th className="py-3.5 px-4">Pending</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentSummaries.map((s) => (
                      <tr key={s.studentUid} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#001c46]">
                          {s.studentId}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-gray-900">{s.studentName}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-700">
                          {s.className} ({s.section})
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-600">{s.board}</td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          ₹{s.totalFee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">
                          ₹{s.paidAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-black text-rose-700">
                          ₹{s.pendingAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              s.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : s.status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleTabChange('detail', s.studentUid)}
                            className="px-3 py-1.5 bg-[#001c46] hover:bg-[#001535] text-white font-extrabold text-[11px] rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#FFC907]" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: STUDENT FEE DETAIL & PAYMENT HISTORY */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'detail' && (
        <div className="space-y-6">
          <button
            onClick={() => handleTabChange('students')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#001c46] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Student Fees List</span>
          </button>

          {loadingStudentDetail ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-xs font-bold text-gray-500">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto mb-2" />
              Loading student fee account...
            </div>
          ) : !studentDetail ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-xs font-bold text-gray-500">
              Student details not found.
            </div>
          ) : (
            <div className="space-y-6">
              {/* STUDENT PROFILE CARD */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#FFC907] bg-[#001c46] px-2.5 py-1 rounded-md tracking-wider">
                      Fee Ledger Account
                    </span>
                    <h2 className="text-2xl font-black text-[#001c46] pt-1">
                      {studentDetail.student.name}
                    </h2>
                    <p className="text-xs font-bold text-gray-500">
                      ID: <span className="font-mono text-[#001c46]">{studentDetail.student.studentId}</span> • Class: {studentDetail.student.className} ({studentDetail.student.section}) • Board: {studentDetail.student.board}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <PaymentGatewayButton
                      amount={studentDetail.summary.pendingAmount}
                      studentName={studentDetail.student.name}
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenPaymentModal()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>

                {/* FEE BREAKDOWN STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      Assessed Total Fee
                    </span>
                    <p className="text-2xl font-black text-[#001c46]">
                      ₹{studentDetail.summary.totalFee.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                      Total Paid Amount
                    </span>
                    <p className="text-2xl font-black text-emerald-700">
                      ₹{studentDetail.summary.paidAmount.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                      Pending Outstanding
                    </span>
                    <p className="text-2xl font-black text-rose-700">
                      ₹{studentDetail.summary.pendingAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* PAYMENT HISTORY TABLE */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#001c46] uppercase tracking-wider">
                    Payment History Logs ({studentDetail.payments.length} Transactions)
                  </h3>
                  <button
                    onClick={() => handleOpenPaymentModal()}
                    className="text-xs font-bold text-[#001c46] hover:underline cursor-pointer"
                  >
                    + Record New Payment
                  </button>
                </div>

                {studentDetail.payments.length === 0 ? (
                  <div className="p-12 text-center text-xs font-bold text-gray-500 space-y-2">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                    <p>No payment records found for this student.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                          <th className="py-3.5 px-4">Receipt No.</th>
                          <th className="py-3.5 px-4">Payment Date</th>
                          <th className="py-3.5 px-4">Fee Type</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Mode</th>
                          <th className="py-3.5 px-4">Ref Number</th>
                          <th className="py-3.5 px-4 text-center">Receipt & Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {studentDetail.payments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#001c46]">
                              {pay.receiptNumber}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-900">{pay.paymentDate}</td>
                            <td className="py-3.5 px-4 font-bold text-gray-700">{pay.feeType}</td>
                            <td className="py-3.5 px-4 font-black text-emerald-800">
                              ₹{Number(pay.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-600">{pay.paymentMode}</td>
                            <td className="py-3.5 px-4 font-mono text-gray-500">
                              {pay.referenceNumber || '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setActiveReceipt(pay)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[10px] rounded-lg border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>View Receipt</span>
                                </button>
                                <button
                                  onClick={() => handleOpenPaymentModal(pay)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                                  title="Edit Payment Record"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MANUAL PAYMENT RECORDING MODAL */}
          {showPaymentModal && studentDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001c46]/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative space-y-5 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-black text-[#001c46]">
                      {editingPayment ? 'Edit Manual Payment' : 'Record Manual Fee Payment'}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold">
                      Student: {studentDetail.student.name} ({studentDetail.student.studentId})
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePayment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Fee Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentForm.feeType}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            feeType: e.target.value as FeeType,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        {FEE_TYPES.map((ft) => (
                          <option key={ft} value={ft}>
                            {ft}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={paymentForm.amount}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={paymentForm.paymentDate}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Payment Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentForm.paymentMode}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentMode: e.target.value as PaymentMode,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                      >
                        {PAYMENT_MODES.map((pm) => (
                          <option key={pm} value={pm}>
                            {pm}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Reference / Transaction Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI Ref, Bank Chq No."
                      value={paymentForm.referenceNumber}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                    <textarea
                      rows={2}
                      placeholder="Optional notes or teller comments..."
                      value={paymentForm.remarks}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, remarks: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={recordingPayment}
                      className="px-6 py-2.5 rounded-xl bg-[#001c46] hover:bg-[#001535] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {recordingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FFC907]" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-[#FFC907]" />
                          <span>{editingPayment ? 'Update Record' : 'Record Payment & Issue Receipt'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ACTIVE RECEIPT MODAL */}
          {activeReceipt && (
            <PrintableReceiptModal
              payment={activeReceipt}
              onClose={() => setActiveReceipt(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
