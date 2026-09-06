import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportsService, ReportOverviewStats, ReportFilterState } from '../../services/reportsService';
import { Student } from '../../types/student';
import { Teacher } from '../../types/teacher';
import { AttendanceRecord } from '../../types/attendance';
import { StudentFeeSummary, PaymentRecord } from '../../types/fees';
import { AdmissionEnquiry } from '../../types/admission';
import { ExamResult } from '../../types/result';
import { CLASS_OPTIONS, BOARD_OPTIONS } from '../../types/student';
import { printElementById } from '../../lib/printUtils';

// Lucide Icons
import {
  BarChart3,
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  UserPlus,
  Award,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  ShieldX,
  PieChart as PieIcon,
  TrendingUp,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function ReportsAnalytics() {
  const { userProfile } = useAuth();

  // Role Security Check: SUPER_ADMIN and ADMIN only
  const isAuthorizedAdmin =
    userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';

  // Active Report Tab: student | attendance | fees | admission | results | teacher
  const [activeTab, setActiveTab] = useState<
    'student' | 'attendance' | 'fees' | 'admission' | 'results' | 'teacher'
  >('student');

  // Loading & Refresh State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Raw Firestore Datasets
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [feeSummaries, setFeeSummaries] = useState<StudentFeeSummary[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);

  // Filter State
  const [filters, setFilters] = useState<ReportFilterState>({
    academicSession: 'ALL',
    className: 'ALL',
    section: 'ALL',
    board: 'ALL',
    startDate: '',
    endDate: '',
    status: 'ALL',
    searchQuery: '',
  });

  // Mobile Filter Accordion Toggle
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Fetch all real Firestore data on load
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await reportsService.loadAllReportData();
      setStudents(data.students);
      setTeachers(data.teachers);
      setAttendances(data.attendances);
      setFeeSummaries(data.feeSummaries);
      setPayments(data.payments);
      setEnquiries(data.enquiries);
      setExamResults(data.examResults);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      academicSession: 'ALL',
      className: 'ALL',
      section: 'ALL',
      board: 'ALL',
      startDate: '',
      endDate: '',
      status: 'ALL',
      searchQuery: '',
    });
  };

  // 1. Calculate Real Overview Cards
  const overviewStats: ReportOverviewStats = useMemo(() => {
    return reportsService.calculateOverviewStats(
      students,
      teachers,
      enquiries,
      feeSummaries,
      payments
    );
  }, [students, teachers, enquiries, feeSummaries, payments]);

  // 2. Classwise Student Count
  const classwiseStudents = useMemo(() => {
    return reportsService.calculateClasswiseStudents(students);
  }, [students]);

  // 3. Filtered Datasets for each report tab
  const filteredStudents = useMemo(() => {
    return reportsService.filterStudents(students, filters);
  }, [students, filters]);

  const filteredAttendance = useMemo(() => {
    return reportsService.filterAttendance(attendances, filters);
  }, [attendances, filters]);

  const filteredFeeSummaries = useMemo(() => {
    return reportsService.filterFeeSummaries(feeSummaries, filters);
  }, [feeSummaries, filters]);

  const filteredEnquiries = useMemo(() => {
    return reportsService.filterEnquiries(enquiries, filters);
  }, [enquiries, filters]);

  const filteredTeachers = useMemo(() => {
    return reportsService.filterTeachers(teachers, filters);
  }, [teachers, filters]);

  const filteredExamResults = useMemo(() => {
    return reportsService.filterExamResults(examResults, filters);
  }, [examResults, filters]);

  // 4. Tab Statistics Calculations
  const attendanceStats = useMemo(() => {
    return reportsService.calculateAttendanceStats(filteredAttendance);
  }, [filteredAttendance]);

  const feesStats = useMemo(() => {
    return reportsService.calculateFeesStats(filteredFeeSummaries, payments);
  }, [filteredFeeSummaries, payments]);

  const admissionStats = useMemo(() => {
    return reportsService.calculateAdmissionStats(filteredEnquiries);
  }, [filteredEnquiries]);

  const teacherStats = useMemo(() => {
    return reportsService.calculateTeacherStats(filteredTeachers);
  }, [filteredTeachers]);

  // 5. Responsive Charts Datasets
  // Chart 1: Students by Class (Bar Chart)
  const chartStudentsByClass = useMemo(() => {
    return classwiseStudents.map((c) => ({
      name: c.className.replace('Class ', 'Cls '),
      Total: c.totalCount,
      Active: c.activeCount,
    }));
  }, [classwiseStudents]);

  // Chart 2: Attendance Breakdown (Donut/Pie Chart)
  const chartAttendanceData = useMemo(() => {
    const s = attendanceStats;
    if (s.totalRecords === 0) {
      return [
        { name: 'Present', value: 1, color: '#10B981' },
        { name: 'Absent', value: 0, color: '#EF4444' },
        { name: 'Late', value: 0, color: '#F59E0B' },
        { name: 'Half Day', value: 0, color: '#6366F1' },
      ];
    }
    return [
      { name: 'Present', value: s.present, color: '#10B981' },
      { name: 'Absent', value: s.absent, color: '#EF4444' },
      { name: 'Late', value: s.late, color: '#F59E0B' },
      { name: 'Half Day', value: s.halfDay, color: '#6366F1' },
    ];
  }, [attendanceStats]);

  // Chart 3: Fees Collected vs Pending (Bar Chart)
  const chartFeesData = useMemo(() => {
    return [
      {
        name: 'Fee Ledger',
        Collected: feesStats.paidAmount,
        Pending: feesStats.pendingAmount,
      },
    ];
  }, [feesStats]);

  // Chart 4: Admission Status Breakdown (Pie Chart)
  const chartAdmissionData = useMemo(() => {
    const s = admissionStats;
    return [
      { name: 'New', value: s.newCount, color: '#10B981' },
      { name: 'Contacted', value: s.contactedCount, color: '#3B82F6' },
      { name: 'Follow Up', value: s.followUpCount, color: '#F59E0B' },
      { name: 'Confirmed', value: s.confirmedCount, color: '#8B5CF6' },
      { name: 'Not Interested', value: s.notInterestedCount, color: '#6B7280' },
      { name: 'Closed', value: s.closedCount, color: '#EF4444' },
    ].filter((item) => s.total > 0 ? item.value > 0 : true);
  }, [admissionStats]);

  // 6. CSV Export Function
  const handleExportCSV = () => {
    let filename = `GP_Academy_${activeTab}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'student') {
      headers = ['Student ID', 'Name', 'Class', 'Section', 'Board', 'Parent Name', 'Phone', 'Status', 'Admission Date'];
      rows = filteredStudents.map((s) => [
        s.studentId,
        s.name,
        s.className,
        s.section,
        s.board,
        s.parentName,
        s.phone,
        s.status,
        s.admissionDate || '—',
      ]);
    } else if (activeTab === 'attendance') {
      headers = ['Date', 'Student ID', 'Student Name', 'Class', 'Section', 'Roll No', 'Status', 'Marked By'];
      rows = filteredAttendance.map((a) => [
        a.date,
        a.studentId,
        a.studentName || '—',
        a.className,
        a.section,
        a.rollNumber || '—',
        a.status,
        a.markedBy || 'Admin',
      ]);
    } else if (activeTab === 'fees') {
      headers = ['Student ID', 'Student Name', 'Class', 'Section', 'Board', 'Total Fee (₹)', 'Paid Amount (₹)', 'Pending Amount (₹)', 'Fee Status'];
      rows = filteredFeeSummaries.map((f) => [
        f.studentId,
        f.studentName,
        f.className,
        f.section,
        f.board,
        String(f.totalFee),
        String(f.paidAmount),
        String(f.pendingAmount),
        f.status,
      ]);
    } else if (activeTab === 'admission') {
      headers = ['Enquiry ID', 'Student Name', 'Grade', 'Board', 'Parent Name', 'Phone', 'Status', 'Submitted Date'];
      rows = filteredEnquiries.map((e) => [
        e.enquiryId,
        e.studentName || e.submittedFormData?.studentName || '—',
        e.grade || '—',
        e.board || '—',
        e.parentName || '—',
        e.phone || '—',
        e.status,
        e.submittedAt ? e.submittedAt.split('T')[0] : '—',
      ]);
    } else if (activeTab === 'teacher') {
      headers = ['Teacher ID', 'Name', 'Email', 'Phone', 'Subjects', 'Assigned Classes', 'Status', 'Joining Date'];
      rows = filteredTeachers.map((t) => [
        t.teacherId,
        t.name,
        t.email,
        t.phone,
        (t.subjects || []).join('; '),
        (t.assignedClasses || []).join('; '),
        t.status,
        t.joiningDate || '—',
      ]);
    } else if (activeTab === 'results') {
      headers = ['Exam Name', 'Session', 'Student ID', 'Student Name', 'Class', 'Section', 'Board', 'Total Obtained', 'Total Max', 'Percentage (%)', 'Result Status'];
      rows = filteredExamResults.map((r) => [
        r.examName,
        r.academicSession,
        r.studentId,
        r.studentName,
        r.className,
        r.section,
        r.board,
        String(r.totalObtained),
        String(r.totalMax),
        String(r.percentage),
        r.status,
      ]);
    }

    if (!headers.length) return;

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Browser Print
  const handleBrowserPrint = () => {
    printElementById('reports-analytics-root', {
      title: `GP_Academy_${activeTab.toUpperCase()}_Report`,
      landscape: true,
    });
  };

  // Security Access Denied Render
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <ShieldX className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#001c46]">Access Restricted</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your account role <span className="font-bold text-[#001c46]">[{userProfile?.role || 'UNAUTHORIZED'}]</span> does not have authorization to view institutional analytics or export financial and academic reports.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
              Super Admin & Admin Access Only
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="reports-analytics-root" className="space-y-8 font-sans pb-12 print:p-0 print:space-y-4">
      {/* Printable Header Bar (Visible ONLY during print) */}
      <div className="hidden print:block p-4 border-b border-gray-300 text-center mb-4">
        <h1 className="text-2xl font-black text-[#001c46]">GP ACADEMY SCHOOL</h1>
        <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mt-1">
          Institutional Analytics & Operational Report — {activeTab.toUpperCase()}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          Printed On: {new Date().toLocaleString('en-IN')} | Session: {filters.academicSession === 'ALL' ? 'Current Session' : filters.academicSession}
        </p>
      </div>

      {/* Screen Header Banner */}
      <div className="bg-gradient-to-r from-[#001c46] via-[#102a56] to-[#001c46] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC907]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#FFC907] uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full inline-block">
                Institutional Intelligence
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold">
                Real-Time Firestore Sync
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Reports & Analytics Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
              Consolidated real-time analytics for students, faculty, daily attendance logs, fee ledgers, admissions, and exam performance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Refresh Firestore Datasets"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-2 bg-[#FFC907] hover:bg-[#e0b000] text-[#001c46] font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Data Overview Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#001c46] tracking-tight">Institutional Metrics Summary</h3>
          <span className="text-[11px] font-bold text-gray-500">Live Firestore Ledger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Students */}
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Total Students</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#001c46]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#001c46] tracking-tight">
                {overviewStats.totalStudents}
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                {overviewStats.activeStudents} Active ({overviewStats.disabledStudents} Inactive)
              </p>
            </div>
          </div>

          {/* Card 2: Faculty Members */}
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Total Faculty</span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#001c46] tracking-tight">
                {overviewStats.totalTeachers}
              </div>
              <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                {overviewStats.activeTeachers} Active Staff
              </p>
            </div>
          </div>

          {/* Card 3: Admissions */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Admissions</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#001c46] tracking-tight">
                {overviewStats.confirmedAdmissions}
              </div>
              <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                Confirmed ({overviewStats.newAdmissionEnquiries} New Enquiries)
              </p>
            </div>
          </div>

          {/* Card 4: Fee Ledger Collection */}
          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Fee Ledger</span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                ₹{overviewStats.totalFeeCollected.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] font-medium text-rose-600 mt-0.5">
                Pending: ₹{overviewStats.totalPendingFee.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for 6 Report Sections */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-xs overflow-x-auto print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'student', label: '1. Student Report', icon: Users },
            { id: 'attendance', label: '2. Attendance Report', icon: CalendarCheck },
            { id: 'fees', label: '3. Fees Report', icon: CreditCard },
            { id: 'admission', label: '4. Admission Report', icon: UserPlus },
            { id: 'results', label: '5. Results Report', icon: Award },
            { id: 'teacher', label: '6. Teacher Report', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#001c46] text-[#FFC907] shadow-md scale-102'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#001c46]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFC907]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#001c46]" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#001c46]">
              Filter Controls
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center gap-1 text-xs font-bold text-[#001c46] bg-gray-100 px-3 py-1.5 rounded-lg"
            >
              <span>Filters</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={handleResetFilters}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 ${showMobileFilters ? 'block' : 'hidden sm:grid'}`}>
          {/* 1. Academic Session */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Academic Session
            </label>
            <select
              value={filters.academicSession}
              onChange={(e) => setFilters({ ...filters, academicSession: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#001c46] focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Sessions</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>

          {/* 2. Class */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Class
            </label>
            <select
              value={filters.className}
              onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#001c46] focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Section */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Section
            </label>
            <select
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#001c46] focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {/* 4. Board */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Board
            </label>
            <select
              value={filters.board}
              onChange={(e) => setFilters({ ...filters, board: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#001c46] focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Boards</option>
              {BOARD_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Date Range Start */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-[#001c46] focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none"
            />
          </div>

          {/* 6. Date Range End */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-[#001c46] focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none"
            />
          </div>
        </div>

        {/* Real-Time Text Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by student name, roll no, teacher, phone, enquiry ID, or exam..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-[#001c46] placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Report Tab Visual Views */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-[#001c46]">Loading Firestore Analytics Datasets...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: STUDENT REPORT */}
          {activeTab === 'student' && (
            <div className="space-y-6">
              {/* Responsive Chart: Students by Class */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Students Distribution by Class</h3>
                    <p className="text-xs text-gray-500">Real-time enrolled student counts across all classes</p>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-[#001c46] bg-blue-50 px-2.5 py-1 rounded-lg">
                    {filteredStudents.length} Records
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartStudentsByClass} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4B5563' }} angle={-30} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#001c46', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                      />
                      <Bar dataKey="Total" fill="#001c46" radius={[6, 6, 0, 0]} name="Total Students" />
                      <Bar dataKey="Active" fill="#10B981" radius={[6, 6, 0, 0]} name="Active Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Student Master Directory</h3>
                    <p className="text-xs text-gray-500">Filtered student enrollment list</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">Total: {filteredStudents.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Student ID</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5">Class & Section</th>
                        <th className="px-6 py-3.5">Board</th>
                        <th className="px-6 py-3.5">Parent Name</th>
                        <th className="px-6 py-3.5">Phone</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-600">No student records match active filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((std) => (
                          <tr key={std.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-[#001c46]">{std.studentId}</td>
                            <td className="px-6 py-4 font-black text-[#001c46]">{std.name}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">{std.className} ({std.section})</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                                {std.board}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{std.parentName}</td>
                            <td className="px-6 py-4 font-mono text-gray-800">+91 {std.phone}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  std.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {std.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE REPORT */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Stats Strip & Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Attendance Summary Cards */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Present</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{attendanceStats.present}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Absent</span>
                    <div className="text-2xl font-black text-rose-600 mt-1">{attendanceStats.absent}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Late</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{attendanceStats.late}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attendance %</span>
                    <div className="text-2xl font-black text-[#001c46] mt-1">{attendanceStats.attendancePercentage}%</div>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
                  <h3 className="text-base font-black text-[#001c46]">Attendance Ratio Breakdown</h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartAttendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartAttendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Attendance History Records</h3>
                    <p className="text-xs text-gray-500">Filtered daily attendance logs</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">Total: {filteredAttendance.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5">Student ID</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5">Class & Section</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Marked By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-600">No attendance logs match active filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((rec) => (
                          <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-gray-800">{rec.date}</td>
                            <td className="px-6 py-4 font-mono font-bold text-[#001c46]">{rec.studentId}</td>
                            <td className="px-6 py-4 font-black text-[#001c46]">{rec.studentName || '—'}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{rec.className} ({rec.section})</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  rec.status === 'PRESENT'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : rec.status === 'ABSENT'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : rec.status === 'LATE'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{rec.markedBy || 'Admin'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEES REPORT */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              {/* Cards & Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Fee Collected</span>
                    <div className="text-3xl font-black text-emerald-600 mt-1">₹{feesStats.paidAmount.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Pending Balance</span>
                    <div className="text-3xl font-black text-rose-600 mt-1">₹{feesStats.pendingAmount.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100">
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block">Paid</span>
                      <span className="text-base font-black text-emerald-900">{feesStats.paidStudentCount}</span>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
                      <span className="text-[9px] font-bold text-amber-800 uppercase block">Partial</span>
                      <span className="text-base font-black text-amber-900">{feesStats.partialStudentCount}</span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl text-center border border-rose-100">
                      <span className="text-[9px] font-bold text-rose-800 uppercase block">Pending</span>
                      <span className="text-base font-black text-rose-900">{feesStats.pendingStudentCount}</span>
                    </div>
                  </div>
                </div>

                {/* Fees Bar Chart */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
                  <h3 className="text-base font-black text-[#001c46]">Fees Collection vs Outstanding Balance</h3>
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartFeesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                        <Bar dataKey="Collected" fill="#10B981" radius={[8, 8, 0, 0]} name="Collected Fee" />
                        <Bar dataKey="Pending" fill="#EF4444" radius={[8, 8, 0, 0]} name="Pending Balance" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Fee Ledger Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Student Fee Collection Ledger</h3>
                    <p className="text-xs text-gray-500">Student wise fee collection breakdown</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">Total: {filteredFeeSummaries.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Student ID</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5">Class & Section</th>
                        <th className="px-6 py-3.5">Total Fee</th>
                        <th className="px-6 py-3.5">Paid Amount</th>
                        <th className="px-6 py-3.5">Pending Amount</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFeeSummaries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-600">No fee records match active filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredFeeSummaries.map((f) => (
                          <tr key={f.studentUid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-[#001c46]">{f.studentId}</td>
                            <td className="px-6 py-4 font-black text-[#001c46]">{f.studentName}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{f.className} ({f.section})</td>
                            <td className="px-6 py-4 font-bold text-gray-800">₹{f.totalFee.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 font-extrabold text-emerald-600">₹{f.paidAmount.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 font-extrabold text-rose-600">₹{f.pendingAmount.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  f.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : f.status === 'PARTIAL'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMISSION REPORT */}
          {activeTab === 'admission' && (
            <div className="space-y-6">
              {/* Status Chips & Pie Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">New Enquiries</span>
                    <span className="text-2xl font-black text-emerald-900">{admissionStats.newCount}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Contacted</span>
                    <span className="text-2xl font-black text-blue-900">{admissionStats.contactedCount}</span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Follow Up</span>
                    <span className="text-2xl font-black text-amber-900">{admissionStats.followUpCount}</span>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Confirmed</span>
                    <span className="text-2xl font-black text-purple-900">{admissionStats.confirmedCount}</span>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2">
                  <h3 className="text-base font-black text-[#001c46]">Admission Enquiries Conversion Status</h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartAdmissionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          dataKey="value"
                        >
                          {chartAdmissionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Admission Enquiries Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Admission Enquiry Submissions</h3>
                    <p className="text-xs text-gray-500">Public online enquiry records</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">Total: {filteredEnquiries.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Enquiry ID</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5">Grade</th>
                        <th className="px-6 py-3.5">Parent Name</th>
                        <th className="px-6 py-3.5">Phone</th>
                        <th className="px-6 py-3.5">Submitted Date</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-600">No admission enquiries match active filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredEnquiries.map((enq) => (
                          <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-[#001c46]">{enq.enquiryId}</td>
                            <td className="px-6 py-4 font-black text-[#001c46]">{enq.studentName || enq.submittedFormData?.studentName}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">{enq.grade || enq.submittedFormData?.grade}</td>
                            <td className="px-6 py-4 text-gray-700">{enq.parentName || enq.submittedFormData?.parentName}</td>
                            <td className="px-6 py-4 font-mono text-gray-800">+91 {enq.phone}</td>
                            <td className="px-6 py-4 text-gray-500">
                              {enq.submittedAt ? new Date(enq.submittedAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                                {enq.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESULTS REPORT */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Results Overview Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Students Appeared</span>
                  <div className="text-2xl font-black text-[#001c46] mt-1">{filteredExamResults.length}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Passed</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {filteredExamResults.filter((r) => r.status === 'PASSED' || r.percentage >= 33).length}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Failed</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {filteredExamResults.filter((r) => r.status === 'FAILED' && r.percentage < 33).length}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Average %</span>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    {filteredExamResults.length > 0
                      ? Math.round(
                          (filteredExamResults.reduce((acc, curr) => acc + curr.percentage, 0) /
                            filteredExamResults.length) *
                            10
                        ) / 10
                      : 0}%
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Examination & Marksheet Records</h3>
                    <p className="text-xs text-gray-500">Published student exam marks</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">Total: {filteredExamResults.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Exam Name</th>
                        <th className="px-6 py-3.5">Student ID</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5">Class & Section</th>
                        <th className="px-6 py-3.5">Marks Obtained</th>
                        <th className="px-6 py-3.5">Percentage (%)</th>
                        <th className="px-6 py-3.5">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredExamResults.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-600">No exam result records published yet.</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              When teachers or admins enter marks, student exam report cards will appear here.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredExamResults.map((res) => (
                          <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-extrabold text-[#001c46]">{res.examName}</td>
                            <td className="px-6 py-4 font-mono font-bold text-gray-700">{res.studentId}</td>
                            <td className="px-6 py-4 font-black text-[#001c46]">{res.studentName}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{res.className} ({res.section})</td>
                            <td className="px-6 py-4 font-mono font-bold text-gray-800">
                              {res.totalObtained} / {res.totalMax}
                            </td>
                            <td className="px-6 py-4 font-mono font-black text-[#001c46]">{res.percentage}%</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  res.status === 'PASSED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {res.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TEACHER REPORT */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              {/* Teacher Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Teachers</span>
                  <div className="text-2xl font-black text-amber-700 mt-1">{teacherStats.totalTeachers}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Staff</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{teacherStats.activeTeachers}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subjects Covered</span>
                  <div className="text-2xl font-black text-blue-800 mt-1">{teacherStats.totalSubjects}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Classes Assigned</span>
                  <div className="text-2xl font-black text-indigo-900 mt-1">{teacherStats.totalClassesAssigned}</div>
                </div>
              </div>

              {/* Faculty Table */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#001c46]">Faculty Roster & Workload</h3>
                    <p className="text-xs text-gray-500">Teacher specializations and assigned classes</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">Total: {filteredTeachers.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Teacher ID</th>
                        <th className="px-6 py-3.5">Faculty Name</th>
                        <th className="px-6 py-3.5">Subjects Taught</th>
                        <th className="px-6 py-3.5">Assigned Classes</th>
                        <th className="px-6 py-3.5">Phone</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-600">No teacher records match active filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTeachers.map((tch) => (
                          <tr key={tch.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-[#001c46]">{tch.teacherId}</td>
                            <td className="px-6 py-4 font-black text-[#001c46]">
                              {tch.name}
                              <span className="block text-[10px] text-gray-500 font-normal">{tch.email}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {tch.subjects?.map((subj, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                                    {subj}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {tch.assignedClasses?.map((cls, idx) => (
                                  <span key={idx} className="bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100">
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-800">+91 {tch.phone}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  tch.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {tch.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
