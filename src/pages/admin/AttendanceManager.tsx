import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Save,
  RotateCcw,
  CheckCheck,
  FileText,
  BarChart2,
  CalendarCheck,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceTopStats,
  MonthlyAttendanceSummaryItem,
  StudentAttendanceItem,
  StudentAttendanceSummary,
  ABSENCE_REASONS,
  AbsenceReasonKey,
  getAbsenceReasonDetails,
  formatTime12Hour,
  getCurrentTimeString
} from '../../types/attendance';
import { Student, CLASS_OPTIONS } from '../../types/student';
import { AbsenceReasonBadge } from '../../components/admin/attendance/AbsenceReasonBadge';
import { AbsentStudentsTab } from '../../components/admin/attendance/AbsentStudentsTab';
import { AdminAttendanceCalendarTab } from '../../components/admin/attendance/AdminAttendanceCalendarTab';
import { LogIn, LogOut, Timer } from 'lucide-react';

interface AttendanceManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

type TabKey = 'mark' | 'calendar' | 'absent-students' | 'history' | 'student-summary' | 'monthly';

const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const STATUS_OPTIONS: { label: string; value: AttendanceStatus; color: string; badge: string; bg: string }[] = [
  { label: 'Present', value: 'PRESENT', color: 'bg-emerald-600 text-white', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', bg: 'hover:bg-emerald-50' },
  { label: 'Absent', value: 'ABSENT', color: 'bg-rose-600 text-white', badge: 'bg-rose-100 text-rose-800 border-rose-300', bg: 'hover:bg-rose-50' },
  { label: 'Leave', value: 'LEAVE', color: 'bg-amber-500 text-white', badge: 'bg-amber-100 text-amber-800 border-amber-300', bg: 'hover:bg-amber-50' },
  { label: 'Late', value: 'LATE', color: 'bg-amber-600 text-white', badge: 'bg-amber-100 text-amber-800 border-amber-300', bg: 'hover:bg-amber-50' },
  { label: 'Half Day', value: 'HALF_DAY', color: 'bg-indigo-600 text-white', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', bg: 'hover:bg-indigo-50' },
];

export default function AttendanceManager({ currentPath, onNavigate }: AttendanceManagerProps) {
  const { user } = useAuth();
  
  // Tab determination from path or local state
  const getActiveTabFromPath = (path: string): TabKey => {
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/absent')) return 'absent-students';
    if (path.includes('/history')) return 'history';
    if (path.includes('/summary')) return 'student-summary';
    if (path.includes('/monthly')) return 'monthly';
    return 'mark';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(() => getActiveTabFromPath(currentPath));

  useEffect(() => {
    setActiveTab(getActiveTabFromPath(currentPath));
  }, [currentPath]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'mark') onNavigate('/admin/attendance');
    else if (tab === 'calendar') onNavigate('/admin/attendance/calendar');
    else if (tab === 'absent-students') onNavigate('/admin/attendance/absent');
    else if (tab === 'history') onNavigate('/admin/attendance/history');
    else if (tab === 'student-summary') onNavigate('/admin/attendance/summary');
    else if (tab === 'monthly') onNavigate('/admin/attendance/monthly');
  };

  // ----------------------------------------------------
  // SHARED STATE & FILTERS
  // ----------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedSection, setSelectedSection] = useState<string>('A');

  // Dashboard Stats
  const [stats, setStats] = useState<AttendanceTopStats>({
    totalStudents: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Load Dashboard Stats whenever selected date changes
  const loadStats = async (dateVal: string) => {
    setLoadingStats(true);
    try {
      const topData = await attendanceService.getTopStatsForDate(dateVal);
      setStats(topData);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats(selectedDate);
  }, [selectedDate]);

  // ----------------------------------------------------
  // TAB 1: MARK ATTENDANCE STATE
  // ----------------------------------------------------
  const [studentList, setStudentList] = useState<StudentAttendanceItem[]>([]);
  const [initialStudentList, setInitialStudentList] = useState<StudentAttendanceItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);
  const [savingAttendance, setSavingAttendance] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Load students for selected class, section, date
  const loadAttendanceStudents = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) return;
    setLoadingStudents(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const { students, isExisting } = await attendanceService.getStudentsForAttendance(
        selectedClass,
        selectedSection,
        selectedDate
      );
      setStudentList(students);
      setInitialStudentList(JSON.parse(JSON.stringify(students)));
      setIsExistingRecord(isExisting);
    } catch (err) {
      console.error('Error loading attendance students:', err);
      setSaveErrorMsg('Failed to load students for selected criteria.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark') {
      loadAttendanceStudents();
    }
  }, [selectedClass, selectedSection, selectedDate, activeTab]);

  // Tab 1: Filter state inside Mark Attendance
  const [markStatusFilter, setMarkStatusFilter] = useState<'ALL' | AttendanceStatus>('ALL');

  // Handle status toggle for individual student
  const handleStatusChange = (studentDocUid: string, newStatus: AttendanceStatus) => {
    setStudentList((prev) =>
      prev.map((item) => {
        if (item.studentDocUid === studentDocUid) {
          return {
            ...item,
            status: newStatus,
            // If changing to ABSENT and no reason set, set default to UNINFORMED
            absenceReason:
              newStatus === 'ABSENT'
                ? item.absenceReason || 'UNINFORMED'
                : undefined,
            absenceNote: newStatus === 'ABSENT' ? item.absenceNote : undefined,
          };
        }
        return item;
      })
    );
    setSaveSuccessMsg(null);
  };

  // Handle reason change for absent student
  const handleReasonChange = (
    studentDocUid: string,
    reason: AbsenceReasonKey | string
  ) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentDocUid
          ? { ...item, status: 'ABSENT', absenceReason: reason }
          : item
      )
    );
    setSaveSuccessMsg(null);
  };

  // Handle note change for absent student
  const handleNoteChange = (studentDocUid: string, note: string) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentDocUid
          ? { ...item, absenceNote: note }
          : item
      )
    );
    setSaveSuccessMsg(null);
  };

  // ----------------------------------------------------
  // STUDENT TIMING (ARRIVAL & DEPARTURE) HANDLERS
  // ----------------------------------------------------
  const [bulkInTimeInput, setBulkInTimeInput] = useState<string>('08:00');
  const [bulkOutTimeInput, setBulkOutTimeInput] = useState<string>('13:30');

  const handleInTimeChange = (studentDocUid: string, inTime: string) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentDocUid ? { ...item, inTime } : item
      )
    );
    setSaveSuccessMsg(null);
  };

  const handleOutTimeChange = (studentDocUid: string, outTime: string) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentDocUid ? { ...item, outTime } : item
      )
    );
    setSaveSuccessMsg(null);
  };

  const handleSetCurrentTime = (studentDocUid: string, type: 'in' | 'out') => {
    const curTime = getCurrentTimeString();
    setStudentList((prev) =>
      prev.map((item) => {
        if (item.studentDocUid === studentDocUid) {
          return type === 'in' ? { ...item, inTime: curTime } : { ...item, outTime: curTime };
        }
        return item;
      })
    );
    setSaveSuccessMsg(null);
  };

  const handleClearTiming = (studentDocUid: string) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentDocUid ? { ...item, inTime: '', outTime: '' } : item
      )
    );
    setSaveSuccessMsg(null);
  };

  // Bulk Apply In-Time to all present/late/halfday students
  const handleBulkApplyInTime = (timeVal: string) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.status !== 'ABSENT' ? { ...item, inTime: timeVal } : item
      )
    );
    setSaveSuccessMsg(`Applied arrival time ${formatTime12Hour(timeVal)} to present students.`);
  };

  // Bulk Apply Out-Time to all present/late/halfday students
  const handleBulkApplyOutTime = (timeVal: string) => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.status !== 'ABSENT' ? { ...item, outTime: timeVal } : item
      )
    );
    setSaveSuccessMsg(`Applied departure time ${formatTime12Hour(timeVal)} to present students.`);
  };

  // Bulk Apply Standard Day Schedule (08:00 AM - 01:30 PM)
  const handleBulkApplyStandardSchedule = () => {
    setStudentList((prev) =>
      prev.map((item) =>
        item.status !== 'ABSENT'
          ? { ...item, inTime: bulkInTimeInput || '08:00', outTime: bulkOutTimeInput || '13:30' }
          : item
      )
    );
    setSaveSuccessMsg(`Applied standard schedule (In: ${formatTime12Hour(bulkInTimeInput || '08:00')} - Out: ${formatTime12Hour(bulkOutTimeInput || '13:30')}) to all present students.`);
  };

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    if (!studentList.length) return;
    
    setStudentList((prev) =>
      prev.map((item) => {
        if (status === 'PRESENT') {
          return {
            ...item,
            status: 'PRESENT' as AttendanceStatus,
            absenceReason: undefined,
            absenceNote: undefined,
            inTime: item.inTime || bulkInTimeInput || '08:00',
            outTime: item.outTime || bulkOutTimeInput || '13:30',
          };
        } else if (status === 'ABSENT') {
          return {
            ...item,
            status: 'ABSENT' as AttendanceStatus,
            absenceReason: item.absenceReason || 'UNINFORMED',
            absenceNote: item.absenceNote || undefined,
            inTime: '',
            outTime: '',
          };
        } else {
          return {
            ...item,
            status,
            absenceReason: undefined,
            absenceNote: undefined,
          };
        }
      })
    );

    // Reset status sub-filter to ALL so all updated records remain visible
    setMarkStatusFilter('ALL');
    setSaveErrorMsg(null);

    if (status === 'PRESENT') {
      setSaveSuccessMsg(`All ${studentList.length} students marked as PRESENT (Timings: In ${formatTime12Hour(bulkInTimeInput || '08:00')} - Out ${formatTime12Hour(bulkOutTimeInput || '13:30')}). Click "Save Attendance" to save to database.`);
    } else if (status === 'ABSENT') {
      setSaveSuccessMsg(`All ${studentList.length} students marked as ABSENT. You can select specific absence reasons below, then click "Save Attendance".`);
    }
  };

  const handleReset = () => {
    setStudentList(JSON.parse(JSON.stringify(initialStudentList)));
    setMarkStatusFilter('ALL');
    setSaveSuccessMsg('Attendance list reset to initial state.');
    setSaveErrorMsg(null);
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (!studentList.length) return;
    setSavingAttendance(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const markedBy = user?.displayName || user?.email || 'ADMIN';
      await attendanceService.saveAttendanceBatch(
        studentList,
        selectedDate,
        selectedClass,
        selectedSection,
        markedBy
      );

      setSaveSuccessMsg('Attendance saved successfully.');
      setIsExistingRecord(true);
      setInitialStudentList(JSON.parse(JSON.stringify(studentList)));

      // Refresh top stats
      await loadStats(selectedDate);
    } catch (err: any) {
      console.error('Save attendance error:', err);
      setSaveErrorMsg(err.message || 'Failed to save attendance. Please try again.');
    } finally {
      setSavingAttendance(false);
    }
  };

  // ----------------------------------------------------
  // TAB 2: ATTENDANCE HISTORY STATE
  // ----------------------------------------------------
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyFilterDate, setHistoryFilterDate] = useState<string>('');
  const [historyFilterClass, setHistoryFilterClass] = useState<string>('');
  const [historyFilterSection, setHistoryFilterSection] = useState<string>('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>('ALL');
  const [historyFilterReason, setHistoryFilterReason] = useState<string>('ALL');
  const [historyFilterSearch, setHistoryFilterSearch] = useState<string>('');

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const records = await attendanceService.getAttendanceHistory({
        date: historyFilterDate || undefined,
        className: historyFilterClass || undefined,
        section: historyFilterSection || undefined,
        status: historyFilterStatus !== 'ALL' ? historyFilterStatus : undefined,
        absenceReason: historyFilterReason !== 'ALL' ? historyFilterReason : undefined,
        studentSearch: historyFilterSearch || undefined,
      });
      setHistoryRecords(records);
    } catch (err) {
      console.error('Error loading attendance history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [
    activeTab,
    historyFilterDate,
    historyFilterClass,
    historyFilterSection,
    historyFilterStatus,
    historyFilterReason,
    historyFilterSearch,
  ]);

  // ----------------------------------------------------
  // TAB 3: STUDENT SUMMARY STATE
  // ----------------------------------------------------
  const [allActiveStudents, setAllActiveStudents] = useState<Student[]>([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [studentSummary, setStudentSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [studentSearchInput, setStudentSearchInput] = useState<string>('');

  // Fetch all active students for dropdown picker
  useEffect(() => {
    studentService.getStudents().then((stds) => {
      const active = stds.filter((s) => s.status === 'ACTIVE');
      setAllActiveStudents(active);
      if (active.length > 0 && !selectedStudentUid) {
        setSelectedStudentUid(active[0].uid);
      }
    });
  }, []);

  const loadStudentSummary = async (uid: string) => {
    if (!uid) return;
    setLoadingSummary(true);
    try {
      const summary = await attendanceService.getStudentAttendanceSummary(uid);
      setStudentSummary(summary);
    } catch (err) {
      console.error('Error loading student summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'student-summary' && selectedStudentUid) {
      loadStudentSummary(selectedStudentUid);
    }
  }, [activeTab, selectedStudentUid]);

  // ----------------------------------------------------
  // TAB 4: MONTHLY SUMMARY STATE
  // ----------------------------------------------------
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [monthlyYear, setMonthlyYear] = useState<number>(currentYear);
  const [monthlyMonth, setMonthlyMonth] = useState<number>(currentMonth);
  const [monthlyClass, setMonthlyClass] = useState<string>('Class 1');
  const [monthlySection, setMonthlySection] = useState<string>('A');
  const [monthlyItems, setMonthlyItems] = useState<MonthlyAttendanceSummaryItem[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState<boolean>(false);

  // Pagination for monthly table
  const [monthlyPage, setMonthlyPage] = useState<number>(1);
  const itemsPerPage = 10;

  const loadMonthlySummary = async () => {
    if (!monthlyClass || !monthlySection) return;
    setLoadingMonthly(true);
    try {
      const items = await attendanceService.getMonthlySummary(
        monthlyYear,
        monthlyMonth,
        monthlyClass,
        monthlySection
      );
      setMonthlyItems(items);
      setMonthlyPage(1);
    } catch (err) {
      console.error('Error loading monthly summary:', err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'monthly') {
      loadMonthlySummary();
    }
  }, [activeTab, monthlyYear, monthlyMonth, monthlyClass, monthlySection]);

  const totalMonthlyPages = Math.ceil(monthlyItems.length / itemsPerPage) || 1;
  const paginatedMonthlyItems = monthlyItems.slice(
    (monthlyPage - 1) * itemsPerPage,
    monthlyPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* SECTION TITLE & NAVIGATION TABS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#001c46] text-[#FFC907] rounded-xl shadow-xs">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#001c46] tracking-tight">
                  Attendance Management
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Track daily roll call, manage working-day records & audit institutional summaries
                </p>
              </div>
            </div>
          </div>

          {/* Quick Date Display */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 self-start md:self-auto">
            <Calendar className="w-4 h-4 text-[#001c46]" />
            <span>Date: {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => handleTabChange('mark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'mark'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={() => handleTabChange('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance Calendar</span>
          </button>

          <button
            onClick={() => handleTabChange('absent-students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'absent-students'
                ? 'bg-rose-700 text-white shadow-md'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Absent Students</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'absent-students'
                  ? 'bg-rose-900 text-rose-100'
                  : 'bg-rose-200 text-rose-900'
              }`}
            >
              {stats.absent}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Attendance History</span>
          </button>

          <button
            onClick={() => handleTabChange('student-summary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'student-summary'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Summary</span>
          </button>

          <button
            onClick={() => handleTabChange('monthly')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-[#001c46] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Monthly Summary</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TOP DASHBOARD METRICS CARDS (Real Firestore Data) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Active</span>
            <Users className="w-4 h-4 text-[#001c46]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#001c46]">
              {loadingStats ? '...' : stats.totalStudents}
            </span>
            <span className="text-[10px] font-bold text-gray-400">Enrolled</span>
          </div>
        </div>

        {/* Present */}
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {loadingStats ? '...' : stats.present}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600">
              {stats.totalStudents > 0
                ? `${Math.round((stats.present / stats.totalStudents) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-rose-700">
              {loadingStats ? '...' : stats.absent}
            </span>
            <span className="text-[10px] font-extrabold text-rose-600">
              {stats.totalStudents > 0
                ? `${Math.round((stats.absent / stats.totalStudents) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Late */}
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Late</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {loadingStats ? '...' : stats.late}
            </span>
            <span className="text-[10px] font-extrabold text-amber-600">
              {stats.totalStudents > 0
                ? `${Math.round((stats.late / stats.totalStudents) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Half Day */}
        <div className="col-span-2 sm:col-span-1 bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Half Day</span>
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-indigo-700">
              {loadingStats ? '...' : stats.halfDay}
            </span>
            <span className="text-[10px] font-extrabold text-indigo-600">
              {stats.totalStudents > 0
                ? `${Math.round((stats.halfDay / stats.totalStudents) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: MARK ATTENDANCE VIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* FILTER CONTROLS BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#FFC907]" />
                Select Attendance Target
              </h2>
              {isExistingRecord && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Editing Existing Attendance
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Class Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#001c46] focus:outline-none"
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#001c46] focus:outline-none"
                >
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Attendance Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#001c46] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BULK ACTIONS & SAVE ACTION HEADER */}
          {studentList.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-[#001c46] uppercase tracking-wider mr-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC907]" />
                  Bulk Actions:
                </span>

                {/* Button 1: Mark All Present */}
                <button
                  type="button"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 hover:shadow-md"
                  title="Mark all active students in class as Present"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                  <span>Mark All Present</span>
                  <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-700/80 rounded-md text-[10px] font-mono">
                    {studentList.length}
                  </span>
                </button>

                {/* Button 2: Mark All Absent */}
                <button
                  type="button"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 hover:shadow-md"
                  title="Mark all active students in class as Absent"
                >
                  <XCircle className="w-4 h-4 text-rose-100" />
                  <span>Mark All Absent</span>
                  <span className="ml-0.5 px-1.5 py-0.2 bg-rose-700/80 rounded-md text-[10px] font-mono">
                    {studentList.length}
                  </span>
                </button>

                {/* Button 3: Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Reset attendance to previous saved values"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                  <span>Reset</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#001c46] hover:bg-[#002d6b] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAttendance ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFC907]" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#FFC907]" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* SUCCESS / ERROR ALERTS */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
              <button
                onClick={() => setSaveSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-900 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {saveErrorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
              <button
                onClick={() => setSaveErrorMsg(null)}
                className="text-rose-600 hover:text-rose-900 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* STUDENT ATTENDANCE LIST & TABLE */}
          {loadingStudents ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">
                Loading students for {selectedClass} - Sec {selectedSection}...
              </p>
            </div>
          ) : !selectedClass || !selectedSection ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
              <Filter className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">Select class and section to mark attendance.</h3>
            </div>
          ) : studentList.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No students available for attendance.</h3>
              <p className="text-xs text-gray-500">
                No active students were found enrolled in {selectedClass} - Section {selectedSection}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider">
                  Students List ({studentList.length} Active Enrolled)
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  {selectedClass} ({selectedSection}) — {selectedDate}
                </span>
              </div>

              {/* SUB-FILTER PILLS & TIMING ASSISTANT FOR MARKING VIEW */}
              <div className="px-5 py-3 bg-gray-50/70 border-b border-gray-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase mr-1">Filter list:</span>
                    <button
                      type="button"
                      onClick={() => setMarkStatusFilter('ALL')}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        markStatusFilter === 'ALL'
                          ? 'bg-[#001c46] text-white border-[#001c46] shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      All ({studentList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkStatusFilter('PRESENT')}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        markStatusFilter === 'PRESENT'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-emerald-700 border-gray-200 hover:bg-emerald-50'
                      }`}
                    >
                      Present ({studentList.filter((s) => s.status === 'PRESENT').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkStatusFilter('ABSENT')}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 ${
                        markStatusFilter === 'ABSENT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent ({studentList.filter((s) => s.status === 'ABSENT').length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkStatusFilter('LATE')}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        markStatusFilter === 'LATE'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-white text-amber-700 border-gray-200 hover:bg-amber-50'
                      }`}
                    >
                      Late ({studentList.filter((s) => s.status === 'LATE').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkStatusFilter('HALF_DAY')}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        markStatusFilter === 'HALF_DAY'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-indigo-700 border-gray-200 hover:bg-indigo-50'
                      }`}
                    >
                      Half Day ({studentList.filter((s) => s.status === 'HALF_DAY').length})
                    </button>
                  </div>

                  {markStatusFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setMarkStatusFilter('ALL')}
                      className="text-[11px] font-bold text-gray-500 hover:text-gray-900 underline cursor-pointer"
                    >
                      Show all
                    </button>
                  )}
                </div>

                {/* TIMING HELPER TOOLBAR (Kitne baje aaya / gya manual & bulk timing) */}
                <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#001c46] font-black">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Timing Helper (आगमन व प्रस्थान समय):</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Bulk In Time */}
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase">In:</span>
                      <input
                        type="time"
                        value={bulkInTimeInput}
                        onChange={(e) => setBulkInTimeInput(e.target.value)}
                        className="text-xs font-bold text-gray-800 bg-transparent border-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleBulkApplyInTime(bulkInTimeInput)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase cursor-pointer"
                        title="Apply arrival time to all present students"
                      >
                        Apply In
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyInTime(getCurrentTimeString())}
                        className="px-1.5 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
                        title="Set Current Time as In-Time"
                      >
                        Now
                      </button>
                    </div>

                    {/* Bulk Out Time */}
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase">Out:</span>
                      <input
                        type="time"
                        value={bulkOutTimeInput}
                        onChange={(e) => setBulkOutTimeInput(e.target.value)}
                        className="text-xs font-bold text-gray-800 bg-transparent border-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleBulkApplyOutTime(bulkOutTimeInput)}
                        className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase cursor-pointer"
                        title="Apply departure time to all present students"
                      >
                        Apply Out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyOutTime(getCurrentTimeString())}
                        className="px-1.5 py-0.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold text-[10px] cursor-pointer"
                        title="Set Current Time as Out-Time"
                      >
                        Now
                      </button>
                    </div>

                    {/* Quick Standard Day */}
                    <button
                      type="button"
                      onClick={handleBulkApplyStandardSchedule}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-[11px] cursor-pointer"
                    >
                      ⚡ Standard Day (08:00 AM - 01:30 PM)
                    </button>
                  </div>
                </div>
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Roll No.</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4 text-center">Attendance Status</th>
                      <th className="py-3 px-4 text-center min-w-[240px]">Timing (आगमन व प्रस्थान समय)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {studentList
                      .filter((item) => markStatusFilter === 'ALL' || item.status === markStatusFilter)
                      .map((item) => {
                        const isAbsent = item.status === 'ABSENT';
                        const isLate = item.status === 'LATE';
                        const isHalfDay = item.status === 'HALF_DAY';
                        const currentReasonKey = item.absenceReason || 'UNINFORMED';

                        return (
                          <React.Fragment key={item.studentDocUid}>
                            <tr className={`transition-colors ${isAbsent ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-gray-50/80'}`}>
                              <td className="py-3.5 px-4 font-bold text-gray-700">{item.rollNumber}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#001c46]">
                                {item.studentId}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-extrabold text-gray-900">{item.name}</div>
                                {isAbsent && (
                                  <div className="mt-1">
                                    <AbsenceReasonBadge
                                      reasonKey={item.absenceReason || 'UNINFORMED'}
                                      note={item.absenceNote}
                                      size="sm"
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  {STATUS_OPTIONS.map((opt) => {
                                    const isSelected = item.status === opt.value;
                                    return (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleStatusChange(item.studentDocUid, opt.value)}
                                        className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                                          isSelected
                                            ? `${opt.color} shadow-xs border-transparent font-black scale-105`
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* TIMING COLUMN (In Time & Out Time) */}
                              <td className="py-3.5 px-4">
                                {isAbsent ? (
                                  <div className="text-center text-gray-400 font-medium italic text-[11px]">
                                    — Not Applicable (Absent) —
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    {/* In Time (Kitne baje aaya) */}
                                    <div
                                      className={`flex items-center gap-1 px-2 py-1 rounded-xl border transition-all ${
                                        isLate
                                          ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
                                          : 'bg-gray-50 border-gray-200 focus-within:border-emerald-500'
                                      }`}
                                      title={isLate ? 'Late Arrival Time' : 'In-Time / Arrival Time'}
                                    >
                                      <span className="text-[10px] font-black text-emerald-700">IN:</span>
                                      <input
                                        type="time"
                                        value={item.inTime || ''}
                                        onChange={(e) => handleInTimeChange(item.studentDocUid, e.target.value)}
                                        className="w-[78px] text-xs font-bold text-gray-800 bg-transparent border-0 focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSetCurrentTime(item.studentDocUid, 'in')}
                                        className="text-[10px] px-1 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold cursor-pointer"
                                        title="Set current time"
                                      >
                                        Now
                                      </button>
                                    </div>

                                    {/* Out Time (Kitne baje gya) */}
                                    <div
                                      className={`flex items-center gap-1 px-2 py-1 rounded-xl border transition-all ${
                                        isHalfDay
                                          ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                                          : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
                                      }`}
                                      title={isHalfDay ? 'Half-Day Departure Time' : 'Out-Time / Departure Time'}
                                    >
                                      <span className="text-[10px] font-black text-indigo-700">OUT:</span>
                                      <input
                                        type="time"
                                        value={item.outTime || ''}
                                        onChange={(e) => handleOutTimeChange(item.studentDocUid, e.target.value)}
                                        className="w-[78px] text-xs font-bold text-gray-800 bg-transparent border-0 focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSetCurrentTime(item.studentDocUid, 'out')}
                                        className="text-[10px] px-1 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold cursor-pointer"
                                        title="Set current time"
                                      >
                                        Now
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>

                            {/* INLINE REASON EXPANSION FOR ABSENT STUDENTS */}
                            {isAbsent && (
                              <tr className="bg-rose-50/40 border-b border-rose-100/80">
                                <td colSpan={5} className="px-6 py-3">
                                  <div className="bg-white/90 p-3 rounded-xl border border-rose-200/90 shadow-2xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-1.5">
                                        <span>📌</span>
                                        <span>Reason for Absence (अनुपस्थिति का कारण):</span>
                                      </span>
                                      <span className="text-[11px] font-bold text-rose-600">
                                        Select reason for {item.name}
                                      </span>
                                    </div>

                                    {/* 4 Standard Reasons Chips */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {ABSENCE_REASONS.map((r) => {
                                        const isReasonActive = currentReasonKey === r.key;
                                        return (
                                          <button
                                            key={r.key}
                                            type="button"
                                            onClick={() => handleReasonChange(item.studentDocUid, r.key)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                              isReasonActive
                                                ? `${r.badgeBg} ${r.badgeText} ${r.badgeBorder} ring-2 ring-offset-1 ring-current shadow-2xs font-black`
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                            }`}
                                            title={`${r.label} (${r.hindiLabel}): ${r.description}`}
                                          >
                                            <span>{r.icon}</span>
                                            <span>{r.shortLabel}</span>
                                            <span className="text-[10px] opacity-75 font-normal">
                                              ({r.hindiLabel})
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Optional Remark Input */}
                                    <div className="flex items-center gap-2 pt-1">
                                      <span className="text-[11px] font-bold text-gray-500 shrink-0">
                                        Remark:
                                      </span>
                                      <input
                                        type="text"
                                        value={item.absenceNote || ''}
                                        onChange={(e) => handleNoteChange(item.studentDocUid, e.target.value)}
                                        placeholder="Optional remark (e.g. Fever, medical note sent on WhatsApp, out of station)..."
                                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001c46]"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (Min touch target 44px) */}
              <div className="sm:hidden divide-y divide-gray-100 p-3 space-y-3">
                {studentList
                  .filter((item) => markStatusFilter === 'ALL' || item.status === markStatusFilter)
                  .map((item) => {
                    const isAbsent = item.status === 'ABSENT';
                    const isLate = item.status === 'LATE';
                    const isHalfDay = item.status === 'HALF_DAY';
                    const currentReasonKey = item.absenceReason || 'UNINFORMED';

                    return (
                      <div
                        key={item.studentDocUid}
                        className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
                          isAbsent ? 'bg-rose-50/50 border-rose-200' : 'bg-gray-50/80 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-[#001c46]">{item.name}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold mt-0.5">
                              <span>ID: {item.studentId}</span>
                              <span>•</span>
                              <span>Roll: {item.rollNumber}</span>
                            </div>
                          </div>
                          {isAbsent && (
                            <AbsenceReasonBadge
                              reasonKey={item.absenceReason || 'UNINFORMED'}
                              note={item.absenceNote}
                              showHindi={false}
                              size="sm"
                            />
                          )}
                        </div>

                        {/* Status Buttons (Min Height 44px for easy mobile touch) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {STATUS_OPTIONS.map((opt) => {
                            const isSelected = item.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleStatusChange(item.studentDocUid, opt.value)}
                                className={`min-h-[44px] w-full py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                                  isSelected
                                    ? `${opt.color} shadow-xs border-transparent`
                                    : 'bg-white text-gray-700 border-gray-300 active:bg-gray-100'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* TIMING INPUTS ON MOBILE */}
                        {!isAbsent && (
                          <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                            <span className="text-[11px] font-black text-[#001c46] uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>Timing (आने / जाने का समय):</span>
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {/* In Time */}
                              <div className={`p-2 rounded-xl border ${isLate ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-emerald-700 uppercase">In Time</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSetCurrentTime(item.studentDocUid, 'in')}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold"
                                  >
                                    Now
                                  </button>
                                </div>
                                <input
                                  type="time"
                                  value={item.inTime || ''}
                                  onChange={(e) => handleInTimeChange(item.studentDocUid, e.target.value)}
                                  className="w-full text-xs font-black text-gray-800 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none"
                                />
                              </div>

                              {/* Out Time */}
                              <div className={`p-2 rounded-xl border ${isHalfDay ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-indigo-700 uppercase">Out Time</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSetCurrentTime(item.studentDocUid, 'out')}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold"
                                  >
                                    Now
                                  </button>
                                </div>
                                <input
                                  type="time"
                                  value={item.outTime || ''}
                                  onChange={(e) => handleOutTimeChange(item.studentDocUid, e.target.value)}
                                  className="w-full text-xs font-black text-gray-800 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* INLINE REASONS ON MOBILE FOR ABSENT STUDENTS */}
                        {isAbsent && (
                          <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-2 pt-2.5">
                            <div className="text-[11px] font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-1">
                              <span>📌</span>
                              <span>Reason for Absence:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {ABSENCE_REASONS.map((r) => {
                                const isReasonActive = currentReasonKey === r.key;
                                return (
                                  <button
                                    key={r.key}
                                    type="button"
                                    onClick={() => handleReasonChange(item.studentDocUid, r.key)}
                                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                                      isReasonActive
                                        ? `${r.badgeBg} ${r.badgeText} ${r.badgeBorder} ring-2 ring-current font-black`
                                        : 'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    <span className="text-sm">{r.icon}</span>
                                    <span>{r.shortLabel}</span>
                                    <span className="text-[9px] opacity-75 font-normal">
                                      ({r.hindiLabel})
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            <input
                              type="text"
                              value={item.absenceNote || ''}
                              onChange={(e) => handleNoteChange(item.studentDocUid, e.target.value)}
                              placeholder="Add remark or reason note..."
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* BOTTOM SAVE BAR */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#001c46] hover:bg-[#001535] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                >
                  {savingAttendance ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFC907]" />
                      <span>Saving Attendance...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#FFC907]" />
                      <span>Save Attendance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1.5: ATTENDANCE CALENDAR VIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'calendar' && (
        <AdminAttendanceCalendarTab
          initialClass={selectedClass}
          initialSection={selectedSection}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: ABSENT STUDENTS VIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'absent-students' && (
        <AbsentStudentsTab
          currentDate={selectedDate}
          onDateChange={(newDate) => {
            setSelectedDate(newDate);
            loadStats(newDate);
          }}
          onRefreshTopStats={() => loadStats(selectedDate)}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: ATTENDANCE HISTORY VIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* HISTORY FILTERS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#FFC907]" />
              Filter Historical Logs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Date Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Specific Date</label>
                <input
                  type="date"
                  value={historyFilterDate}
                  onChange={(e) => setHistoryFilterDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                />
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Class</label>
                <select
                  value={historyFilterClass}
                  onChange={(e) => setHistoryFilterClass(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  <option value="">All Classes</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Section</label>
                <select
                  value={historyFilterSection}
                  onChange={(e) => setHistoryFilterSection(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  <option value="">All Sections</option>
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Status</label>
                <select
                  value={historyFilterStatus}
                  onChange={(e) => setHistoryFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              {/* Absence Reason Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Absence Reason</label>
                <select
                  value={historyFilterReason}
                  onChange={(e) => setHistoryFilterReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  <option value="ALL">All Reasons</option>
                  {ABSENCE_REASONS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.icon} {r.shortLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Search */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Student Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Name / ID / Roll"
                    value={historyFilterSearch}
                    onChange={(e) => setHistoryFilterSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setHistoryFilterDate('');
                  setHistoryFilterClass('');
                  setHistoryFilterSection('');
                  setHistoryFilterStatus('ALL');
                  setHistoryFilterReason('ALL');
                  setHistoryFilterSearch('');
                }}
                className="text-xs font-bold text-gray-500 hover:text-[#001c46] underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* HISTORY TABLE & LIST */}
          {loadingHistory ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Loading attendance history records...</p>
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No attendance records found.</h3>
              <p className="text-xs text-gray-500">Try adjusting your filters or date selection.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider">
                  Attendance Records ({historyRecords.length} Entries)
                </span>
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Class & Sec</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Status & Reason</th>
                      <th className="py-3 px-4">Timing (In / Out)</th>
                      <th className="py-3 px-4">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {historyRecords.map((rec) => {
                      const stOpt = STATUS_OPTIONS.find((o) => o.value === rec.status);
                      const isAbsent = rec.status === 'ABSENT';
                      const formattedIn = formatTime12Hour(rec.inTime);
                      const formattedOut = formatTime12Hour(rec.outTime);

                      return (
                        <tr key={rec.id} className={`transition-colors ${isAbsent ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-gray-50/80'}`}>
                          <td className="py-3 px-4 font-bold text-gray-900">{rec.date}</td>
                          <td className="py-3 px-4 font-bold text-gray-700">
                            {rec.className} ({rec.section})
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#001c46]">
                            {rec.studentId}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-gray-900">{rec.studentName}</td>
                          <td className="py-3 px-4 font-bold text-gray-600">{rec.rollNumber || '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                                  stOpt ? stOpt.badge : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}
                              >
                                {rec.status}
                              </span>
                              {isAbsent && (
                                <AbsenceReasonBadge
                                  reasonKey={rec.absenceReason}
                                  note={rec.absenceNote}
                                  size="sm"
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {formattedIn || formattedOut ? (
                              <div className="flex flex-col gap-1 text-[11px]">
                                {formattedIn && (
                                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <LogIn className="w-3 h-3 text-emerald-600" />
                                    <span>In: {formattedIn}</span>
                                  </span>
                                )}
                                {formattedOut && (
                                  <span className="inline-flex items-center gap-1 font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                    <LogOut className="w-3 h-3 text-indigo-600" />
                                    <span>Out: {formattedOut}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium italic">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-medium truncate max-w-[120px]">
                            {rec.markedBy || 'Admin'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100 p-3 space-y-3">
                {historyRecords.map((rec) => {
                  const stOpt = STATUS_OPTIONS.find((o) => o.value === rec.status);
                  const isAbsent = rec.status === 'ABSENT';
                  const formattedIn = formatTime12Hour(rec.inTime);
                  const formattedOut = formatTime12Hour(rec.outTime);

                  return (
                    <div
                      key={rec.id}
                      className={`p-3.5 rounded-xl border space-y-2 ${
                        isAbsent ? 'bg-rose-50/40 border-rose-200' : 'bg-gray-50/80 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900">{rec.date}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            stOpt ? stOpt.badge : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#001c46]">{rec.studentName}</h4>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                          {rec.className} Sec {rec.section} • ID: {rec.studentId} • Roll: {rec.rollNumber || '—'}
                        </p>
                      </div>

                      {/* Timing chips on mobile */}
                      {(formattedIn || formattedOut) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {formattedIn && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                              <LogIn className="w-3 h-3 text-emerald-600" />
                              <span>In: {formattedIn}</span>
                            </span>
                          )}
                          {formattedOut && (
                            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
                              <LogOut className="w-3 h-3 text-indigo-600" />
                              <span>Out: {formattedOut}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {isAbsent && (
                        <div className="pt-1">
                          <AbsenceReasonBadge
                            reasonKey={rec.absenceReason}
                            note={rec.absenceNote}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: STUDENT ATTENDANCE SUMMARY VIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'student-summary' && (
        <div className="space-y-6">
          {/* STUDENT PICKER */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#FFC907]" />
              Select Student Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Choose Active Student
                </label>
                <select
                  value={selectedStudentUid}
                  onChange={(e) => setSelectedStudentUid(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46]"
                >
                  {allActiveStudents.map((std) => (
                    <option key={std.uid} value={std.uid}>
                      {std.name} ({std.studentId}) — {std.className} Sec {std.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Search */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Search Filter
                </label>
                <input
                  type="text"
                  placeholder="Filter student dropdown by name or ID..."
                  value={studentSearchInput}
                  onChange={(e) => setStudentSearchInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* STUDENT SUMMARY METRICS DISPLAY */}
          {loadingSummary ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Calculating student attendance metrics...</p>
            </div>
          ) : !studentSummary ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
              <User className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No student selected or found.</h3>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#FFC907] bg-[#001c46] px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Student Profile Summary
                  </span>
                  <h2 className="text-2xl font-black text-[#001c46] mt-2">{studentSummary.name}</h2>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">
                    ID: {studentSummary.studentId} • Roll No: {studentSummary.rollNumber} • Class:{' '}
                    {studentSummary.className} ({studentSummary.section})
                  </p>
                </div>

                {/* Percentage Badge */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center shrink-0">
                  <span className="text-[10px] font-black uppercase text-gray-500 block">
                    Attendance Percentage
                  </span>
                  <span
                    className={`text-3xl font-black ${
                      studentSummary.percentage >= 75
                        ? 'text-emerald-600'
                        : studentSummary.percentage >= 60
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {studentSummary.percentage}%
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                    (Formula: Present / Working Days)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-600">Working Days Recorded: {studentSummary.totalWorkingDays}</span>
                  <span className="text-gray-900">{studentSummary.presentDays} Days Present</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${studentSummary.percentage}%` }}
                    className={`h-full transition-all duration-500 ${
                      studentSummary.percentage >= 75
                        ? 'bg-emerald-500'
                        : studentSummary.percentage >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Total Working</span>
                  <span className="text-xl font-black text-gray-800">{studentSummary.totalWorkingDays}</span>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Present Days</span>
                  <span className="text-xl font-black text-emerald-700">{studentSummary.presentDays}</span>
                </div>

                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-rose-800 block">Absent Days</span>
                  <span className="text-xl font-black text-rose-700">{studentSummary.absentDays}</span>
                </div>

                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Late Days</span>
                  <span className="text-xl font-black text-amber-700">{studentSummary.lateDays}</span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-800 block">Half Days</span>
                  <span className="text-xl font-black text-indigo-700">{studentSummary.halfDayDays}</span>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-gray-400 italic">
                * Note: Future dates are excluded from working day calculations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: MONTHLY SUMMARY VIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* MONTHLY FILTERS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#FFC907]" />
              Select Month & Class Target
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Year */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                <select
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Month</label>
                <select
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  {[
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Class</label>
                <select
                  value={monthlyClass}
                  onChange={(e) => setMonthlyClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Section</label>
                <select
                  value={monthlySection}
                  onChange={(e) => setMonthlySection(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800"
                >
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* MONTHLY SUMMARY TABLE */}
          {loadingMonthly ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Generating monthly summary report...</p>
            </div>
          ) : monthlyItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
              <BarChart2 className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-700">No attendance data for selected month/class.</h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#001c46] uppercase tracking-wider">
                  Monthly Summary — {monthlyClass} ({monthlySection})
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  {monthlyItems.length} Enrolled Students
                </span>
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4 text-center">Present</th>
                      <th className="py-3 px-4 text-center">Absent</th>
                      <th className="py-3 px-4 text-center">Late</th>
                      <th className="py-3 px-4 text-center">Half Day</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {paginatedMonthlyItems.map((item) => (
                      <tr key={item.studentDocUid} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-700">{item.rollNumber}</td>
                        <td className="py-3 px-4 font-extrabold text-gray-900">{item.studentName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#001c46]">
                          {item.studentId}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-emerald-700">
                          {item.presentDays}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-rose-700">
                          {item.absentDays}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-amber-700">
                          {item.lateDays}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-indigo-700">
                          {item.halfDayDays}
                        </td>
                        <td className="py-3 px-4 text-center font-black">
                          <span
                            className={`px-2 py-1 rounded-md ${
                              item.percentage >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.percentage >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100 p-3 space-y-3">
                {paginatedMonthlyItems.map((item) => (
                  <div
                    key={item.studentDocUid}
                    className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-[#001c46]">{item.studentName}</h4>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          item.percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.percentage >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold pt-1">
                      <div className="p-1.5 bg-emerald-100/60 rounded-lg text-emerald-800">
                        <span>P: {item.presentDays}</span>
                      </div>
                      <div className="p-1.5 bg-rose-100/60 rounded-lg text-rose-800">
                        <span>A: {item.absentDays}</span>
                      </div>
                      <div className="p-1.5 bg-amber-100/60 rounded-lg text-amber-800">
                        <span>L: {item.lateDays}</span>
                      </div>
                      <div className="p-1.5 bg-indigo-100/60 rounded-lg text-indigo-800">
                        <span>HD: {item.halfDayDays}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalMonthlyPages > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">
                    Page {monthlyPage} of {totalMonthlyPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={monthlyPage <= 1}
                      onClick={() => setMonthlyPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 inline" /> Prev
                    </button>
                    <button
                      type="button"
                      disabled={monthlyPage >= totalMonthlyPages}
                      onClick={() => setMonthlyPage((p) => Math.min(totalMonthlyPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-700 disabled:opacity-40 cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
