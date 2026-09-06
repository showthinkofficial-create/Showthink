import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ParentTab, ParentProfile } from '../../types/parent';
import { Student } from '../../types/student';
import { StudentAttendanceSummary, AttendanceRecord } from '../../types/attendance';
import { ExamResult } from '../../types/result';
import { StudentFeeDetail, StudentFeePayment } from '../../types/fees';
import { Timetable, TimetableEntry } from '../../types/timetable';
import { Notice } from '../../types/notice';
import { GalleryAlbum, GalleryMedia } from '../../types/gallery';
import { parentService } from '../../services/parentService';

import { ParentHeader } from '../../components/parent/ParentHeader';
import { ParentNavigation } from '../../components/parent/ParentNavigation';
import { ParentDashboardView } from '../../components/parent/ParentDashboardView';
import { ParentChildrenView } from '../../components/parent/ParentChildrenView';
import { ParentAttendanceView } from '../../components/parent/ParentAttendanceView';
import { ParentResultsView } from '../../components/parent/ParentResultsView';
import { ParentFeesView } from '../../components/parent/ParentFeesView';
import { ParentTimetableView } from '../../components/parent/ParentTimetableView';
import { ParentNoticesView } from '../../components/parent/ParentNoticesView';
import { ParentGalleryView } from '../../components/parent/ParentGalleryView';
import { ParentProfileView } from '../../components/parent/ParentProfileView';
import { OnlineFeePaymentModal } from '../../components/parent/OnlineFeePaymentModal';

import { Loader2, AlertCircle, RefreshCw, ShieldAlert, LogOut } from 'lucide-react';

interface PortalPanelProps {
  initialTab?: ParentTab;
  onNavigateHome: () => void;
}

export const PortalPanel: React.FC<PortalPanelProps> = ({
  initialTab = 'dashboard' as ParentTab,
  onNavigateHome,
}) => {
  const { user, userProfile, logout } = useAuth();

  // Active Tab State derived from URL path
  const getTabFromLocation = (): ParentTab => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path.endsWith('/profile')) return 'profile';
    if (path.endsWith('/children') || path.endsWith('/students')) return 'children';
    if (path.endsWith('/attendance')) return 'attendance';
    if (path.endsWith('/results')) return 'results';
    if (path.endsWith('/fees/receipts') || path.endsWith('/receipts')) return 'receipts';
    if (path.endsWith('/fees')) return 'fees';
    if (path.endsWith('/timetable')) return 'timetable';
    if (path.endsWith('/notices')) return 'notices';
    if (path.endsWith('/gallery')) return 'gallery';
    return (initialTab as ParentTab) || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<ParentTab>(getTabFromLocation());

  // Data States
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [childrenList, setChildrenList] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);

  // Child-specific academic states
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

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChildDataLoading, setIsChildDataLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPayFeeModalOpen, setIsPayFeeModalOpen] = useState<boolean>(false);

  // Listen to popstate changes
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync route URL on tab switch
  const handleTabChange = (tab: ParentTab) => {
    setActiveTab(tab);
    const routeMap: Record<ParentTab, string> = {
      dashboard: '/portal/dashboard',
      profile: '/portal/profile',
      children: '/portal/children',
      attendance: '/portal/attendance',
      results: '/portal/results',
      fees: '/portal/fees',
      receipts: '/portal/fees/receipts',
      timetable: '/portal/timetable',
      notices: '/portal/notices',
      gallery: '/portal/gallery',
    };
    const targetUrl = routeMap[tab] || '/portal/dashboard';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Initial Load: Load Profile & Linked Students
  const loadPortalBaseData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profile, students] = await Promise.all([
        parentService.getParentProfile(user.uid, user.email || undefined),
        parentService.getLinkedStudents(user.uid, user.email || undefined),
      ]);

      // Filter out DISABLED students
      const activeStudents = students.filter((s) => s.status !== 'DISABLED');

      setParentProfile(profile);
      setChildrenList(activeStudents);

      if (activeStudents.length > 0) {
        setSelectedChild((prev) => {
          if (prev && activeStudents.some((s) => s.uid === prev.uid)) {
            return activeStudents.find((s) => s.uid === prev.uid) || activeStudents[0];
          }
          return activeStudents[0];
        });
      }
    } catch (err) {
      console.error('Error loading portal base data:', err);
      setErrorMessage('Unable to load institutional portal data. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPortalBaseData();
  }, [loadPortalBaseData]);

  // 2. Child Data Load: Triggered whenever selectedChild changes
  const loadSelectedChildData = useCallback(async (child: Student) => {
    setIsChildDataLoading(true);
    try {
      const [attRes, results, feeRes, timeRes, relevantNotices, gallRes] = await Promise.all([
        parentService.getChildAttendance(child.uid),
        parentService.getChildResults(child.uid),
        parentService.getChildFees(child.uid),
        parentService.getChildTimetable(child.className, child.section),
        parentService.getRelevantNotices(child.className, child.section),
        parentService.getGalleryContent(),
      ]);

      setAttendanceSummary(attRes.summary);
      setAttendanceRecords(attRes.records);
      setExamResults(results);
      setFeeDetail(feeRes.detail);
      setFeePayments(feeRes.payments);
      setTimetable(timeRes.timetable);
      setTimetableEntries(timeRes.entries);
      setNotices(relevantNotices);
      setGalleryAlbums(gallRes.albums);
      setGalleryMedia(gallRes.media);
    } catch (err) {
      console.warn('Error loading student records:', err);
    } finally {
      setIsChildDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadSelectedChildData(selectedChild);
    }
  }, [selectedChild, loadSelectedChildData]);

  const handleSelectChild = (child: Student) => {
    setSelectedChild(child);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onNavigateHome();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-[#001c46] animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
              Loading Combined Portal
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Verifying student relationship & loading academic profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Account disabled check
  if (userProfile?.status === 'DISABLED') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl flex flex-col items-center gap-4 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-red-900">
              Account Disabled
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              This portal account has been deactivated. Please contact the GP Academy Administration Office for assistance.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  if (errorMessage && childrenList.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col items-center gap-4 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-gray-900">
              Connection Notice
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              {errorMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={loadPortalBaseData}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#001c46] text-[#FFC907] font-bold text-xs rounded-xl shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const latestResult = examResults.length > 0 ? examResults[0] : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-20 md:pb-12 text-gray-900 selection:bg-[#FFC907]/30">
      {/* Header */}
      <ParentHeader
        parentProfile={parentProfile}
        email={user?.email || ''}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={handleSelectChild}
        onNavigateHome={onNavigateHome}
        onLogout={handleLogout}
      />

      {/* Navigation Bar */}
      <ParentNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        noticesCount={notices.length}
      />

      {/* Main Panel Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 flex-1 w-full">
        {/* Child Data Loading Skeleton Indicator */}
        {isChildDataLoading && (
          <div className="mb-4 bg-blue-50 border border-blue-100 text-blue-800 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Updating academic records for {selectedChild?.name || 'student'}...</span>
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'dashboard' && (
          <ParentDashboardView
            parentProfile={parentProfile}
            childrenList={childrenList}
            selectedChild={selectedChild}
            onSelectChild={handleSelectChild}
            attendanceSummary={attendanceSummary}
            feeDetail={feeDetail}
            latestResult={latestResult}
            notices={notices}
            onNavigateTab={handleTabChange}
            onOpenPayFeeModal={() => setIsPayFeeModalOpen(true)}
          />
        )}

        {activeTab === 'children' && (
          <ParentChildrenView
            childrenList={childrenList}
            selectedChild={selectedChild}
            onSelectChild={handleSelectChild}
          />
        )}

        {activeTab === 'attendance' && (
          <ParentAttendanceView
            student={selectedChild}
            summary={attendanceSummary}
            records={attendanceRecords}
          />
        )}

        {activeTab === 'results' && (
          <ParentResultsView
            student={selectedChild}
            results={examResults}
          />
        )}

        {(activeTab === 'fees' || activeTab === 'receipts') && (
          <ParentFeesView
            student={selectedChild}
            feeDetail={feeDetail}
            payments={feePayments}
          />
        )}

        {activeTab === 'timetable' && (
          <ParentTimetableView
            student={selectedChild}
            timetable={timetable}
            entries={timetableEntries}
          />
        )}

        {activeTab === 'notices' && (
          <ParentNoticesView
            student={selectedChild}
            notices={notices}
          />
        )}

        {activeTab === 'gallery' && (
          <ParentGalleryView
            albums={galleryAlbums}
            media={galleryMedia}
          />
        )}

        {activeTab === 'profile' && (
          <ParentProfileView
            parentProfile={parentProfile}
            email={user?.email || ''}
            childrenList={childrenList}
          />
        )}
      </main>

      {/* Online Fee Payment Modal (Coming Soon) */}
      {selectedChild && (
        <OnlineFeePaymentModal
          student={selectedChild}
          pendingAmount={feeDetail?.pendingAmount || 0}
          isOpen={isPayFeeModalOpen}
          onClose={() => setIsPayFeeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PortalPanel;
