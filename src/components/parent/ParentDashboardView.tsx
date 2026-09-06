import React from 'react';
import { ParentProfile, ParentTab } from '../../types/parent';
import { Student } from '../../types/student';
import { StudentAttendanceSummary } from '../../types/attendance';
import { ExamResult } from '../../types/result';
import { StudentFeeDetail } from '../../types/fees';
import { Notice } from '../../types/notice';
import {
  Users,
  CalendarCheck,
  Award,
  CreditCard,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface ParentDashboardViewProps {
  parentProfile: ParentProfile | null;
  childrenList: Student[];
  selectedChild: Student | null;
  onSelectChild: (child: Student) => void;
  attendanceSummary: StudentAttendanceSummary | null;
  feeDetail: StudentFeeDetail | null;
  latestResult: ExamResult | null;
  notices: Notice[];
  onNavigateTab: (tab: ParentTab) => void;
  onOpenPayFeeModal: () => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  parentProfile,
  childrenList,
  selectedChild,
  onSelectChild,
  attendanceSummary,
  feeDetail,
  latestResult,
  notices,
  onNavigateTab,
  onOpenPayFeeModal,
}) => {
  const isChildDisabled = selectedChild?.status === 'DISABLED';
  const pendingAmount = feeDetail?.pendingAmount || 0;
  const paidAmount = feeDetail?.paidAmount || 0;
  const totalFee = feeDetail?.totalFee || 0;

  const attendancePercentage = attendanceSummary?.percentage ?? (attendanceSummary?.totalWorkingDays ? Math.round((attendanceSummary.presentDays / attendanceSummary.totalWorkingDays) * 100) : 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-[#001c46] via-[#0b2b5c] to-[#001c46] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFC907]/15 to-transparent pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC907] bg-white/10 px-3 py-1 rounded-full inline-block">
                Parent & Guardian Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {parentProfile?.name || 'Parent / Guardian'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                Stay informed with real-time academic progress, daily attendance, fee settlements, and official notices from GP Academy.
              </p>
            </div>

            {/* Multiple children quick chips */}
            {childrenList.length > 1 && (
              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-2xl border border-white/15 space-y-1.5 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block px-2">
                  Linked Children ({childrenList.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {childrenList.map((child) => {
                    const isSelected = selectedChild?.uid === child.uid;
                    return (
                      <button
                        key={child.uid}
                        type="button"
                        onClick={() => onSelectChild(child)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFC907] text-[#001c46] shadow-sm'
                            : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                      >
                        <span>{child.name}</span>
                        <span className="text-[10px] opacity-80 font-normal">({child.className})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Student Overview Pill */}
          {selectedChild && (
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFC907] text-[#001c46] font-black flex items-center justify-center text-xs">
                  {selectedChild.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-white block">
                    Monitoring: <span className="text-[#FFC907]">{selectedChild.name}</span>
                  </span>
                  <span className="text-[10px] text-gray-300">
                    Class: {selectedChild.className} - {selectedChild.section} • Roll No: {selectedChild.rollNumber || 'N/A'} • ID: {selectedChild.studentId}
                  </span>
                </div>
              </div>

              {isChildDisabled ? (
                <div className="flex items-center gap-1.5 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-[11px] font-bold border border-red-400/30">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Student Account Inactive</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Enrollment</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inactive Student Banner (if disabled) */}
      {isChildDisabled && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-black text-red-900 block">
              This student account is currently inactive.
            </span>
            <p className="text-red-700 font-medium">
              Historical records and previously marked attendance/results remain viewable below. For reactivation assistance, please visit the GP Academy Administration Office.
            </p>
          </div>
        </div>
      )}

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Attendance
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#001c46]">
              {attendancePercentage}%
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              {attendanceSummary?.presentDays || 0} Present / {attendanceSummary?.totalWorkingDays || 0} Days
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-blue-700">
            <span>View monthly log</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Fee Status */}
        <div
          onClick={() => onNavigateTab('fees')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Pending Fee
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              ₹{paidAmount.toLocaleString('en-IN')} Cleared
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
            <span>View receipts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Latest Result */}
        <div
          onClick={() => onNavigateTab('results')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Latest Result
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#001c46]">
              {latestResult ? `${latestResult.percentage}%` : 'N/A'}
            </div>
            <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
              {latestResult ? latestResult.examName : 'No published exam yet'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
            <span>View report card</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: School Notices */}
        <div
          onClick={() => onNavigateTab('notices')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Announcements
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#001c46]">
              {notices.length}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Active circulars & updates
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
            <span>Read notices</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Main Split Grid: Action Cards & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Quick Action Shortcuts & Fee Banner */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Fee Settlement Action Box */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#001c46]">
                    Fee Dues & Payment Status
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Student: {selectedChild?.name || 'Selected Child'} ({selectedChild?.studentId})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPayFeeModal}
                className="px-4 py-2 bg-[#FFC907] hover:bg-[#e6b400] text-[#001c46] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Pay Fee
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-center">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Fee</span>
                <span className="text-sm sm:text-base font-black text-gray-800">
                  ₹{totalFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-x border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Paid</span>
                <span className="text-sm sm:text-base font-black text-emerald-600">
                  ₹{paidAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Pending</span>
                <span className="text-sm sm:text-base font-black text-amber-600">
                  ₹{pendingAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>Verified fee receipts available for download in Fee section.</span>
              <button
                type="button"
                onClick={() => onNavigateTab('fees')}
                className="font-bold text-[#001c46] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Academic Navigation Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Timetable Panel */}
            <div
              onClick={() => onNavigateTab('timetable')}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#001c46] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-[#001c46] rounded-xl group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#001c46]">Class Timetable</h4>
                  <p className="text-[11px] text-gray-500">
                    {selectedChild?.className} — Section {selectedChild?.section} Schedule
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#001c46]">
                <span>View Weekly Schedule</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Child Profile Panel */}
            <div
              onClick={() => onNavigateTab('children')}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#001c46] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#001c46]">Children Information</h4>
                  <p className="text-[11px] text-gray-500">
                    Institutional credentials & enrollment
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>View Children Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (1 col): Important Notices */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#001c46]" />
              <h3 className="text-xs font-black text-[#001c46] uppercase tracking-wider">
                Important Notices
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('notices')}
              className="text-[11px] font-bold text-[#001c46] hover:underline cursor-pointer"
            >
              All Notices ({notices.length})
            </button>
          </div>

          {notices.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-gray-300" />
              <p>No active school notices for your class right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.slice(0, 4).map((notice) => {
                const isUrgent = notice.priority === 'URGENT';
                const isImportant = notice.priority === 'IMPORTANT';

                return (
                  <div
                    key={notice.id}
                    onClick={() => onNavigateTab('notices')}
                    className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/70 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isUrgent
                            ? 'bg-red-100 text-red-800'
                            : isImportant
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {notice.priority}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {notice.publishDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {notice.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {notice.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
