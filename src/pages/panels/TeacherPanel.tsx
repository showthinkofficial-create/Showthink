import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeacherHeader } from '../../components/teacher/TeacherHeader';
import { TeacherNavigation, TeacherTab } from '../../components/teacher/TeacherNavigation';
import { TeacherDashboardView } from '../../components/teacher/TeacherDashboardView';
import { TeacherProfileView } from '../../components/teacher/TeacherProfileView';
import { TeacherClassesView } from '../../components/teacher/TeacherClassesView';
import { TeacherAttendanceView } from '../../components/teacher/TeacherAttendanceView';
import { TeacherAttendanceHistoryView } from '../../components/teacher/TeacherAttendanceHistoryView';
import { TeacherResultsView } from '../../components/teacher/TeacherResultsView';
import { TeacherTimetableView } from '../../components/teacher/TeacherTimetableView';
import { TeacherNoticesView } from '../../components/teacher/TeacherNoticesView';
import { TeacherGalleryView } from '../../components/teacher/TeacherGalleryView';

import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import { noticeService } from '../../services/noticeService';
import { timetableService } from '../../services/timetableService';
import { attendanceService } from '../../services/attendanceService';

import { Teacher } from '../../types/teacher';
import { Notice } from '../../types/notice';
import { TimetableEntry } from '../../types/timetable';
import { Student } from '../../types/student';

import { AlertTriangle, LogOut, ShieldAlert } from 'lucide-react';

interface TeacherPanelProps {
  onNavigateHome?: () => void;
}

export default function TeacherPanel({ onNavigateHome }: TeacherPanelProps) {
  const { userProfile, logout } = useAuth();

  // Helper to determine initial tab from URL
  const getTabFromLocation = (): TeacherTab => {
    const path = window.location.pathname;
    if (path.includes('/teacher/profile')) return 'profile';
    if (path.includes('/teacher/classes')) return 'classes';
    if (path.includes('/teacher/attendance/history')) return 'attendance-history';
    if (path.includes('/teacher/attendance')) return 'attendance';
    if (path.includes('/teacher/results')) return 'results';
    if (path.includes('/teacher/timetable')) return 'timetable';
    if (path.includes('/teacher/notices')) return 'notices';
    if (path.includes('/teacher/gallery')) return 'gallery';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<TeacherTab>(getTabFromLocation());
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Data States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [classSummaries, setClassSummaries] = useState<
    { className: string; section: string; subjects: string[]; students: Student[] }[]
  >([]);
  const [assignedClassesStatus, setAssignedClassesStatus] = useState<
    { className: string; section: string; isSubmittedToday: boolean; studentCount: number }[]
  >([]);

  // Listen to popstate for browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync tab change with URL route
  const handleSelectTab = (tab: TeacherTab) => {
    setActiveTab(tab);
    let routePath = `/teacher/${tab}`;
    if (tab === 'dashboard') routePath = '/teacher/dashboard';
    if (tab === 'attendance-history') routePath = '/teacher/attendance/history';

    if (window.location.pathname !== routePath) {
      window.history.pushState({}, '', routePath);
    }
  };

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Main Data Loading Effect
  useEffect(() => {
    const loadTeacherData = async () => {
      if (!userProfile) return;
      setLoading(true);

      try {
        // 1. Fetch Teacher Record
        const teacherProfile = await teacherService.getTeacherByAuthUser(
          userProfile.uid,
          userProfile.email
        );
        setTeacher(teacherProfile);

        const assignedClasses = teacherProfile?.assignedClasses || [];
        const subjects = teacherProfile?.subjects || [];

        // 2. Fetch Notices & Timetable
        const todayDate = new Date().toISOString().split('T')[0];
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDayName = daysOfWeek[new Date().getDay()];

        const [noticesRes, timetablesRes, allStudentsRes] = await Promise.allSettled([
          noticeService.getNotices(),
          timetableService.getTimetableEntries(),
          studentService.getStudents(),
        ]);

        // Process Notices
        if (noticesRes.status === 'fulfilled') {
          const filteredNotices = noticesRes.value.filter(
            (n) => n.status === 'PUBLISHED' && (n.targetAudience === 'ALL_TEACHERS' || n.targetAudience === 'ALL_STUDENTS' || n.targetAudience === 'STUDENTS')
          );
          setNotices(filteredNotices);
        }

        // Process Today's Timetable Schedule
        if (timetablesRes.status === 'fulfilled') {
          const teacherName = teacherProfile?.name?.toLowerCase().trim() || '';
          const teacherUid = teacherProfile?.uid || userProfile.uid;

          const todayEntries = timetablesRes.value.filter((e) => {
            if (e.day !== todayDayName) return false;
            if (e.teacherId && e.teacherId === teacherUid) return true;
            if (e.teacherName && e.teacherName.toLowerCase().trim() === teacherName) return true;
            if (subjects.includes(e.subject)) return true;
            return false;
          });
          todayEntries.sort((a, b) => a.periodNumber - b.periodNumber);
          setTodaySchedule(todayEntries);
        }

        // Process Assigned Classes & Student Rolls
        const allStudents = allStudentsRes.status === 'fulfilled' ? allStudentsRes.value : [];
        const summaries: { className: string; section: string; subjects: string[]; students: Student[] }[] = [];
        const statusTasks: { className: string; section: string; isSubmittedToday: boolean; studentCount: number }[] = [];

        for (const clsStr of assignedClasses) {
          // Parse Class name & Section (e.g. "Class 10 - A" or "Class 10")
          let clsName = clsStr;
          let secName = 'A';
          if (clsStr.includes('-')) {
            const parts = clsStr.split('-');
            clsName = parts[0].trim();
            if (parts[1]) secName = parts[1].trim().toUpperCase();
          }

          // Filter enrolled students for this class & section
          const classStudents = allStudents.filter(
            (s) =>
              s.className.toLowerCase() === clsName.toLowerCase() &&
              (s.section.toUpperCase() === secName.toUpperCase() || !s.section) &&
              s.status === 'ACTIVE'
          );

          summaries.push({
            className: clsName,
            section: secName,
            subjects: subjects,
            students: classStudents,
          });

          // Check if attendance is submitted today for this class
          let isSubmitted = false;
          try {
            const attCheck = await attendanceService.getStudentsForAttendance(
              clsName,
              secName,
              todayDate
            );
            isSubmitted = attCheck.isExisting;
          } catch (e) {
            console.warn('Attendance check warning:', e);
          }

          statusTasks.push({
            className: clsName,
            section: secName,
            isSubmittedToday: isSubmitted,
            studentCount: classStudents.length,
          });
        }

        // Fallback default class summary if none explicitly assigned
        if (summaries.length === 0) {
          const defaultStudents = allStudents.filter((s) => s.className === 'Class 10' && s.status === 'ACTIVE');
          summaries.push({
            className: 'Class 10',
            section: 'A',
            subjects: subjects.length > 0 ? subjects : ['General'],
            students: defaultStudents,
          });
          statusTasks.push({
            className: 'Class 10',
            section: 'A',
            isSubmittedToday: false,
            studentCount: defaultStudents.length,
          });
        }

        setClassSummaries(summaries);
        setAssignedClassesStatus(statusTasks);

      } catch (err) {
        console.error('Error loading teacher portal data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [userProfile]);

  // Check Inactive Account Constraint
  const isTeacherDisabled = teacher?.status === 'DISABLED' || userProfile?.status === 'DISABLED';

  if (isTeacherDisabled) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900">Faculty Account Suspended</h2>
            <p className="text-xs text-red-700 font-bold leading-relaxed bg-red-50 p-4 rounded-2xl border border-red-100">
              Your teacher account is currently inactive. Please contact GP Academy administration.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleHomeClick}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
            >
              Public Site
            </button>
            <button
              onClick={() => logout()}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const assignedClassesList = teacher?.assignedClasses || ['Class 10 - A'];

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      
      {/* Teacher Portal Header */}
      <TeacherHeader
        teacher={teacher}
        userProfile={userProfile}
        onNavigateHome={handleHomeClick}
        onLogout={logout}
        onSelectTab={handleSelectTab}
      />

      {/* Tab Navigation */}
      <TeacherNavigation activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main View Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <TeacherDashboardView
            teacher={teacher}
            notices={notices}
            todaySchedule={todaySchedule}
            assignedClassesStatus={assignedClassesStatus}
            onSelectTab={handleSelectTab}
            loading={loading}
          />
        )}

        {activeTab === 'profile' && (
          <TeacherProfileView teacher={teacher} userProfile={userProfile} />
        )}

        {activeTab === 'classes' && (
          <TeacherClassesView
            teacher={teacher}
            classSummaries={classSummaries}
            loading={loading}
          />
        )}

        {activeTab === 'attendance' && (
          <TeacherAttendanceView
            teacher={teacher}
            assignedClasses={assignedClassesList}
            userProfileName={userProfile?.displayName || 'Faculty Teacher'}
          />
        )}

        {activeTab === 'attendance-history' && (
          <TeacherAttendanceHistoryView
            teacher={teacher}
            assignedClasses={assignedClassesList}
          />
        )}

        {activeTab === 'results' && (
          <TeacherResultsView
            teacher={teacher}
            assignedClasses={assignedClassesList}
          />
        )}

        {activeTab === 'timetable' && (
          <TeacherTimetableView
            teacher={teacher}
            assignedClasses={assignedClassesList}
          />
        )}

        {activeTab === 'notices' && (
          <TeacherNoticesView notices={notices} />
        )}

        {activeTab === 'gallery' && (
          <TeacherGalleryView />
        )}

      </main>

      {/* Portal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 font-medium mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} GP Academy — Faculty Portal & Academic System</p>
        </div>
      </footer>

    </div>
  );
}
