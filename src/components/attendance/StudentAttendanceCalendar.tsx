import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  Calendar as CalendarIcon,
  User,
  Info,
  Edit3,
  Trash2,
  Save,
  X,
  Sparkles
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  calculateAttendancePercentage
} from '../../types/attendance';

export interface StudentAttendanceCalendarProps {
  student: {
    uid: string;
    studentId: string;
    name: string;
    className: string;
    section: string;
    rollNumber?: string;
  };
  records: AttendanceRecord[];
  readOnly?: boolean;
  onSaveAttendance?: (
    date: string,
    status: AttendanceStatus,
    remarks?: string
  ) => Promise<void>;
  onDeleteAttendance?: (date: string) => Promise<void>;
  initialMonth?: string; // YYYY-MM
}

export const StudentAttendanceCalendar: React.FC<StudentAttendanceCalendarProps> = ({
  student,
  records,
  readOnly = true,
  onSaveAttendance,
  onDeleteAttendance,
  initialMonth,
}) => {
  // Current active month state: format "YYYY-MM"
  const [currentMonthStr, setCurrentMonthStr] = useState<string>(() => {
    if (initialMonth && /^\d{4}-\d{2}$/.test(initialMonth)) {
      return initialMonth;
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [year, month] = useMemo(() => {
    const parts = currentMonthStr.split('-');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }, [currentMonthStr]);

  // Selected date modal / view for day details
  const [selectedDayRecord, setSelectedDayRecord] = useState<{
    date: string;
    dayNum: number;
    record?: AttendanceRecord;
  } | null>(null);

  // Admin edit form state
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('PRESENT');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Local records state for instant optimistic updates
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>(records);

  React.useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  // Map records by date for O(1) lookup
  const recordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    localRecords.forEach((r) => {
      if (r.date) {
        map.set(r.date, r);
      }
    });
    return map;
  }, [localRecords]);

  // Filter records for the active month
  const monthlyRecords = useMemo(() => {
    return localRecords.filter((r) => r.date && r.date.startsWith(currentMonthStr));
  }, [localRecords, currentMonthStr]);

  // Calculated month metrics
  const stats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    monthlyRecords.forEach((r) => {
      if (r.status === 'PRESENT') presentCount++;
      else if (r.status === 'ABSENT') absentCount++;
      else if (r.status === 'LEAVE') leaveCount++;
      else if (r.status === 'LATE') lateCount++;
      else if (r.status === 'HALF_DAY') halfDayCount++;
    });

    const totalWorkingDays = presentCount + absentCount + leaveCount + lateCount + halfDayCount;
    // Leave ko absent mein count mat karo:
    // Attendance % = Present Days ÷ Total Marked Working Days × 100
    const percentage = calculateAttendancePercentage(presentCount, absentCount);

    return {
      presentCount,
      absentCount,
      leaveCount,
      lateCount,
      halfDayCount,
      totalWorkingDays,
      percentage,
    };
  }, [monthlyRecords]);

  // Build calendar matrix for the month
  const calendarDays = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    // In JS, getDay() returns 0 for Sunday, 1 for Monday, etc.
    // Convert to Monday = 0, ..., Sunday = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      status: AttendanceStatus;
      record?: AttendanceRecord;
    }> = [];

    // Previous month padding days
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDate - i;
      const prevM = month - 1 === 0 ? 12 : month - 1;
      const prevY = month - 1 === 0 ? year - 1 : year;
      const pDateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      const rec = recordsMap.get(pDateStr);
      days.push({
        dateStr: pDateStr,
        dayNum: pDay,
        isCurrentMonth: false,
        isToday: pDateStr === todayStr,
        isFuture: pDateStr > todayStr,
        status: rec ? rec.status : 'NOT_MARKED',
        record: rec,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = recordsMap.get(dStr);
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isFuture: dStr > todayStr,
        status: rec ? rec.status : 'NOT_MARKED',
        record: rec,
      });
    }

    // Trailing padding to make full weeks (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month + 1 === 13 ? 1 : month + 1;
      const nextY = month + 1 === 13 ? year + 1 : year;
      const nDateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = recordsMap.get(nDateStr);
      days.push({
        dateStr: nDateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: nDateStr === todayStr,
        isFuture: nDateStr > todayStr,
        status: rec ? rec.status : 'NOT_MARKED',
        record: rec,
      });
    }

    return days;
  }, [year, month, recordsMap]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setCurrentMonthStr(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setCurrentMonthStr(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonthJump = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    setCurrentMonthStr(`${y}-${m}`);
  };

  // Click on a calendar day
  const handleDayClick = (dayItem: {
    dateStr: string;
    dayNum: number;
    record?: AttendanceRecord;
    status: AttendanceStatus;
  }) => {
    setSelectedDayRecord({
      date: dayItem.dateStr,
      dayNum: dayItem.dayNum,
      record: dayItem.record,
    });
    setEditStatus(dayItem.record?.status || 'PRESENT');
    setEditRemarks(dayItem.record?.remarks || dayItem.record?.absenceNote || '');
    setActionSuccessMessage(null);
  };

  // Save attendance status for selected day (Admin mode)
  const handleSaveDayAttendance = async () => {
    if (!selectedDayRecord || !onSaveAttendance) return;
    setIsSaving(true);
    setActionSuccessMessage(null);
    const targetDate = selectedDayRecord.date;
    try {
      if (editStatus === 'NOT_MARKED') {
        if (onDeleteAttendance) {
          await onDeleteAttendance(targetDate);
        }
        setLocalRecords((prev) => prev.filter((r) => r.date !== targetDate));
        setActionSuccessMessage('Attendance cleared to Not Marked.');
      } else {
        await onSaveAttendance(
          targetDate,
          editStatus,
          editRemarks.trim() || undefined
        );
        setLocalRecords((prev) => {
          const existingIdx = prev.findIndex((r) => r.date === targetDate);
          const updatedItem: AttendanceRecord = {
            id: `${student.uid}_${targetDate}`,
            studentId: student.studentId,
            studentUid: student.uid,
            studentName: student.name,
            rollNumber: student.rollNumber || '',
            className: student.className,
            class: student.className,
            section: student.section,
            date: targetDate,
            status: editStatus,
            remarks: editRemarks.trim() || undefined,
            absenceNote: editRemarks.trim() || undefined,
            markedBy: 'ADMIN',
            markedByRole: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          if (existingIdx >= 0) {
            const next = [...prev];
            next[existingIdx] = { ...next[existingIdx], ...updatedItem };
            return next;
          } else {
            return [...prev, updatedItem];
          }
        });
        setActionSuccessMessage(`Saved status as ${editStatus}`);
      }
      setTimeout(() => {
        setSelectedDayRecord(null);
        setActionSuccessMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save attendance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const monthLabel = useMemo(() => {
    const dateObj = new Date(year, month - 1, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [year, month]);

  return (
    <div id="student-attendance-calendar" className="space-y-6">
      {/* 1. Header & Controls Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#001c46]/5 text-[#001c46]">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-[#001c46] tracking-tight">
                Attendance Calendar
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Student: <span className="font-bold text-gray-800">{student.name}</span> ({student.studentId}) • Class {student.className} - {student.section}
              {student.rollNumber && ` • Roll #${student.rollNumber}`}
            </p>
          </div>

          {/* Month Selector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="calendar-prev-month-btn"
              type="button"
              onClick={handlePrevMonth}
              className="p-2 text-gray-600 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition border border-gray-200"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-black text-[#001c46] min-w-[150px] text-center px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              {monthLabel}
            </span>

            <button
              id="calendar-next-month-btn"
              type="button"
              onClick={handleNextMonth}
              className="p-2 text-gray-600 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition border border-gray-200"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              id="calendar-current-month-btn"
              type="button"
              onClick={handleCurrentMonthJump}
              className="px-3 py-2 text-xs font-bold text-[#001c46] bg-blue-50/50 hover:bg-blue-100/60 rounded-xl border border-blue-200 transition"
            >
              Current Month
            </button>

            <input
              id="calendar-month-picker"
              type="month"
              value={currentMonthStr}
              onChange={(e) => e.target.value && setCurrentMonthStr(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            />
          </div>
        </div>

        {/* 2. Monthly Summary Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-100">
          {/* Total Working Days */}
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/70 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Total Days
            </span>
            <span className="text-xl font-black text-gray-900 mt-0.5 block">
              {stats.totalWorkingDays}
            </span>
          </div>

          {/* 🟢 Present Days */}
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Present
            </span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">
              {stats.presentCount}
            </span>
          </div>

          {/* 🔴 Absent Days */}
          <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Absent
            </span>
            <span className="text-xl font-black text-red-700 mt-0.5 block">
              {stats.absentCount}
            </span>
          </div>

          {/* 🟡 Leave Days */}
          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Leave
            </span>
            <span className="text-xl font-black text-amber-700 mt-0.5 block">
              {stats.leaveCount}
            </span>
          </div>

          {/* 📊 Attendance Percentage */}
          <div className="col-span-2 sm:col-span-1 bg-[#001c46] text-white p-3.5 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
              Attendance %
            </span>
            <span className="text-xl font-black text-[#FFC907] mt-0.5 block">
              {stats.percentage}%
            </span>
          </div>
        </div>

        {/* Status Indicators Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-gray-600 font-medium">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Legend:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
              <span className="font-bold text-gray-800">Present</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100"></span>
              <span className="font-bold text-gray-800">Absent</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100"></span>
              <span className="font-bold text-gray-800">Leave</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 ring-2 ring-gray-100"></span>
              <span className="text-gray-500">Not Marked</span>
            </span>
          </div>

          <div className="text-[11px] text-gray-500 italic">
            * Note: Approved Leave is not counted as absent in percentage calculation.
          </div>
        </div>
      </div>

      {/* 3. Interactive Monthly Calendar Grid */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="py-2 text-[11px] font-black uppercase tracking-wider text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((item, idx) => {
            const isMarked = item.status !== 'NOT_MARKED';
            let bgClass = 'bg-gray-50/50 hover:bg-gray-100/70 border-gray-100 text-gray-700';
            let badgeBg = 'bg-gray-200 text-gray-600';
            let statusText = 'Not Marked';

            if (item.status === 'PRESENT') {
              bgClass = 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/80 text-emerald-950 shadow-xs';
              badgeBg = 'bg-emerald-600 text-white';
              statusText = 'Present';
            } else if (item.status === 'ABSENT') {
              bgClass = 'bg-red-50/80 border-red-200 hover:bg-red-100/80 text-red-950 shadow-xs';
              badgeBg = 'bg-red-600 text-white';
              statusText = 'Absent';
            } else if (item.status === 'LEAVE') {
              bgClass = 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/80 text-amber-950 shadow-xs';
              badgeBg = 'bg-amber-500 text-white';
              statusText = 'Leave';
            } else if (item.status === 'LATE') {
              bgClass = 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/80 text-amber-950 shadow-xs';
              badgeBg = 'bg-amber-600 text-white';
              statusText = 'Late';
            } else if (item.status === 'HALF_DAY') {
              bgClass = 'bg-blue-50/80 border-blue-200 hover:bg-blue-100/80 text-blue-950 shadow-xs';
              badgeBg = 'bg-blue-600 text-white';
              statusText = 'Half Day';
            }

            if (!item.isCurrentMonth) {
              bgClass = 'bg-gray-50/30 opacity-40 border-transparent hover:opacity-60';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(item)}
                className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl border text-left flex flex-col justify-between transition group relative ${bgClass} ${
                  item.isToday ? 'ring-2 ring-[#001c46] ring-offset-1' : ''
                }`}
              >
                {/* Day Number and Today Indicator */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      item.isToday
                        ? 'bg-[#001c46] text-white w-6 h-6 rounded-full flex items-center justify-center'
                        : item.isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.dayNum}
                  </span>

                  {item.isToday && (
                    <span className="hidden sm:inline text-[9px] font-bold text-[#001c46] bg-blue-100 px-1.5 py-0.5 rounded-md">
                      Today
                    </span>
                  )}
                </div>

                {/* Status Indicator pill */}
                <div className="w-full mt-auto pt-1">
                  {isMarked ? (
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold tracking-tight uppercase ${badgeBg}`}
                      >
                        {item.status === 'PRESENT' && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                        {item.status === 'ABSENT' && <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                        {item.status === 'LEAVE' && <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                        <span>{statusText}</span>
                      </span>
                      {item.record?.remarks && (
                        <p className="hidden sm:block text-[9px] text-gray-600 truncate max-w-full font-medium">
                          {item.record.remarks}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-300 group-hover:text-gray-400 transition text-[10px] font-medium">
                      <span className="hidden sm:inline">Not Marked</span>
                      <span className="sm:hidden">—</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Day Details / Admin Edit Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 animate-scaleUp space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-[#001c46]">
                  Attendance Details
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {new Date(selectedDayRecord.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayRecord(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-only view for Student / Parent */}
            {readOnly ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-600">Status:</span>
                  <div>
                    {selectedDayRecord.record?.status === 'PRESENT' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        PRESENT
                      </span>
                    )}
                    {selectedDayRecord.record?.status === 'ABSENT' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full font-black">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        ABSENT
                      </span>
                    )}
                    {selectedDayRecord.record?.status === 'LEAVE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-black">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        LEAVE
                      </span>
                    )}
                    {(!selectedDayRecord.record || selectedDayRecord.record.status === 'NOT_MARKED') && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-black">
                        <MinusCircle className="w-3.5 h-3.5 text-gray-500" />
                        NOT MARKED
                      </span>
                    )}
                  </div>
                </div>

                {selectedDayRecord.record && (
                  <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Class & Section:</span>
                      <span className="font-bold text-gray-900">
                        {selectedDayRecord.record.className} - {selectedDayRecord.record.section}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span>Verified By:</span>
                      <span className="font-bold text-gray-900">
                        {selectedDayRecord.record.markedBy || 'Class Teacher'}
                      </span>
                    </div>

                    {(selectedDayRecord.record.inTime || selectedDayRecord.record.outTime) && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Timings:</span>
                        <span className="font-bold text-gray-900">
                          {selectedDayRecord.record.inTime || '—'} to{' '}
                          {selectedDayRecord.record.outTime || '—'}
                        </span>
                      </div>
                    )}

                    {(selectedDayRecord.record.remarks || selectedDayRecord.record.absenceNote) && (
                      <div className="pt-2 border-t border-gray-200 text-gray-700">
                        <span className="font-bold block mb-0.5">Remarks / Reason:</span>
                        <p className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800">
                          {selectedDayRecord.record.remarks || selectedDayRecord.record.absenceNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Admin Edit / Update Mode */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Change Attendance Status:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditStatus('PRESENT')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        editStatus === 'PRESENT'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      PRESENT
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditStatus('ABSENT')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        editStatus === 'ABSENT'
                          ? 'bg-red-500 text-white border-red-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      ABSENT
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditStatus('LEAVE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        editStatus === 'LEAVE'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      LEAVE
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditStatus('NOT_MARKED')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        editStatus === 'NOT_MARKED'
                          ? 'bg-gray-700 text-white border-gray-800 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <MinusCircle className="w-4 h-4" />
                      NOT MARKED
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Remarks / Leave Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="e.g., Medical leave, Approved by principal"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  />
                </div>

                {actionSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{actionSuccessMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedDayRecord(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    id="save-day-attendance-btn"
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveDayAttendance}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#001c46] hover:bg-[#002866] rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Record'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
