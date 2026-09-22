import React from 'react';
import { Teacher } from '../../types/teacher';
import { Notice } from '../../types/notice';
import { TimetableEntry } from '../../types/timetable';
import { TeacherTab } from './TeacherNavigation';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Bell,
  ArrowRight,
  Users,
  CheckSquare,
  Award,
  Sparkles
} from 'lucide-react';

interface TeacherDashboardViewProps {
  teacher: Teacher | null;
  notices: Notice[];
  todaySchedule: TimetableEntry[];
  assignedClassesStatus: { className: string; section: string; isSubmittedToday: boolean; studentCount: number }[];
  onSelectTab: (tab: TeacherTab) => void;
  loading: boolean;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  teacher,
  notices,
  todaySchedule,
  assignedClassesStatus,
  onSelectTab,
  loading,
}) => {
  const teacherName = teacher?.name || 'Faculty Member';
  const teacherId = teacher?.teacherId || 'GP-T-FACULTY';
  const subjects = teacher?.subjects || [];
  const assignedClasses = teacher?.assignedClasses || [];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = daysOfWeek[new Date().getDay()];

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Syncing Faculty Dashboard Data...</p>
      </div>
    );
  }

  const pendingAttendanceCount = assignedClassesStatus.filter((c) => !c.isSubmittedToday).length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#001c46] via-[#1a325d] to-[#001c46] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#FFC907]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {teacher?.profilePhoto ? (
              <img
                src={teacher.profilePhoto}
                alt={teacherName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#FFC907] shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFC907] text-[#001c46] flex items-center justify-center text-2xl font-black shadow-md">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFC907] text-[#001c46] uppercase tracking-wider">
                  Academic Faculty
                </span>
                <span className="text-xs text-blue-200 font-mono font-bold">ID: {teacherId}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Welcome, {teacherName}
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Qualification: {teacher?.qualification || 'Senior Faculty'} • Joining Date: {teacher?.joiningDate || 'Active'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => onSelectTab('attendance')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#FFC907] hover:bg-yellow-400 text-[#001c46] px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-sm active:scale-95"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </button>
            <button
              onClick={() => onSelectTab('timetable')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all border border-white/20"
            >
              <Calendar className="w-4 h-4 text-[#FFC907]" />
              <span>View Full Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onSelectTab('students')}
          className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-gray-200 hover:border-blue-300 shadow-2xs text-left transition-all group"
        >
          <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h4 className="font-black text-xs text-gray-900">My Students</h4>
          <p className="text-[11px] text-gray-500 font-medium">View enrolled roster</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('attendance')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-2xs text-left transition-all group"
        >
          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h4 className="font-black text-xs text-gray-900">Mark Attendance</h4>
          <p className="text-[11px] text-gray-500 font-medium">Daily rolls & leave</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('results')}
          className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-gray-200 hover:border-amber-300 shadow-2xs text-left transition-all group"
        >
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-black text-xs text-gray-900">Marks / Results</h4>
          <p className="text-[11px] text-gray-500 font-medium">Enter evaluations</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('timetable')}
          className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-gray-200 hover:border-purple-300 shadow-2xs text-left transition-all group"
        >
          <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-black text-xs text-gray-900">My Timetable</h4>
          <p className="text-[11px] text-gray-500 font-medium">Weekly schedule</p>
        </button>
      </div>

      {/* Grid Row 1: Summary Badges for Assigned Classes & Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Assigned Classes */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#001c46]">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-sm">Assigned Classes ({assignedClasses.length})</h3>
            </div>
            <button
              onClick={() => onSelectTab('classes')}
              className="text-xs font-extrabold text-blue-600 hover:text-[#001c46] flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignedClasses.length > 0 ? (
              assignedClasses.map((cls, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  {cls}
                </span>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No classes explicitly assigned yet.</p>
            )}
          </div>
        </div>

        {/* Assigned Subjects */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#001c46]">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-sm">Assigned Subjects ({subjects.length})</h3>
            </div>
            <button
              onClick={() => onSelectTab('profile')}
              className="text-xs font-extrabold text-emerald-600 hover:text-[#001c46] flex items-center gap-1"
            >
              <span>Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.length > 0 ? (
              subjects.map((subj, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {subj}
                </span>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No subjects listed.</p>
            )}
          </div>
        </div>

      </div>

      {/* Grid Row 2: Today's Attendance Tasks & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Attendance Tasks Status */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#001c46]">
              <CheckSquare className="w-5 h-5 text-[#001c46]" />
              <h3 className="font-extrabold text-sm">Attendance Tasks</h3>
            </div>
            {pendingAttendanceCount > 0 ? (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-black text-[10px]">
                {pendingAttendanceCount} Pending
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px]">
                All Done
              </span>
            )}
          </div>

          <div className="space-y-3">
            {assignedClassesStatus.length > 0 ? (
              assignedClassesStatus.map((clsItem, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                    clsItem.isSubmittedToday
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div>
                    <span className="font-extrabold block">
                      {clsItem.className} — Sec {clsItem.section}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {clsItem.studentCount} Registered Students
                    </span>
                  </div>

                  {clsItem.isSubmittedToday ? (
                    <div className="flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Recorded</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectTab('attendance')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] rounded-lg shadow-2xs active:scale-95 transition-all uppercase"
                    >
                      Mark Now
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-2xl text-center">
                No assigned class attendance tasks generated today.
              </p>
            )}
          </div>
        </div>

        {/* Today's Classes Schedule */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#001c46]">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-sm">
                Today's Teaching Schedule ({todayDayName})
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('timetable')}
              className="text-xs font-extrabold text-blue-600 hover:text-[#001c46] flex items-center gap-1"
            >
              <span>Full Week</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySchedule.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todaySchedule.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-black bg-[#001c46] text-[#FFC907] text-[10px]">
                      Period {entry.periodNumber}
                    </span>
                    <span className="font-mono text-gray-500 font-bold text-[11px]">
                      {entry.startTime} - {entry.endTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-[#001c46] text-sm">{entry.subject}</h4>
                    <p className="text-xs text-gray-600 font-medium">
                      Class: {entry.type === 'BREAK' ? 'All Classes' : entry.room ? `Room ${entry.room}` : 'Assigned Class Room'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-2xl text-center space-y-2">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-600">No scheduled periods for today ({todayDayName}).</p>
              <p className="text-[11px] text-gray-400">Enjoy your preparation time or check weekly timetable for upcoming sessions.</p>
            </div>
          )}
        </div>

      </div>

      {/* Row 3: Latest Notices for Faculty */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#001c46]">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-sm">Faculty & School Announcements</h3>
          </div>
          <button
            onClick={() => onSelectTab('notices')}
            className="text-xs font-extrabold text-amber-600 hover:text-[#001c46] flex items-center gap-1"
          >
            <span>Notice Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {notices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.slice(0, 4).map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    {notice.type}
                  </span>
                  <span className="text-gray-500 font-mono">{notice.publishDate}</span>
                </div>
                <h4 className="font-bold text-[#001c46] text-xs line-clamp-1">{notice.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notice.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic p-4 bg-gray-50 rounded-2xl text-center">
            No active notices for faculty members.
          </p>
        )}
      </div>

    </div>
  );
};
