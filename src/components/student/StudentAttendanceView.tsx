import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Table as TableIcon
} from 'lucide-react';
import { AttendanceRecord, StudentAttendanceSummary, calculateAttendancePercentage } from '../../types/attendance';
import { StudentAttendanceCalendar } from '../attendance/StudentAttendanceCalendar';

interface StudentAttendanceViewProps {
  summary: StudentAttendanceSummary | null;
  records: AttendanceRecord[];
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  summary,
  records,
}) => {
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'TABLE'>('CALENDAR');
  // Filter records by Month/Year
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g., '2026-09'
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Generate available unique YYYY-MM options from records or default
  const monthOptions: string[] = Array.from<string>(
    new Set(records.map((r) => r.date.substring(0, 7)))
  ).sort((a: string, b: string) => b.localeCompare(a));

  if (!monthOptions.includes(currentMonthStr)) {
    monthOptions.unshift(currentMonthStr);
  }

  const filteredRecords = selectedMonth
    ? records.filter((r) => r.date.startsWith(selectedMonth))
    : records;

  // Monthly breakdown counts
  const monthPresent = filteredRecords.filter((r) => r.status === 'PRESENT').length;
  const monthAbsent = filteredRecords.filter((r) => r.status === 'ABSENT').length;
  const monthLeave = filteredRecords.filter((r) => r.status === 'LEAVE').length;
  const monthLate = filteredRecords.filter((r) => r.status === 'LATE').length;
  const monthHalfDay = filteredRecords.filter((r) => r.status === 'HALF_DAY').length;
  const monthTotal = filteredRecords.length;
  // Attendance % = Present Days ÷ Total Marked Working Days × 100 (Leave is not counted as absent)
  const monthPct = calculateAttendancePercentage(monthPresent, monthAbsent);

  // Create student stub from summary or records for calendar header
  const studentInfo = {
    uid: summary?.studentDocUid || records[0]?.studentUid || 'current',
    studentId: summary?.studentId || records[0]?.studentId || 'STUDENT',
    name: summary?.name || records[0]?.studentName || 'Student',
    className: summary?.className || records[0]?.className || '',
    section: summary?.section || records[0]?.section || '',
    rollNumber: summary?.rollNumber || records[0]?.rollNumber || '',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#001c46]">
            <CalendarCheck className="w-6 h-6 text-[#FFC907]" />
            <h1 className="text-xl font-black">My Attendance History</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Real-time verified daily attendance logs recorded by school administration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Calendar vs Table view toggle */}
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('CALENDAR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'CALENDAR'
                  ? 'bg-white text-[#001c46] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                viewMode === 'TABLE'
                  ? 'bg-white text-[#001c46] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>
          </div>

          {/* Overall Percentage Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-gray-200">
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Overall Rate</span>
              <span className="text-sm sm:text-base font-black text-[#001c46]">
                {summary ? `${summary.percentage}%` : '0%'}
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded-xl text-white font-black text-[11px] ${
              (summary?.percentage || 0) >= 75 ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              {(summary?.percentage || 0) >= 75 ? 'Good' : 'Low'}
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total Days */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Recorded</span>
          <span className="text-lg sm:text-xl font-black text-gray-900 mt-1 block">
            {summary?.totalWorkingDays || 0} <span className="text-xs font-semibold text-gray-400">days</span>
          </span>
        </div>

        {/* Present */}
        <div className="bg-emerald-50 p-3.5 sm:p-4 rounded-2xl border border-emerald-200 text-emerald-950 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-bold uppercase">Present</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-lg sm:text-xl font-black mt-1 block">
            {summary?.presentDays || 0}
          </span>
        </div>

        {/* Absent */}
        <div className="bg-red-50 p-3.5 sm:p-4 rounded-2xl border border-red-200 text-red-950 shadow-xs">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[10px] font-bold uppercase">Absent</span>
            <XCircle className="w-4 h-4" />
          </div>
          <span className="text-lg sm:text-xl font-black mt-1 block">
            {summary?.absentDays || 0}
          </span>
        </div>

        {/* Leave */}
        <div className="bg-amber-50 p-3.5 sm:p-4 rounded-2xl border border-amber-200 text-amber-950 shadow-xs">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-bold uppercase">Leave</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-lg sm:text-xl font-black mt-1 block">
            {summary?.leaveDays || 0}
          </span>
        </div>

        {/* Late */}
        <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200 text-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-600">
            <span className="text-[10px] font-bold uppercase">Late</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-lg sm:text-xl font-black mt-1 block">
            {summary?.lateDays || 0}
          </span>
        </div>

        {/* Attendance Percentage */}
        <div className="bg-[#001c46] text-white p-3.5 sm:p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-[#FFC907] uppercase block">Attendance %</span>
          <span className="text-lg sm:text-xl font-black mt-1 block">
            {summary?.percentage || 0}%
          </span>
        </div>
      </div>

      {/* Calendar View Mode */}
      {viewMode === 'CALENDAR' && (
        <StudentAttendanceCalendar
          student={studentInfo}
          records={records}
          readOnly={true}
        />
      )}

      {/* Table View Mode */}
      {viewMode === 'TABLE' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#001c46]" />
              <h2 className="font-black text-base text-gray-900">Monthly Attendance Log</h2>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-[#001c46]"
              >
                <option value="">All Months</option>
                {monthOptions.map((m) => {
                  const dateObj = new Date(`${m}-01`);
                  const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <option key={m} value={m}>
                      {monthLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Selected Month Summary */}
          {selectedMonth && (
            <div className="bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-3 sm:gap-4 text-xs font-semibold">
              <div className="text-gray-700">
                Month Stats ({selectedMonth}): <span className="font-bold text-gray-900">{monthTotal} Days Recorded</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
                <span className="text-emerald-700">Present: {monthPresent}</span>
                <span className="text-red-700">Absent: {monthAbsent}</span>
                <span className="text-amber-700">Leave: {monthLeave}</span>
                <span className="text-gray-700">Late: {monthLate}</span>
                <span className="font-bold text-[#001c46]">Percentage: {monthPct}%</span>
              </div>
            </div>
          )}

          {/* Attendance Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm space-y-2">
              <CalendarCheck className="w-10 h-10 mx-auto text-gray-300" />
              <p>No attendance logs recorded for this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-[#001c46] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day of Week</th>
                    <th className="px-4 py-3">Class & Section</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks / Reason</th>
                    <th className="px-4 py-3">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {filteredRecords.map((r, idx) => {
                    const d = new Date(r.date);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

                    let badge = null;
                    if (r.status === 'PRESENT') {
                      badge = <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] uppercase">Present</span>;
                    } else if (r.status === 'ABSENT') {
                      badge = <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-md font-bold text-[10px] uppercase">Absent</span>;
                    } else if (r.status === 'LEAVE') {
                      badge = <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px] uppercase">Leave</span>;
                    } else if (r.status === 'LATE') {
                      badge = <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px] uppercase">Late</span>;
                    } else {
                      badge = <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px] uppercase">Half Day</span>;
                    }

                    return (
                      <tr key={r.id || idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900">{r.date}</td>
                        <td className="px-4 py-3 text-gray-600">{dayName}</td>
                        <td className="px-4 py-3 text-gray-600">{r.className} ({r.section})</td>
                        <td className="px-4 py-3">{badge}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                          {r.remarks || r.absenceNote || r.absenceReason || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-[11px]">{r.markedBy || 'Class Teacher'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
