import React from 'react';
import {
  User,
  CalendarCheck,
  Award,
  CreditCard,
  Clock,
  Bell,
  Image as ImageIcon,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Student } from '../../types/student';
import { StudentAttendanceSummary } from '../../types/attendance';
import { ExamResult } from '../../types/result';
import { StudentTab } from './StudentNavigation';

interface StudentDashboardViewProps {
  student: Student;
  attendanceSummary: StudentAttendanceSummary | null;
  pendingFee: number;
  totalFee: number;
  paidFee: number;
  latestResult: ExamResult | null;
  noticesCount: number;
  onNavigateTab: (tab: StudentTab) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  attendanceSummary,
  pendingFee,
  totalFee,
  paidFee,
  latestResult,
  noticesCount,
  onNavigateTab,
}) => {
  const attendancePct = attendanceSummary ? attendanceSummary.percentage : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#001c46] via-[#1a3a6c] to-[#001c46] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC907] text-[#001c46] rounded-full text-xs font-black uppercase tracking-wider">
              Academic Session 2026–2027
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {student.name}!
            </h1>
            <p className="text-sm text-blue-100 max-w-xl font-normal leading-relaxed">
              Your student dashboard provides real-time access to attendance, academic performance, fee status, class timetables, and official announcements.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#FFC907] text-[#001c46] font-black text-lg flex items-center justify-center shrink-0">
              {student.className.replace('Class ', '')}
            </div>
            <div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Class & Section</div>
              <div className="text-base font-black text-white">{student.className} — {student.section}</div>
              <div className="text-[11px] text-blue-200 font-medium">Roll No: {student.rollNumber || '—'} | ID: {student.studentId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance % Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance %</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {attendanceSummary ? `${attendancePct}%` : '0%'}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {attendanceSummary
                ? `${attendanceSummary.presentDays} of ${attendanceSummary.totalWorkingDays} days present`
                : 'No attendance marked yet'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="w-full text-left text-xs font-bold text-[#001c46] hover:text-blue-700 flex items-center justify-between pt-2 border-t border-gray-100"
          >
            <span>View Attendance Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pending Fee Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Fee</span>
            <div className={`p-2 rounded-xl ${pendingFee > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              ₹{pendingFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              {pendingFee > 0 ? `Paid: ₹${paidFee.toLocaleString('en-IN')} of ₹${totalFee.toLocaleString('en-IN')}` : 'All fees paid in full'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('fees')}
            className="w-full text-left text-xs font-bold text-[#001c46] hover:text-blue-700 flex items-center justify-between pt-2 border-t border-gray-100"
          >
            <span>Pay Fee & Receipts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Latest Result Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Result</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            {latestResult ? (
              <>
                <div className="text-2xl font-black text-gray-900">
                  {latestResult.percentage}%
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">
                  {latestResult.examName} ({latestResult.grade || '—'})
                </p>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-gray-400">Not Published</div>
                <p className="text-[11px] text-gray-400 mt-1">No exam results published yet</p>
              </>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('results')}
            className="w-full text-left text-xs font-bold text-[#001c46] hover:text-blue-700 flex items-center justify-between pt-2 border-t border-gray-100"
          >
            <span>View All Marksheets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Student Profile Overview Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Board & Status</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">
              {student.board}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Status: <span className="text-emerald-600 font-bold uppercase">{student.status}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="w-full text-left text-xs font-bold text-[#001c46] hover:text-blue-700 flex items-center justify-between pt-2 border-t border-gray-100"
          >
            <span>My Full Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Student Details Summary Grid */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#001c46]">
            <User className="w-5 h-5 text-[#FFC907]" />
            <h2 className="font-black text-base">Verified Student Identity</h2>
          </div>
          <span className="px-3 py-1 bg-[#001c46] text-[#FFC907] text-xs font-black rounded-full uppercase tracking-wider">
            {student.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-xl space-y-0.5 border border-gray-100">
            <span className="text-gray-400 font-medium block text-[11px]">Full Name</span>
            <span className="font-bold text-gray-900 text-sm">{student.name}</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl space-y-0.5 border border-gray-100">
            <span className="text-gray-400 font-medium block text-[11px]">Student ID</span>
            <span className="font-bold text-[#001c46] text-sm">{student.studentId}</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl space-y-0.5 border border-gray-100">
            <span className="text-gray-400 font-medium block text-[11px]">Class & Section</span>
            <span className="font-bold text-gray-900 text-sm">{student.className} ({student.section})</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl space-y-0.5 border border-gray-100">
            <span className="text-gray-400 font-medium block text-[11px]">Roll Number</span>
            <span className="font-bold text-gray-900 text-sm">{student.rollNumber || '—'}</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigateTab('attendance')}
          className="p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-gray-200 text-center space-y-2 transition-all hover:scale-[1.02] shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-gray-800 group-hover:text-[#001c46]">Attendance</span>
        </button>

        <button
          onClick={() => onNavigateTab('results')}
          className="p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-gray-200 text-center space-y-2 transition-all hover:scale-[1.02] shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-gray-800 group-hover:text-[#001c46]">Results</span>
        </button>

        <button
          onClick={() => onNavigateTab('fees')}
          className="p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-gray-200 text-center space-y-2 transition-all hover:scale-[1.02] shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-gray-800 group-hover:text-[#001c46]">Fees</span>
        </button>

        <button
          onClick={() => onNavigateTab('timetable')}
          className="p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-gray-200 text-center space-y-2 transition-all hover:scale-[1.02] shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-gray-800 group-hover:text-[#001c46]">Timetable</span>
        </button>

        <button
          onClick={() => onNavigateTab('notices')}
          className="p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-gray-200 text-center space-y-2 transition-all hover:scale-[1.02] shadow-xs group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-gray-800 group-hover:text-[#001c46]">Notices</span>
        </button>

        <button
          onClick={() => onNavigateTab('gallery')}
          className="p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-gray-200 text-center space-y-2 transition-all hover:scale-[1.02] shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-gray-800 group-hover:text-[#001c46]">Gallery</span>
        </button>
      </div>
    </div>
  );
};
