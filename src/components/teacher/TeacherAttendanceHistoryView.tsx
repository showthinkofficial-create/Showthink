import React, { useState, useEffect } from 'react';
import { AttendanceRecord, formatTime12Hour, getCurrentTimeString } from '../../types/attendance';
import { attendanceService } from '../../services/attendanceService';
import { Teacher } from '../../types/teacher';
import {
  History,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sun,
  Edit2,
  X,
  Save,
  AlertCircle,
  LogIn,
  LogOut
} from 'lucide-react';

interface TeacherAttendanceHistoryViewProps {
  teacher: Teacher | null;
  assignedClasses: string[];
}

export const TeacherAttendanceHistoryView: React.FC<TeacherAttendanceHistoryViewProps> = ({
  teacher,
  assignedClasses,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing Record Modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'>('PRESENT');
  const [editInTime, setEditInTime] = useState<string>('');
  const [editOutTime, setEditOutTime] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendanceHistory({
        date: filterDate || undefined,
        className: filterClass !== 'ALL' ? filterClass : undefined,
        section: filterSection !== 'ALL' ? filterSection : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        studentSearch: searchQuery.trim() || undefined,
      });

      // Scope records to teacher's assigned classes if teacher has assigned classes
      let scoped = data;
      if (assignedClasses.length > 0) {
        const normalizedAssigned = assignedClasses.map((c) => c.toLowerCase().trim());
        scoped = data.filter((r) => {
          const matchFull = `${r.className} - ${r.section}`.toLowerCase();
          const matchClass = r.className.toLowerCase();
          return normalizedAssigned.some(
            (a) => a === matchFull || a === matchClass || a.startsWith(matchClass)
          );
        });
      }

      setRecords(scoped);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterDate, filterClass, filterSection, filterStatus, searchQuery]);

  // Compute Summary Statistics
  const totalCount = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const halfDayCount = records.filter((r) => r.status === 'HALF_DAY').length;

  const presentPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Handle Edit Submit
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;
    setSavingEdit(true);
    try {
      // Re-save single record using attendance batch save for consistency
      await attendanceService.saveAttendanceBatch(
        [
          {
            studentDocUid: editingRecord.studentUid || editingRecord.id,
            studentId: editingRecord.studentId,
            name: editingRecord.studentName || 'Student',
            rollNumber: editingRecord.rollNumber || '',
            className: editingRecord.className,
            section: editingRecord.section,
            status: editStatus,
            absenceReason: editStatus === 'ABSENT' ? editingRecord.absenceReason || 'UNINFORMED' : undefined,
            absenceNote: editStatus === 'ABSENT' ? editingRecord.absenceNote : undefined,
            inTime: editStatus === 'ABSENT' ? '' : editInTime,
            outTime: editStatus === 'ABSENT' ? '' : editOutTime,
          },
        ],
        editingRecord.date,
        editingRecord.className,
        editingRecord.section,
        teacher?.name || 'Teacher'
      );

      setAlertMsg({ type: 'success', text: `Attendance log for ${editingRecord.studentName} updated successfully!` });
      setEditingRecord(null);
      fetchHistory();
    } catch (err: any) {
      console.error('Error updating record:', err);
      setAlertMsg({ type: 'error', text: err.message || 'Failed to update attendance log.' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <History className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-black">Attendance History & Logs</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Review and manage historical attendance records submitted for your assigned classes.
            </p>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-bold">
          
          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Student Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name or Roll No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Filter Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            />
          </div>

          {/* Class Filter */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Classes</option>
              {assignedClasses.map((cls, idx) => (
                <option key={idx} value={cls.includes('-') ? cls.split('-')[0].trim() : cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>

        </div>

      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-gray-400 font-bold block text-[10px] uppercase">Total Logs</span>
          <span className="text-lg font-black text-[#001c46]">{totalCount}</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-emerald-700 font-bold block text-[10px] uppercase">Present</span>
          <span className="text-lg font-black text-emerald-900">{presentCount} ({presentPct}%)</span>
        </div>
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 shadow-2xs space-y-1">
          <span className="text-red-700 font-bold block text-[10px] uppercase">Absent</span>
          <span className="text-lg font-black text-red-900">{absentCount}</span>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
          <span className="text-amber-700 font-bold block text-[10px] uppercase">Late</span>
          <span className="text-lg font-black text-amber-900">{lateCount}</span>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
          <span className="text-blue-700 font-bold block text-[10px] uppercase">Half Day</span>
          <span className="text-lg font-black text-blue-900">{halfDayCount}</span>
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
          <button onClick={() => setAlertMsg(null)} className="text-xs text-gray-500 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading history logs...</p>
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#001c46] text-white font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Class & Sec</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timing (In / Out)</th>
                  <th className="py-3.5 px-4">Marked By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#001c46] whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {r.className} - {r.section}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {r.studentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {r.rollNumber || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'ABSENT'
                            ? 'bg-red-100 text-red-800'
                            : r.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.status === 'ABSENT' ? (
                        <span className="text-gray-400 font-normal italic text-[11px]">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {r.inTime ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <LogIn className="w-3 h-3 text-emerald-600" />
                              <span>{formatTime12Hour(r.inTime)}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">No in-time</span>
                          )}

                          {r.outTime ? (
                            <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              <LogOut className="w-3 h-3 text-indigo-600" />
                              <span>{formatTime12Hour(r.outTime)}</span>
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px]">
                      {r.markedBy}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingRecord(r);
                          setEditStatus(r.status);
                          setEditInTime(r.inTime || '08:00');
                          setEditOutTime(r.outTime || '13:30');
                        }}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#001c46] hover:text-[#FFC907] text-gray-600 transition-all cursor-pointer"
                        title="Modify Log Status"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <History className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-gray-800">No Attendance History Records Found</h3>
            <p className="text-xs text-gray-500">
              No matching records found for the applied filters.
            </p>
          </div>
        )}
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-[#001c46] text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Edit Attendance Status</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  {editingRecord.studentName} • {editingRecord.className} ({editingRecord.date})
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 block">Select New Status</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`p-3 rounded-xl border transition-all text-center cursor-pointer ${
                        editStatus === st
                          ? 'bg-[#001c46] text-[#FFC907] border-[#001c46] font-black'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timing input controls if not ABSENT */}
              {editStatus !== 'ABSENT' && (
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#001c46]">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Arrival & Departure Timings (आने / जाने का समय)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* In Time */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center justify-between">
                        <span>Arrival (In-Time)</span>
                        <button
                          type="button"
                          onClick={() => setEditInTime(getCurrentTimeString())}
                          className="text-[9px] text-emerald-700 underline font-bold cursor-pointer"
                        >
                          Set Now
                        </button>
                      </label>
                      <input
                        type="time"
                        value={editInTime}
                        onChange={(e) => setEditInTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#001c46]"
                      />
                    </div>

                    {/* Out Time */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-indigo-800 uppercase flex items-center justify-between">
                        <span>Departure (Out-Time)</span>
                        <button
                          type="button"
                          onClick={() => setEditOutTime(getCurrentTimeString())}
                          className="text-[9px] text-indigo-700 underline font-bold cursor-pointer"
                        >
                          Set Now
                        </button>
                      </label>
                      <input
                        type="time"
                        value={editOutTime}
                        onChange={(e) => setEditOutTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#001c46]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecord}
                disabled={savingEdit}
                className="px-5 py-2 bg-[#001c46] text-[#FFC907] text-xs font-black rounded-xl hover:bg-[#1a325d] transition-all inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingEdit ? 'Saving...' : 'Update Log'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
