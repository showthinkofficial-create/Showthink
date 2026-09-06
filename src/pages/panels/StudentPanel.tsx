import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentHeader } from '../../components/student/StudentHeader';
import { StudentNavigation, StudentTab } from '../../components/student/StudentNavigation';
import { StudentDashboardView } from '../../components/student/StudentDashboardView';
import { StudentProfileView } from '../../components/student/StudentProfileView';
import { StudentAttendanceView } from '../../components/student/StudentAttendanceView';
import { StudentResultsView } from '../../components/student/StudentResultsView';
import { StudentFeesView } from '../../components/student/StudentFeesView';
import { StudentTimetableView } from '../../components/student/StudentTimetableView';
import { StudentNoticesView } from '../../components/student/StudentNoticesView';
import { StudentGalleryView } from '../../components/student/StudentGalleryView';

import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { resultService } from '../../services/resultService';
import { feesService } from '../../services/feesService';
import { timetableService } from '../../services/timetableService';
import { noticeService } from '../../services/noticeService';
import { galleryService } from '../../services/galleryService';

import { Student } from '../../types/student';
import { StudentAttendanceSummary, AttendanceRecord } from '../../types/attendance';
import { ExamResult } from '../../types/result';
import { StudentFeeDetail, StudentFeePayment } from '../../types/fees';
import { Timetable, TimetableEntry } from '../../types/timetable';
import { Notice } from '../../types/notice';
import { GalleryAlbum, GalleryMedia } from '../../types/gallery';

import Logo from '../../components/Logo';
import { AlertTriangle, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';

interface StudentPanelProps {
  onNavigateHome?: () => void;
}

export default function StudentPanel({ onNavigateHome }: StudentPanelProps) {
  const { userProfile, logout } = useAuth();

  // Helper to get active tab from window URL path
  const getTabFromLocation = (): StudentTab => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path.endsWith('/profile')) return 'profile';
    if (path.endsWith('/attendance')) return 'attendance';
    if (path.endsWith('/results')) return 'results';
    if (path.endsWith('/fees')) return 'fees';
    if (path.endsWith('/timetable')) return 'timetable';
    if (path.endsWith('/notices')) return 'notices';
    if (path.endsWith('/gallery')) return 'gallery';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<StudentTab>(getTabFromLocation());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAccountDisabled, setIsAccountDisabled] = useState<boolean>(false);

  // Firestore Data State
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<StudentAttendanceSummary | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [feeDetail, setFeeDetail] = useState<StudentFeeDetail | null>(null);
  const [feePayments, setFeePayments] = useState<StudentFeePayment[]>([]);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMedia[]>([]);

  // Sync tab with browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: StudentTab) => {
    setActiveTab(tab);
    const targetPath = `/student/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Main Data Loading Effect
  useEffect(() => {
    let isMounted = true;

    async function loadStudentData() {
      if (!userProfile) return;
      setIsLoading(true);

      try {
        // 1. Check if user profile status is disabled directly
        if (userProfile.status === 'DISABLED') {
          if (isMounted) {
            setIsAccountDisabled(true);
            setIsLoading(false);
          }
          return;
        }

        // 2. Fetch student document from Firestore
        let fetchedStudent = await studentService.getStudentByAuthUser(userProfile.uid, userProfile.email);

        // Fallback construct if student doc was created directly without linking UID
        if (!fetchedStudent) {
          fetchedStudent = {
            uid: userProfile.uid,
            studentId: `GP${new Date().getFullYear()}0001`,
            name: userProfile.displayName || 'GP Student',
            email: userProfile.email,
            className: 'Class 10',
            section: 'A',
            rollNumber: '1',
            board: 'CBSE',
            parentName: 'Parent/Guardian',
            phone: '9818776563',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        // Check fetched student status
        if (fetchedStudent.status === 'DISABLED') {
          if (isMounted) {
            setIsAccountDisabled(true);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setStudent(fetchedStudent);
        }

        const studentUid = fetchedStudent.uid;

        // 3. Parallel Data Fetching
        const [
          attSummaryRes,
          attRecordsRes,
          resultsRes,
          feeDetailRes,
          noticesRes,
          albumsRes,
          mediaRes
        ] = await Promise.allSettled([
          attendanceService.getStudentAttendanceSummary(studentUid),
          attendanceService.getStudentAttendanceRecords(studentUid),
          resultService.getStudentExamResults(studentUid),
          feesService.getStudentFeeDetail(studentUid),
          noticeService.getNotices({ status: 'PUBLISHED' }),
          galleryService.getPublishedAlbums(),
          galleryService.getPublishedMedia(),
        ]);

        if (isMounted) {
          if (attSummaryRes.status === 'fulfilled') setAttendanceSummary(attSummaryRes.value);
          if (attRecordsRes.status === 'fulfilled') setAttendanceRecords(attRecordsRes.value);
          if (resultsRes.status === 'fulfilled') setExamResults(resultsRes.value);
          
          if (feeDetailRes.status === 'fulfilled' && feeDetailRes.value) {
            setFeeDetail(feeDetailRes.value.summary as StudentFeeDetail);
            setFeePayments(feeDetailRes.value.payments as StudentFeePayment[]);
          }

          if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value);
          if (albumsRes.status === 'fulfilled') setGalleryAlbums(albumsRes.value);
          if (mediaRes.status === 'fulfilled') setGalleryMedia(mediaRes.value);
        }

        // 4. Fetch Timetable for student's class & section
        try {
          const timetables = await timetableService.getTimetables({
            className: fetchedStudent.className,
            section: fetchedStudent.section,
            status: 'PUBLISHED',
          });

          if (timetables.length > 0) {
            const pubTimetable = timetables[0];
            const entries = await timetableService.getTimetableEntries(pubTimetable.id);
            if (isMounted) {
              setTimetable(pubTimetable);
              setTimetableEntries(entries);
            }
          }
        } catch (e) {
          console.warn('Timetable fetch notice:', e);
        }
      } catch (err) {
        console.error('Error loading student panel data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStudentData();

    return () => {
      isMounted = false;
    };
  }, [userProfile]);

  const handleReturnHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // DISABLED ACCOUNT VIEW
  if (isAccountDisabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900">Student Account Disabled</h2>
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-bold leading-relaxed">
              Your student account is currently inactive. Please contact GP Academy administration.
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 space-y-1 text-left border border-gray-200">
            <span className="font-bold text-gray-800 block">Administration Desk:</span>
            <p>Phone: +91 9818776563</p>
            <p>Email: accounts@gpacademy.in</p>
          </div>

          <button
            onClick={() => logout()}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-4">
        <Logo size={56} />
        <div className="flex items-center gap-3 text-[#001c46] font-extrabold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#FFC907]" />
          <span>Loading GP Academy Student Workspace...</span>
        </div>
      </div>
    );
  }

  const latestResult = examResults.length > 0 ? examResults[0] : null;
  const pendingFee = feeDetail?.pendingAmount || 0;
  const totalFee = feeDetail?.totalFee || 0;
  const paidFee = feeDetail?.paidAmount || 0;

  return (
    <div className="min-h-screen bg-gray-50/70 font-sans text-gray-900 flex flex-col">
      {/* Header */}
      <StudentHeader
        student={student}
        email={userProfile?.email || ''}
        onNavigateHome={handleReturnHome}
        onLogout={() => logout()}
      />

      {/* Navigation Bar (Desktop top nav / Mobile bottom nav) */}
      <StudentNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && student && (
          <StudentDashboardView
            student={student}
            attendanceSummary={attendanceSummary}
            pendingFee={pendingFee}
            totalFee={totalFee}
            paidFee={paidFee}
            latestResult={latestResult}
            noticesCount={notices.length}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'profile' && student && (
          <StudentProfileView student={student} />
        )}

        {activeTab === 'attendance' && (
          <StudentAttendanceView
            summary={attendanceSummary}
            records={attendanceRecords}
          />
        )}

        {activeTab === 'results' && (
          <StudentResultsView results={examResults} />
        )}

        {activeTab === 'fees' && student && (
          <StudentFeesView
            feeDetail={feeDetail}
            payments={feePayments}
            student={student}
          />
        )}

        {activeTab === 'timetable' && student && (
          <StudentTimetableView
            timetable={timetable}
            entries={timetableEntries}
            studentClass={student.className}
            studentSection={student.section}
          />
        )}

        {activeTab === 'notices' && student && (
          <StudentNoticesView notices={notices} student={student} />
        )}

        {activeTab === 'gallery' && (
          <StudentGalleryView albums={galleryAlbums} media={galleryMedia} />
        )}
      </main>
    </div>
  );
}
