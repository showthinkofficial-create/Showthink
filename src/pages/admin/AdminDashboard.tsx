import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { portalUserService } from '../../services/portalUserService';
import { admissionService } from '../../services/admissionService';
import { feesService } from '../../services/feesService';
import { attendanceService } from '../../services/attendanceService';
import { noticeService } from '../../services/noticeService';

import { Student, CLASS_OPTIONS } from '../../types/student';
import { Teacher } from '../../types/teacher';
import { PortalUserWithStudents } from '../../types/portalUser';
import { AdmissionEnquiry, ADMISSION_STATUS_CONFIG } from '../../types/admission';
import { FeesDashboardStats } from '../../types/fees';
import { AttendanceTopStats } from '../../types/attendance';
import { Notice } from '../../types/notice';

import {
  Users,
  UserCheck,
  KeyRound,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Megaphone,
  Clock,
  Image,
  Eye,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  School,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { userProfile, user } = useAuth();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Section Errors
  const [errors, setErrors] = useState<{
    students?: string | null;
    teachers?: string | null;
    portalUsers?: string | null;
    admissions?: string | null;
    fees?: string | null;
    attendance?: string | null;
    notices?: string | null;
  }>({});

  // Real-time Firestore Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [portalUsers, setPortalUsers] = useState<PortalUserWithStudents[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [feesStats, setFeesStats] = useState<FeesDashboardStats>({
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    studentsWithPending: 0,
  });
  const [attendanceStats, setAttendanceStats] = useState<AttendanceTopStats>({
    totalStudents: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
  });
  const [notices, setNotices] = useState<Notice[]>([]);

  // Format today's date
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Fetch all dashboard data using Promise.allSettled for high resilience
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    const newErrors: typeof errors = {};

    const [
      studentsResult,
      teachersResult,
      portalUsersResult,
      enquiriesResult,
      feesResult,
      attendanceResult,
      noticesResult,
    ] = await Promise.allSettled([
      studentService.getStudents(),
      teacherService.getTeachers(),
      portalUserService.getPortalUsers(),
      admissionService.getEnquiries(),
      feesService.getFeesDashboardStats(),
      attendanceService.getTopStatsForDate(todayStr),
      noticeService.getNotices(),
    ]);

    // Handle Students
    if (studentsResult.status === 'fulfilled') {
      setStudents(studentsResult.value);
    } else {
      console.warn('Failed to fetch students:', studentsResult.reason);
      newErrors.students = 'Unable to load student metrics.';
    }

    // Handle Teachers
    if (teachersResult.status === 'fulfilled') {
      setTeachers(teachersResult.value);
    } else {
      console.warn('Failed to fetch teachers:', teachersResult.reason);
      newErrors.teachers = 'Unable to load faculty metrics.';
    }

    // Handle Portal Users
    if (portalUsersResult.status === 'fulfilled') {
      setPortalUsers(portalUsersResult.value);
    } else {
      console.warn('Failed to fetch portal users:', portalUsersResult.reason);
      newErrors.portalUsers = 'Unable to load portal user metrics.';
    }

    // Handle Admissions
    if (enquiriesResult.status === 'fulfilled') {
      setEnquiries(enquiriesResult.value);
    } else {
      console.warn('Failed to fetch enquiries:', enquiriesResult.reason);
      newErrors.admissions = 'Unable to load admission enquiries.';
    }

    // Handle Fees
    if (feesResult.status === 'fulfilled') {
      setFeesStats(feesResult.value);
    } else {
      console.warn('Failed to fetch fee statistics:', feesResult.reason);
      newErrors.fees = 'Unable to load fee ledger metrics.';
    }

    // Handle Attendance
    if (attendanceResult.status === 'fulfilled') {
      setAttendanceStats(attendanceResult.value);
    } else {
      console.warn('Failed to fetch attendance:', attendanceResult.reason);
      newErrors.attendance = 'Unable to load attendance records.';
    }

    // Handle Notices
    if (noticesResult.status === 'fulfilled') {
      setNotices(noticesResult.value);
    } else {
      console.warn('Failed to fetch notices:', noticesResult.reason);
      newErrors.notices = 'Unable to load notices.';
    }

    setErrors(newErrors);
    setLoading(false);
    setRefreshing(false);
  }, [todayStr]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Metric Calculations
  const totalStudentsCount = students.length;
  const activeStudentsCount = useMemo(
    () => students.filter((s) => s.status === 'ACTIVE').length,
    [students]
  );
  const totalTeachersCount = teachers.length;
  const activeTeachersCount = useMemo(
    () => teachers.filter((t) => t.status === 'ACTIVE').length,
    [teachers]
  );
  const disabledTeachersCount = useMemo(
    () => teachers.filter((t) => t.status === 'DISABLED').length,
    [teachers]
  );
  const portalUsersCount = portalUsers.length;
  const totalEnquiriesCount = enquiries.length;
  const confirmedAdmissionsCount = useMemo(
    () =>
      enquiries.filter(
        (e) => e.status === 'CONFIRMED' || e.status === 'APPROVED'
      ).length,
    [enquiries]
  );

  // Student Distribution by Class
  const classDistribution = useMemo(() => {
    const dist: { className: string; total: number; active: number }[] = [];
    CLASS_OPTIONS.forEach((cName) => {
      const matching = students.filter((s) => s.className === cName);
      dist.push({
        className: cName,
        total: matching.length,
        active: matching.filter((s) => s.status === 'ACTIVE').length,
      });
    });
    return dist;
  }, [students]);

  const maxStudentInAnyClass = useMemo(() => {
    const maxVal = Math.max(...classDistribution.map((c) => c.total), 0);
    return maxVal > 0 ? maxVal : 1;
  }, [classDistribution]);

  // Recent Admissions (latest 5-8)
  const recentAdmissions = useMemo(() => {
    return [...enquiries]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 6);
  }, [enquiries]);

  // Recent Portal Users (latest 5)
  const recentPortalUsers = useMemo(() => {
    return [...portalUsers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [portalUsers]);

  // Recent Notices (latest 4 published)
  const recentPublishedNotices = useMemo(() => {
    return notices
      .filter((n) => n.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, 4);
  }, [notices]);

  // Recent Teachers (latest 4)
  const recentTeachers = useMemo(() => {
    return [...teachers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [teachers]);

  // Attendance summary for today
  const hasAttendanceToday = useMemo(() => {
    const recorded =
      attendanceStats.present +
      attendanceStats.absent +
      attendanceStats.late +
      attendanceStats.halfDay;
    return recorded > 0;
  }, [attendanceStats]);

  // Dynamic greeting based on current hour
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const adminName =
    userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Administrator';
  const roleBadge =
    userProfile?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMINISTRATOR';

  // Format currency helper
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Main 8 Overview Stat Cards (Section 1)
  const overviewCards = [
    {
      id: 'total-students',
      label: 'Total Students',
      value: totalStudentsCount,
      subtext: 'Enrolled in academy',
      icon: Users,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200/80',
      accent: 'bg-blue-600',
      path: '/admin/students',
    },
    {
      id: 'active-students',
      label: 'Active Students',
      value: activeStudentsCount,
      subtext: `${totalStudentsCount - activeStudentsCount} disabled / inactive`,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
      accent: 'bg-emerald-600',
      path: '/admin/students',
    },
    {
      id: 'total-teachers',
      label: 'Total Teachers',
      value: totalTeachersCount,
      subtext: `${activeTeachersCount} active faculty members`,
      icon: UserCheck,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      accent: 'bg-amber-600',
      path: '/admin/teachers',
    },
    {
      id: 'portal-users',
      label: 'Portal Users',
      value: portalUsersCount,
      subtext: 'Registered credentials',
      icon: KeyRound,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200/80',
      accent: 'bg-indigo-600',
      path: '/admin/portal-users',
    },
    {
      id: 'admission-enquiries',
      label: 'Admission Enquiries',
      value: totalEnquiriesCount,
      subtext: 'Total online applications',
      icon: UserPlus,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200/80',
      accent: 'bg-purple-600',
      path: '/admin/admissions',
    },
    {
      id: 'confirmed-admissions',
      label: 'Confirmed Admissions',
      value: confirmedAdmissionsCount,
      subtext: 'Approved / enrolled seats',
      icon: CheckCircle2,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-200/80',
      accent: 'bg-teal-600',
      path: '/admin/admissions',
    },
    {
      id: 'total-collected-fee',
      label: 'Total Fee Collected',
      value: formatINR(feesStats.totalCollected),
      subtext: `From ${formatINR(feesStats.totalExpected)} expected`,
      icon: CreditCard,
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200/80',
      accent: 'bg-green-600',
      path: '/admin/fees',
    },
    {
      id: 'pending-fee',
      label: 'Pending Fee',
      value: formatINR(feesStats.totalPending),
      subtext: `${feesStats.studentsWithPending} students with dues`,
      icon: AlertTriangle,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200/80',
      accent: 'bg-rose-600',
      path: '/admin/fees',
    },
  ];

  // Quick Action Buttons (Section 2)
  const quickActions = [
    {
      label: '+ Add Student',
      path: '/admin/students/add',
      icon: Users,
      style: 'bg-[#001c46] hover:bg-[#002d6b] text-[#FFC907] border border-[#001c46]',
    },
    {
      label: '+ Add Teacher',
      path: '/admin/teachers/add',
      icon: UserCheck,
      style: 'bg-[#001c46] hover:bg-[#002d6b] text-[#FFC907] border border-[#001c46]',
    },
    {
      label: '+ Create Portal User',
      path: '/admin/portal-users',
      icon: KeyRound,
      style: 'bg-[#001c46] hover:bg-[#002d6b] text-white border border-[#001c46]',
    },
    {
      label: '+ Add Notice',
      path: '/admin/notices',
      icon: Megaphone,
      style: 'bg-white hover:bg-gray-50 text-[#001c46] border border-gray-300',
    },
    {
      label: '+ Add Timetable',
      path: '/admin/timetable',
      icon: Clock,
      style: 'bg-white hover:bg-gray-50 text-[#001c46] border border-gray-300',
    },
    {
      label: '+ Add Gallery Media',
      path: '/admin/gallery',
      icon: Image,
      style: 'bg-white hover:bg-gray-50 text-[#001c46] border border-gray-300',
    },
    {
      label: 'View Enquiries',
      path: '/admin/admissions',
      icon: Eye,
      style: 'bg-white hover:bg-gray-50 text-[#001c46] border border-gray-300',
    },
  ];

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER BANNER & GREETING                                         */}
      {/* ========================================================================= */}
      <div className="bg-[#001c46] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#001c46] bg-[#FFC907] px-2.5 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {roleBadge}
              </span>
              <span className="text-[11px] font-bold text-gray-300">
                {formattedToday}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {timeGreeting}, {adminName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Welcome to the centralized management console. Live institutional telemetry and administrative controls are synchronized below.
            </p>
          </div>

          {/* Sync & Refresh Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FFC907]' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Firestore'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN METRICS GRID (8 Clickable Cards)                                  */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-base font-black text-[#001c46] tracking-tight">
              Institutional Overview
            </h2>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            Click any card to open management section
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.path)}
                className={`bg-white p-5 rounded-3xl border ${card.border} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer group hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`p-2.5 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  {loading ? (
                    <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg mb-1" />
                  ) : (
                    <div className="text-2xl sm:text-3xl font-black text-[#001c46] tracking-tight group-hover:text-blue-800 transition-colors">
                      {card.value}
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-gray-500 mt-1 flex items-center justify-between">
                    <span>{card.subtext}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTIONS BAR (Section 2)                                          */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFC907]" />
            <h3 className="text-sm font-black text-[#001c46] tracking-tight uppercase">
              Quick Administrative Actions
            </h3>
          </div>
          <span className="text-[11px] font-medium text-gray-400">Direct Module Launch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate(action.path)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap ${action.style}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ATTENDANCE & FEES SUMMARY (Sections 4 & 5)                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#001c46]" />
                <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                  Today's Attendance Summary
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Records for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/attendance')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Attendance Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-3 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : errors.attendance ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
              <p className="text-xs font-bold text-red-600">{errors.attendance}</p>
              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : !hasAttendanceToday ? (
            <div className="p-6 bg-gray-50 border border-gray-200/80 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-gray-700">
                  No attendance data recorded today.
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Teachers or administrators have not yet logged daily attendance for today's sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/attendance')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001c46] text-[#FFC907] text-xs font-bold cursor-pointer hover:bg-[#002866]"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Mark Attendance Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                  Present
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {attendanceStats.present}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                  {activeStudentsCount > 0
                    ? Math.round((attendanceStats.present / activeStudentsCount) * 100)
                    : 0}
                  % of Active
                </span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
                  Absent
                </span>
                <div className="text-2xl font-black text-rose-700 mt-1">
                  {attendanceStats.absent}
                </div>
                <span className="text-[10px] text-rose-600 font-bold mt-0.5 block">
                  Recorded absent
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                  Late
                </span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {attendanceStats.late}
                </div>
                <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
                  Late arrivals
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
                  Half Day
                </span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {attendanceStats.halfDay}
                </div>
                <span className="text-[10px] text-blue-600 font-bold mt-0.5 block">
                  Half day leaves
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fees Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#001c46]" />
                <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                  Fee Collection Ledger Summary
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Current academic fiscal cycle statistics
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/fees')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Fee Management</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : errors.fees ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
              <p className="text-xs font-bold text-red-600">{errors.fees}</p>
              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200/80 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">
                    Total Expected
                  </span>
                  <div className="text-lg font-black text-gray-900 mt-1">
                    {formatINR(feesStats.totalExpected)}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                    Collected
                  </span>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {formatINR(feesStats.totalCollected)}
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
                    Pending
                  </span>
                  <div className="text-lg font-black text-rose-700 mt-1">
                    {formatINR(feesStats.totalPending)}
                  </div>
                </div>
              </div>

              {/* Collection Progress */}
              <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-200/60">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Collection Ratio</span>
                  <span>
                    {feesStats.totalExpected > 0
                      ? Math.round((feesStats.totalCollected / feesStats.totalExpected) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        feesStats.totalExpected > 0
                          ? Math.min(100, Math.round((feesStats.totalCollected / feesStats.totalExpected) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. STUDENT DISTRIBUTION OVERVIEW BY CLASS (Section 8)                    */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#001c46]" />
              <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                Student Enrollment Distribution by Class
              </h3>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Live headcount across Nursery to Class 12
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admin/students')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open Student Directory</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2.5 py-4">
            {CLASS_OPTIONS.map((c) => (
              <div key={c} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : errors.students ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
            <p className="text-xs font-bold text-red-600">{errors.students}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {classDistribution.map((item) => {
              const fillPct = (item.total / maxStudentInAnyClass) * 100;
              return (
                <div
                  key={item.className}
                  onClick={() => onNavigate('/admin/students')}
                  className="bg-gray-50/80 hover:bg-blue-50/50 border border-gray-200/80 hover:border-blue-200 p-3 rounded-2xl transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#001c46] group-hover:text-blue-700 truncate">
                      {item.className}
                    </span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        item.total > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {item.total}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#001c46] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-gray-500 font-medium flex justify-between">
                    <span>Active</span>
                    <span className="font-bold text-emerald-600">{item.active}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. ADMISSIONS & FACULTY SUMMARY (Sections 3 & 9)                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#001c46]" />
                  <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                    Recent Admission Enquiries
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Latest online applications submitted by prospective parents
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/admissions')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All Enquiries</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : errors.admissions ? (
              <div className="p-6 text-center text-red-600 text-xs font-bold">
                {errors.admissions}
              </div>
            ) : recentAdmissions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                  <UserPlus className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-600">No admission enquiries recorded yet.</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  When parents submit admission inquiries via the public portal, they will be logged here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-[#001c46] uppercase font-black text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Parent / Guardian</th>
                      <th className="px-3 py-3">Class</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentAdmissions.map((enq) => {
                      const cfg =
                        ADMISSION_STATUS_CONFIG[enq.status] ||
                        ADMISSION_STATUS_CONFIG.NEW;
                      const dateStr = enq.submittedAt
                        ? new Date(enq.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : '—';

                      return (
                        <tr
                          key={enq.id}
                          onClick={() => onNavigate(`/admin/admissions/${enq.id}`)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-bold text-[#001c46]">
                            {enq.studentName || enq.submittedFormData?.studentName || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">
                            {enq.parentName || enq.submittedFormData?.parentName || '—'}
                          </td>
                          <td className="px-3 py-3 font-bold text-gray-800">
                            {enq.grade || enq.submittedFormData?.grade || '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600">
                            +91 {enq.phone || enq.submittedFormData?.phone || '—'}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 font-medium text-[11px]">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Teacher / Faculty Overview (Takes 1 col) */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#001c46]" />
                  <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                    Faculty Overview
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Academic staff & teaching faculty
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/teachers')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {/* Quick stats triad */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl text-center">
                <span className="text-[9px] font-extrabold text-amber-800 uppercase block">Total</span>
                <span className="text-base font-black text-amber-900">{totalTeachersCount}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl text-center">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase block">Active</span>
                <span className="text-base font-black text-emerald-900">{activeTeachersCount}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl text-center">
                <span className="text-[9px] font-extrabold text-rose-800 uppercase block">Disabled</span>
                <span className="text-base font-black text-rose-900">{disabledTeachersCount}</span>
              </div>
            </div>

            {/* Recently added faculty */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                Recently Added Faculty
              </span>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentTeachers.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No teachers registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentTeachers.map((t) => (
                    <div
                      key={t.uid}
                      onClick={() => onNavigate(`/admin/teachers/${t.uid}`)}
                      className="p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 bg-gray-50/60 hover:bg-blue-50/30 flex items-center justify-between transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-gray-900 truncate leading-tight">{t.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{t.subject || t.designation || 'Teacher'}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md shrink-0 uppercase ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/teachers/add')}
            className="w-full py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#001c46] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Faculty Member</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. RECENT PORTAL USERS & NOTICES (Sections 6 & 7)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Portal Users */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#001c46]" />
                  <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                    Recent Portal User Credentials
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Combined Student & Parent authentication accounts
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/portal-users')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Portal Users</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentPortalUsers.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <KeyRound className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-600">No portal accounts created yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/portal-users')}
                  className="px-3.5 py-1.5 bg-[#001c46] text-[#FFC907] text-xs font-bold rounded-xl"
                >
                  + Create Portal User
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 mt-2">
                {recentPortalUsers.map((pu) => {
                  const std = pu.primaryStudent;
                  return (
                    <div
                      key={pu.uid}
                      onClick={() => onNavigate('/admin/portal-users')}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#001c46] truncate">
                          {std ? std.name : pu.displayName}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono truncate">{pu.email}</p>
                        {std && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            Class: {std.className} ({std.section}) • ID: {std.studentId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            pu.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {pu.status}
                        </span>

                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            pu.loginEnabled
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {pu.loginEnabled ? 'Login ON' : 'Login OFF'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Published Notices */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#001c46]" />
                  <h3 className="text-sm font-black text-[#001c46] tracking-tight">
                    Notice Board Broadcasts
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Published administrative announcements
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/notices')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All Notices</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentPublishedNotices.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Megaphone className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-600">No published notices available.</p>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/notices')}
                  className="px-3.5 py-1.5 bg-[#001c46] text-[#FFC907] text-xs font-bold rounded-xl"
                >
                  + Add New Notice
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 mt-2">
                {recentPublishedNotices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onNavigate('/admin/notices')}
                    className="py-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#001c46] truncate">
                        {n.title}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          n.priority === 'URGENT'
                            ? 'bg-red-100 text-red-800'
                            : n.priority === 'IMPORTANT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>Audience: {n.targetAudience.replace('_', ' ')}</span>
                      <span>
                        {new Date(n.publishDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. SCHOOL INFORMATION CARD (Section 10)                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left: Branding & Motto */}
          <div className="space-y-2 md:border-r md:border-gray-100 md:pr-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#001c46] text-[#FFC907] flex items-center justify-center font-black text-sm">
                GP
              </div>
              <div>
                <h3 className="text-base font-black text-[#001c46] tracking-tight">
                  GP Academy
                </h3>
                <p className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">
                  Knowledge Is the biggest money
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              Affiliated institution delivering quality CBSE & UP Board educational excellence.
            </p>
          </div>

          {/* Middle: Address & Phone */}
          <div className="space-y-2 md:border-r md:border-gray-100 md:pr-6 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#001c46] shrink-0 mt-0.5" />
              <p className="leading-snug">
                Bhangel, Goyal Colony, Salarpur Khadar, Noida, Uttar Pradesh — 201304
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Phone className="w-4 h-4 text-[#001c46] shrink-0" />
              <span className="font-mono font-bold text-gray-900">+91 9818776563</span>
            </div>
          </div>

          {/* Right: School Hours */}
          <div className="space-y-1.5 text-xs text-gray-700 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-1.5 font-bold text-[#001c46]">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>Operational Hours</span>
            </div>
            <div className="text-[11px] space-y-0.5 text-gray-600">
              <p>
                <strong className="text-gray-900">Monday–Saturday:</strong> 8:00 AM – 3:00 PM
              </p>
              <p>
                <strong className="text-gray-900">Sunday:</strong> 9:00 AM – 2:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
