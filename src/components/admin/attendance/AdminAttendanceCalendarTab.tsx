import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  CalendarCheck,
  User,
  ArrowRight,
  Edit3,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { studentService } from '../../../services/studentService';
import { attendanceService } from '../../../services/attendanceService';
import { Student, CLASS_OPTIONS } from '../../../types/student';
import { AttendanceRecord, AttendanceStatus, calculateAttendancePercentage } from '../../../types/attendance';
import { StudentAttendanceCalendar } from '../../attendance/StudentAttendanceCalendar';
import { useAuth } from '../../../context/AuthContext';

const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

interface AdminAttendanceCalendarTabProps {
  initialClass?: string;
  initialSection?: string;
}

export const AdminAttendanceCalendarTab: React.FC<AdminAttendanceCalendarTabProps> = ({
  initialClass = 'Class 1',
  initialSection = 'A',
}) => {
  const { user } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedSection, setSelectedSection] = useState<string>(initialSection);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Fetch active students for selected class & section
  useEffect(() => {
    let isMounted = true;
    const loadClassStudents = async () => {
      setLoadingStudents(true);
      try {
        const all = await studentService.getStudents();
        const filtered = all.filter(
          (s) =>
            s.status === 'ACTIVE' &&
            s.className === selectedClass &&
            s.section.toUpperCase() === selectedSection.toUpperCase()
        );

        // Sort by roll number or name
        filtered.sort((a, b) => {
          const rA = parseInt(a.rollNumber || '0', 10);
          const rB = parseInt(b.rollNumber || '0', 10);
          if (rA && rB && rA !== rB) return rA - rB;
          return a.name.localeCompare(b.name);
        });

        if (isMounted) {
          setStudents(filtered);
          // If previous selection is not in new list, pick the first one or reset
          if (filtered.length > 0) {
            const stillExists = filtered.find((s) => s.uid === selectedStudentUid);
            if (!stillExists) {
              setSelectedStudentUid(filtered[0].uid);
              setSelectedStudent(filtered[0]);
            } else {
              setSelectedStudent(stillExists);
            }
          } else {
            setSelectedStudentUid('');
            setSelectedStudent(null);
          }
        }
      } catch (err) {
        console.error('Error loading students for calendar:', err);
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    };

    loadClassStudents();
    return () => {
      isMounted = false;
    };
  }, [selectedClass, selectedSection]);

  // 2. Fetch attendance records when selected student changes
  const fetchStudentRecords = async (uid: string) => {
    if (!uid) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    try {
      const recs = await attendanceService.getStudentAttendanceRecords(uid);
      setRecords(recs);
    } catch (err) {
      console.error('Error fetching student attendance records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (selectedStudentUid) {
      fetchStudentRecords(selectedStudentUid);
    } else {
      setRecords([]);
    }
  }, [selectedStudentUid]);

  // Handle student selection change
  const handleSelectStudent = (uid: string) => {
    setSelectedStudentUid(uid);
    const found = students.find((s) => s.uid === uid) || null;
    setSelectedStudent(found);
  };

  // Filtered students by search query
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return students;
    const q = studentSearchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
    );
  }, [students, studentSearchQuery]);

  // Admin save attendance on any date
  const handleSaveAttendance = async (
    date: string,
    status: AttendanceStatus,
    remarks?: string
  ) => {
    if (!selectedStudent) return;
    try {
      await attendanceService.saveSingleStudentAttendance({
        studentDocUid: selectedStudent.uid,
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.name,
        rollNumber: selectedStudent.rollNumber,
        className: selectedStudent.className,
        section: selectedStudent.section,
        date,
        status,
        remarks,
        markedBy: user?.uid || 'ADMIN',
        markedByRole: 'ADMIN',
      });

      setNotification({
        type: 'success',
        message: `Attendance on ${date} updated to ${status}.`,
      });
      setTimeout(() => setNotification(null), 3500);

      // Refresh records
      await fetchStudentRecords(selectedStudent.uid);
    } catch (err: any) {
      console.error('Failed to save attendance:', err);
      setNotification({
        type: 'error',
        message: 'Failed to update attendance. Please try again.',
      });
      setTimeout(() => setNotification(null), 4000);
      throw err;
    }
  };

  // Admin delete attendance (revert to NOT MARKED)
  const handleDeleteAttendance = async (date: string) => {
    if (!selectedStudent) return;
    try {
      await attendanceService.deleteAttendanceRecord(
        selectedStudent.uid,
        date,
        user?.uid || 'ADMIN',
        'ADMIN'
      );

      setNotification({
        type: 'success',
        message: `Attendance on ${date} reverted to Not Marked.`,
      });
      setTimeout(() => setNotification(null), 3500);

      // Refresh records
      await fetchStudentRecords(selectedStudent.uid);
    } catch (err: any) {
      console.error('Failed to delete attendance:', err);
      setNotification({
        type: 'error',
        message: 'Failed to clear attendance.',
      });
      setTimeout(() => setNotification(null), 4000);
      throw err;
    }
  };

  return (
    <div id="admin-attendance-calendar-tab" className="space-y-6">
      {/* Target Selector Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#001c46]/5 text-[#001c46]">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
                Student Attendance Calendar & Editor
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Select Class, Section, and Student to view monthly calendar and edit any past or current attendance date.
              </p>
            </div>
          </div>

          {selectedStudent && (
            <button
              type="button"
              onClick={() => fetchStudentRecords(selectedStudent.uid)}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRecords ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            >
              {SECTION_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Student Dropdown Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select Student ({students.length} in class)
            </label>
            <select
              value={selectedStudentUid}
              onChange={(e) => handleSelectStudent(e.target.value)}
              disabled={loadingStudents || students.length === 0}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46] disabled:opacity-50"
            >
              {students.length === 0 ? (
                <option value="">No students in this class</option>
              ) : (
                students.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.rollNumber ? `Roll #${s.rollNumber} - ` : ''}
                    {s.name} ({s.studentId})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Quick Student Selection Ribbon */}
        {students.length > 0 && (
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Quick Select Student:
              </span>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter name / roll..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-gray-50 border border-gray-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-[#001c46]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredStudents.map((s) => {
                const isSelected = s.uid === selectedStudentUid;
                return (
                  <button
                    key={s.uid}
                    type="button"
                    onClick={() => handleSelectStudent(s.uid)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#001c46] text-white border-[#001c46] shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {s.rollNumber && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        #{s.rollNumber}
                      </span>
                    )}
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Calendar Section */}
      {loadingStudents ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-2">
          <RefreshCw className="w-8 h-8 mx-auto text-[#001c46] animate-spin" />
          <p className="text-xs font-medium">Loading class student roster...</p>
        </div>
      ) : !selectedStudent ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-2">
          <Users className="w-10 h-10 mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-700">No student selected</p>
          <p className="text-xs text-gray-400">
            Please select a student from Class {selectedClass} ({selectedSection}) above to view their attendance calendar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Student Info & Help Banner */}
          <div className="bg-blue-50/60 p-4 rounded-3xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#001c46] text-white flex items-center justify-center font-black text-sm shrink-0">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[#001c46]">
                    {selectedStudent.name}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-[#001c46] font-bold rounded-lg text-[10px]">
                    ID: {selectedStudent.studentId}
                  </span>
                  {selectedStudent.rollNumber && (
                    <span className="px-2 py-0.5 bg-white text-gray-700 border border-blue-200 font-bold rounded-lg text-[10px]">
                      Roll #{selectedStudent.rollNumber}
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-[11px] font-medium">
                  {selectedStudent.className} — Section {selectedStudent.section}
                </span>
              </div>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-gray-700 font-semibold text-[11px] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#001c46]" />
              <span>Admin Mode: Click any date to edit or change attendance status</span>
            </div>
          </div>

          {/* Interactive Student Attendance Calendar Component */}
          <StudentAttendanceCalendar
            student={{
              uid: selectedStudent.uid,
              studentId: selectedStudent.studentId,
              name: selectedStudent.name,
              className: selectedStudent.className,
              section: selectedStudent.section,
              rollNumber: selectedStudent.rollNumber,
            }}
            records={records}
            readOnly={false}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={handleDeleteAttendance}
          />

          {/* History Records Table for Selected Student */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FFC907]" />
                Full Attendance Log for {selectedStudent.name}
              </h3>
              <span className="text-xs font-bold text-gray-500">
                Total Logs: {records.length}
              </span>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No attendance records found for this student.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#001c46] text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Remarks / Reason</th>
                      <th className="px-4 py-3">Marked By</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {records.map((r) => {
                      const d = new Date(r.date);
                      const dayName = isNaN(d.getTime())
                        ? ''
                        : d.toLocaleDateString('en-US', { weekday: 'short' });

                      let badge = (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-[10px]">
                          {r.status}
                        </span>
                      );
                      if (r.status === 'PRESENT') {
                        badge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PRESENT
                          </span>
                        );
                      } else if (r.status === 'ABSENT') {
                        badge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-800 rounded-md font-bold text-[10px]">
                            <XCircle className="w-3 h-3 text-red-600" />
                            ABSENT
                          </span>
                        );
                      } else if (r.status === 'LEAVE') {
                        badge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            LEAVE
                          </span>
                        );
                      } else if (r.status === 'LATE') {
                        badge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            LATE
                          </span>
                        );
                      }

                      return (
                        <tr key={r.id || r.date} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900">{r.date}</td>
                          <td className="px-4 py-3 text-gray-500">{dayName}</td>
                          <td className="px-4 py-3">{badge}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                            {r.remarks || r.absenceNote || r.absenceReason || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-[11px]">
                            {r.markedBy || 'ADMIN'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                // Trigger edit by scrolling to calendar or handling click
                                const calendarEl = document.getElementById('student-attendance-calendar');
                                if (calendarEl) {
                                  calendarEl.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-[#001c46] hover:bg-blue-50 rounded-lg transition"
                            >
                              Edit in Calendar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
