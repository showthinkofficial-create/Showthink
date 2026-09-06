import React, { useState } from 'react';
import { Student } from '../../types/student';
import { StudentAttendanceSummary, AttendanceRecord, calculateAttendancePercentage } from '../../types/attendance';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  PieChart,
  Calendar,
  AlertTriangle,
  Filter,
  Table as TableIcon
} from 'lucide-react';
import { StudentAttendanceCalendar } from '../attendance/StudentAttendanceCalendar';

interface ParentAttendanceViewProps {
  student: Student | null;
  summary: StudentAttendanceSummary | null;
  records: AttendanceRecord[];
}

export const ParentAttendanceView: React.FC<ParentAttendanceViewProps> = ({
  student,
  summary,
  records,
}) => {
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'TABLE'>('CALENDAR');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!student) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
        Please select a child to view attendance records.
      </div>
    );
  }

  const isChildDisabled = student.status === 'DISABLED';

  const presentDays = summary?.presentDays || 0;
  const absentDays = summary?.absentDays || 0;
  const leaveDays = summary?.leaveDays || 0;
  const lateDays = summary?.lateDays || 0;
  const halfDayDays = summary?.halfDayDays || 0;
  const totalDays = summary?.totalWorkingDays || records.length;
  // Attendance % = Present Days ÷ Total Marked Working Days × 100 (Leave is not counted as absent)
  const attendancePercentage = summary?.percentage ?? calculateAttendancePercentage(presentDays, absentDays);

  // Filter records by selected month and status filter
  const filteredRecords = records.filter((rec) => {
    if (selectedMonth && !rec.date.startsWith(selectedMonth)) {
      return false;
    }
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Monthly stats for the active selected month
  const monthlyRecords = records.filter((r) => r.date.startsWith(selectedMonth));
  const monthlyPresent = monthlyRecords.filter((r) => r.status === 'PRESENT').length;
  const monthlyAbsent = monthlyRecords.filter((r) => r.status === 'ABSENT').length;
  const monthlyLeave = monthlyRecords.filter((r) => r.status === 'LEAVE').length;
  const monthlyLate = monthlyRecords.filter((r) => r.status === 'LATE').length;
  const monthlyHalfDay = monthlyRecords.filter((r) => r.status === 'HALF_DAY').length;
  const monthlyTotal = monthlyRecords.length;
  const monthlyPercentage = calculateAttendancePercentage(monthlyPresent, monthlyAbsent);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Present</span>
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Absent</span>
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Leave</span>
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Late</span>
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
            <PieChart className="w-3.5 h-3.5" />
            <span>Half Day</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Attendance Record</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Student: <span className="font-bold text-gray-800">{student.name}</span> ({student.studentId}) • Class {student.className} - {student.section}
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              <span>Calendar View</span>
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
              <span>Log Table</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Overall Rate:</span>
            <span
              className={`text-sm font-black px-3 py-1 rounded-xl ${
                attendancePercentage >= 75
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {attendancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Disabled Account Alert if any */}
      {isChildDisabled && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>This student account is currently inactive. Viewing archived attendance logs.</span>
        </div>
      )}

      {/* Overall Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Working Days */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Days</span>
          <span className="text-xl font-black text-gray-900">{totalDays}</span>
        </div>

        {/* Present Days */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Present</span>
          <span className="text-xl font-black text-emerald-700">{presentDays}</span>
        </div>

        {/* Absent Days */}
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Absent</span>
          <span className="text-xl font-black text-red-700">{absentDays}</span>
        </div>

        {/* Leave Days */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Leave</span>
          <span className="text-xl font-black text-amber-700">{leaveDays}</span>
        </div>

        {/* Late Days */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Late</span>
          <span className="text-xl font-black text-gray-700">{lateDays}</span>
        </div>

        {/* Attendance % */}
        <div className="bg-white p-4 rounded-2xl border border-[#001c46] bg-blue-50/30 shadow-xs text-center space-y-1">
          <span className="text-[10px] font-bold text-[#001c46] uppercase tracking-wider block">Percentage</span>
          <span className="text-xl font-black text-[#001c46]">{attendancePercentage}%</span>
        </div>
      </div>

      {/* Calendar View Mode */}
      {viewMode === 'CALENDAR' && (
        <StudentAttendanceCalendar
          student={{
            uid: student.uid,
            studentId: student.studentId,
            name: student.name,
            className: student.className,
            section: student.section,
            rollNumber: student.rollNumber,
          }}
          records={records}
          readOnly={true}
        />
      )}

      {/* Table View Mode */}
      {viewMode === 'TABLE' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#001c46]" />
              <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
                Monthly Attendance Logs
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Month Input */}
              <div className="flex items-center gap-2">
                <label htmlFor="month-select" className="text-xs font-bold text-gray-500">
                  Month:
                </label>
                <input
                  id="month-select"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="ALL">All Status</option>
                  <option value="PRESENT">Present Only</option>
                  <option value="ABSENT">Absent Only</option>
                  <option value="LEAVE">Leave Only</option>
                  <option value="LATE">Late Only</option>
                  <option value="HALF_DAY">Half Day Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selected Month Mini Summary Banner */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-bold text-gray-700">
              Records for <span className="text-[#001c46]">{selectedMonth}</span>:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-emerald-700 font-bold">Present: {monthlyPresent}</span>
              <span className="text-red-700 font-bold">Absent: {monthlyAbsent}</span>
              <span className="text-amber-700 font-bold">Leave: {monthlyLeave}</span>
              <span className="text-gray-700 font-bold">Late: {monthlyLate}</span>
              <span className="text-[#001c46] font-black bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                Monthly Rate: {monthlyPercentage}%
              </span>
            </div>
          </div>

          {/* Daily Attendance Logs Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs space-y-2">
              <CalendarCheck className="w-10 h-10 mx-auto text-gray-300" />
              <p className="font-medium">No attendance records found for the selected month and filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#001c46] text-white uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Class & Section</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks / Reason</th>
                    <th className="px-4 py-3">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredRecords.map((rec, idx) => {
                    const dateObj = new Date(rec.date);
                    const dayName = isNaN(dateObj.getTime())
                      ? ''
                      : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                    return (
                      <tr key={rec.id || idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900">{rec.date}</td>
                        <td className="px-4 py-3.5 text-gray-500">{dayName}</td>
                        <td className="px-4 py-3.5">
                          {rec.className} — {rec.section}
                        </td>
                        <td className="px-4 py-3.5">{getStatusBadge(rec.status)}</td>
                        <td className="px-4 py-3.5 text-gray-600 max-w-[200px] truncate">
                          {rec.remarks || rec.absenceNote || rec.absenceReason || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 text-[11px]">
                          {rec.markedBy || 'Class Teacher'}
                        </td>
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

