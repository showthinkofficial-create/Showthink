import React, { useState, useEffect } from 'react';
import { Teacher } from '../../types/teacher';
import {
  StudentAttendanceItem,
  AttendanceStatus,
  ABSENCE_REASONS,
  AbsenceReasonKey,
  getAbsenceReasonDetails,
  formatTime12Hour,
  getCurrentTimeString
} from '../../types/attendance';
import { attendanceService } from '../../services/attendanceService';
import { SUBJECT_OPTIONS } from '../../types/teacher';
import { AbsenceReasonBadge } from '../admin/attendance/AbsenceReasonBadge';
import {
  CheckSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sun,
  Save,
  CheckCheck,
  AlertCircle,
  GraduationCap,
  Users,
  LogIn,
  LogOut,
  Timer
} from 'lucide-react';

interface TeacherAttendanceViewProps {
  teacher: Teacher | null;
  assignedClasses: string[];
  userProfileName: string;
}

export const TeacherAttendanceView: React.FC<TeacherAttendanceViewProps> = ({
  teacher,
  assignedClasses,
  userProfileName,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Default class selection from teacher's assigned classes
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [students, setStudents] = useState<StudentAttendanceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Parse available class names & sections from assignedClasses
  useEffect(() => {
    if (assignedClasses.length > 0 && !selectedClass) {
      const first = assignedClasses[0]; // e.g. "Class 10" or "Class 10 - A"
      if (first.includes('-')) {
        const parts = first.split('-');
        setSelectedClass(parts[0].trim());
        if (parts[1]) setSelectedSection(parts[1].trim().toUpperCase());
      } else {
        setSelectedClass(first);
      }
    }
  }, [assignedClasses]);

  // Set default subject if teacher has subjects
  useEffect(() => {
    if (teacher?.subjects && teacher.subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(teacher.subjects[0]);
    }
  }, [teacher]);

  // Fetch students when date, class, section change
  const fetchClassStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await attendanceService.getStudentsForAttendance(
        selectedClass,
        selectedSection,
        selectedDate
      );
      setStudents(res.students);
      setIsExistingRecord(res.isExisting);
    } catch (err) {
      console.error('Error fetching students for attendance:', err);
      setAlertMsg({ type: 'error', text: 'Failed to load students for selected class section.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassStudents();
  }, [selectedClass, selectedSection, selectedDate]);

  // Handler to toggle individual student status
  const handleStatusChange = (
    studentUid: string,
    status: AttendanceStatus
  ) => {
    setStudents((prev) =>
      prev.map((item) => {
        if (item.studentDocUid === studentUid) {
          return {
            ...item,
            status,
            absenceReason:
              status === 'ABSENT' ? item.absenceReason || 'UNINFORMED' : undefined,
            absenceNote: status === 'ABSENT' ? item.absenceNote : undefined,
          };
        }
        return item;
      })
    );
  };

  // Handler for absence reason change
  const handleReasonChange = (studentUid: string, reason: AbsenceReasonKey | string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentUid
          ? { ...item, status: 'ABSENT', absenceReason: reason }
          : item
      )
    );
  };

  // Handler for absence note change
  const handleNoteChange = (studentUid: string, note: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentUid ? { ...item, absenceNote: note } : item
      )
    );
  };

  // ----------------------------------------------------
  // STUDENT TIMING (ARRIVAL & DEPARTURE) HANDLERS
  // ----------------------------------------------------
  const [bulkInTimeInput, setBulkInTimeInput] = useState<string>('08:00');
  const [bulkOutTimeInput, setBulkOutTimeInput] = useState<string>('13:30');

  const handleInTimeChange = (studentUid: string, inTime: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentUid ? { ...item, inTime } : item
      )
    );
  };

  const handleOutTimeChange = (studentUid: string, outTime: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.studentDocUid === studentUid ? { ...item, outTime } : item
      )
    );
  };

  const handleSetCurrentTime = (studentUid: string, type: 'in' | 'out') => {
    const curTime = getCurrentTimeString();
    setStudents((prev) =>
      prev.map((item) => {
        if (item.studentDocUid === studentUid) {
          return type === 'in' ? { ...item, inTime: curTime } : { ...item, outTime: curTime };
        }
        return item;
      })
    );
  };

  const handleBulkApplyInTime = (timeVal: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.status !== 'ABSENT' ? { ...item, inTime: timeVal } : item
      )
    );
    setAlertMsg({
      type: 'success',
      text: `Applied arrival time ${formatTime12Hour(timeVal)} to present students.`,
    });
  };

  const handleBulkApplyOutTime = (timeVal: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.status !== 'ABSENT' ? { ...item, outTime: timeVal } : item
      )
    );
    setAlertMsg({
      type: 'success',
      text: `Applied departure time ${formatTime12Hour(timeVal)} to present students.`,
    });
  };

  const handleBulkApplyStandardSchedule = () => {
    setStudents((prev) =>
      prev.map((item) =>
        item.status !== 'ABSENT'
          ? { ...item, inTime: bulkInTimeInput || '08:00', outTime: bulkOutTimeInput || '13:30' }
          : item
      )
    );
    setAlertMsg({
      type: 'success',
      text: `Applied standard schedule (In: ${formatTime12Hour(bulkInTimeInput || '08:00')} - Out: ${formatTime12Hour(bulkOutTimeInput || '13:30')}) to all present students.`,
    });
  };

  // Handler to mark all students present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'PRESENT',
        absenceReason: undefined,
        absenceNote: undefined,
      }))
    );
  };

  // Handler to mark all students absent
  const handleMarkAllAbsent = () => {
    setStudents((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'ABSENT',
        absenceReason: item.absenceReason || 'UNINFORMED',
        inTime: '',
        outTime: '',
      }))
    );
  };

  // Handler to batch save
  const handleSaveAttendance = async () => {
    if (!students.length) return;
    setSaving(true);
    setAlertMsg(null);

    const markedByName = teacher?.name || userProfileName || 'Faculty Teacher';

    try {
      await attendanceService.saveAttendanceBatch(
        students,
        selectedDate,
        selectedClass,
        selectedSection,
        markedByName
      );
      setIsExistingRecord(true);
      setAlertMsg({
        type: 'success',
        text: `Attendance for ${selectedClass} (Sec ${selectedSection}) on ${selectedDate} saved successfully!`,
      });
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to save attendance batch. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const leaveCount = students.filter((s) => s.status === 'LEAVE').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const halfDayCount = students.filter((s) => s.status === 'HALF_DAY').length;

  const filteredStudents = students.filter(
    (s) => statusFilter === 'ALL' || s.status === statusFilter
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <CheckSquare className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-black">Mark Daily Attendance</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Select date, class, section, track absences with reasons, and submit records.
            </p>
          </div>

          {isExistingRecord && (
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-black text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Existing Logs Loaded
            </span>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
          
          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Attendance Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
              />
            </div>
          </div>

          {/* Class Picker */}
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              {assignedClasses.length > 0 ? (
                assignedClasses.map((cls, i) => (
                  <option key={i} value={cls.includes('-') ? cls.split('-')[0].trim() : cls}>
                    {cls}
                  </option>
                ))
              ) : (
                <>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 5">Class 5</option>
                </>
              )}
            </select>
          </div>

          {/* Section Picker */}
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Subject Picker */}
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Subject Period</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              {teacher?.subjects && teacher.subjects.length > 0 ? (
                teacher.subjects.map((sub, i) => (
                  <option key={i} value={sub}>
                    {sub}
                  </option>
                ))
              ) : (
                SUBJECT_OPTIONS.slice(0, 6).map((sub, i) => (
                  <option key={i} value={sub}>
                    {sub}
                  </option>
                ))
              )}
            </select>
          </div>

        </div>

      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs text-gray-500 hover:text-gray-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Attendance Stats & Actions Bar */}
      {students.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#001c46] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All: {students.length}
              </button>
              <button
                onClick={() => setStatusFilter('PRESENT')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'PRESENT'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                Present: {presentCount}
              </button>
              <button
                onClick={() => setStatusFilter('ABSENT')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'ABSENT'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Absent: {absentCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter('LEAVE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'LEAVE'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Leave: {leaveCount}</span>
              </button>
              <button
                onClick={() => setStatusFilter('LATE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'LATE'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                Late: {lateCount}
              </button>
              <button
                onClick={() => setStatusFilter('HALF_DAY')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'HALF_DAY'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                }`}
              >
                Half Day: {halfDayCount}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleMarkAllPresent}
                className="flex-1 md:flex-initial px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="flex-1 md:flex-initial px-6 py-2 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-black text-xs rounded-xl shadow-sm transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Timing Assistant Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#001c46] font-black">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Timing Assistant (आने व जाने का समय):</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* In Time Bulk */}
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
                >
                  Apply In
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkApplyInTime(getCurrentTimeString())}
                  className="px-1.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] cursor-pointer"
                >
                  Now
                </button>
              </div>

              {/* Out Time Bulk */}
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
                >
                  Apply Out
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkApplyOutTime(getCurrentTimeString())}
                  className="px-1.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[10px] cursor-pointer"
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
                ⚡ Standard (08:00 AM - 01:30 PM)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Student Attendance List Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fetching class student roll...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#001c46] text-white font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4 text-center">Attendance Status</th>
                  <th className="py-3.5 px-4 text-center min-w-[220px]">Timing (आगमन - प्रस्थान)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStudents.map((student) => {
                  const status = student.status;
                  const isAbsent = status === 'ABSENT';
                  const isLate = status === 'LATE';
                  const isHalfDay = status === 'HALF_DAY';
                  const currentReasonKey = student.absenceReason || 'UNINFORMED';

                  return (
                    <React.Fragment key={student.studentDocUid}>
                      <tr className={`transition-colors ${isAbsent ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-gray-50/80'}`}>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#001c46]">
                          {student.rollNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{student.name}</div>
                          {isAbsent && (
                            <div className="mt-1">
                              <AbsenceReasonBadge
                                reasonKey={student.absenceReason || 'UNINFORMED'}
                                note={student.absenceNote}
                                size="sm"
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                          {student.studentId}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            
                            {/* Present Toggle */}
                            <button
                              onClick={() => handleStatusChange(student.studentDocUid, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                                status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-105'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Absent Toggle */}
                            <button
                              onClick={() => handleStatusChange(student.studentDocUid, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                                status === 'ABSENT'
                                  ? 'bg-red-600 text-white border-red-600 shadow-xs scale-105'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-800'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            {/* Leave Toggle */}
                            <button
                              onClick={() => handleStatusChange(student.studentDocUid, 'LEAVE')}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                                status === 'LEAVE'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-105'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-800'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Leave</span>
                            </button>

                            {/* Late Toggle */}
                            <button
                              onClick={() => handleStatusChange(student.studentDocUid, 'LATE')}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                                status === 'LATE'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-105'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-800'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Half Day Toggle */}
                            <button
                              onClick={() => handleStatusChange(student.studentDocUid, 'HALF_DAY')}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                                status === 'HALF_DAY'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-800'
                              }`}
                            >
                              <Sun className="w-3.5 h-3.5" />
                              <span>Half Day</span>
                            </button>

                          </div>
                        </td>

                        {/* Timing inputs */}
                        <td className="py-3.5 px-4">
                          {isAbsent ? (
                            <div className="text-center text-gray-400 font-medium italic text-[11px]">
                              — Not Applicable —
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {/* In Time */}
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-xl border transition-all ${
                                  isLate
                                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
                                    : 'bg-gray-50 border-gray-200 focus-within:border-emerald-500'
                                }`}
                                title={isLate ? 'Late Arrival Time' : 'In-Time (आगमन)'}
                              >
                                <span className="text-[10px] font-black text-emerald-700">IN:</span>
                                <input
                                  type="time"
                                  value={student.inTime || ''}
                                  onChange={(e) => handleInTimeChange(student.studentDocUid, e.target.value)}
                                  className="w-[74px] text-xs font-bold text-gray-800 bg-transparent border-0 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSetCurrentTime(student.studentDocUid, 'in')}
                                  className="text-[10px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold cursor-pointer"
                                  title="Current time"
                                >
                                  Now
                                </button>
                              </div>

                              {/* Out Time */}
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-xl border transition-all ${
                                  isHalfDay
                                    ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                                    : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
                                }`}
                                title={isHalfDay ? 'Half-Day Departure Time' : 'Out-Time (प्रस्थान)'}
                              >
                                <span className="text-[10px] font-black text-indigo-700">OUT:</span>
                                <input
                                  type="time"
                                  value={student.outTime || ''}
                                  onChange={(e) => handleOutTimeChange(student.studentDocUid, e.target.value)}
                                  className="w-[74px] text-xs font-bold text-gray-800 bg-transparent border-0 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSetCurrentTime(student.studentDocUid, 'out')}
                                  className="text-[10px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold cursor-pointer"
                                  title="Current time"
                                >
                                  Now
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* INLINE REASONS FOR TEACHER */}
                      {isAbsent && (
                        <tr className="bg-rose-50/40 border-b border-rose-100">
                          <td colSpan={5} className="px-6 py-2.5">
                            <div className="bg-white/90 p-3 rounded-xl border border-rose-200 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-1.5">
                                  <span>📌</span>
                                  <span>Reason for Absence (अनुपस्थिति का कारण):</span>
                                </span>
                                <span className="text-[11px] font-bold text-rose-600">
                                  Select reason for {student.name}
                                </span>
                              </div>

                              {/* 4 Standard Reason Buttons */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {ABSENCE_REASONS.map((r) => {
                                  const isReasonActive = currentReasonKey === r.key;
                                  return (
                                    <button
                                      key={r.key}
                                      type="button"
                                      onClick={() => handleReasonChange(student.studentDocUid, r.key)}
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

                              {/* Optional Note */}
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] font-bold text-gray-500 shrink-0">
                                  Remark:
                                </span>
                                <input
                                  type="text"
                                  value={student.absenceNote || ''}
                                  onChange={(e) => handleNoteChange(student.studentDocUid, e.target.value)}
                                  placeholder="Optional remark or parent note..."
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
        ) : (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-gray-800">No Students Match Selected Filter</h3>
            <p className="text-xs text-gray-500">
              Try selecting 'All' or choose another class / section.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

