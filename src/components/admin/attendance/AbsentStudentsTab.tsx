import React, { useState, useEffect } from 'react';
import {
  XCircle,
  Phone,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit3,
  Save,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Info,
  Calendar,
  ChevronDown,
  Printer
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  ABSENCE_REASONS,
  AbsenceReasonKey,
  getAbsenceReasonDetails
} from '../../../types/attendance';
import { attendanceService } from '../../../services/attendanceService';
import { CLASS_OPTIONS } from '../../../types/student';
import { printElementById } from '../../../lib/printUtils';

interface AbsentStudentsTabProps {
  currentDate: string;
  onDateChange?: (newDate: string) => void;
  onRefreshTopStats?: () => void;
}

export const AbsentStudentsTab: React.FC<AbsentStudentsTabProps> = ({
  currentDate,
  onDateChange,
  onRefreshTopStats,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editing state for note / remark popup
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  const loadAbsentRecords = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // Fetch all attendance records with status = ABSENT for date
      const allRecords = await attendanceService.getAttendanceHistory({
        date: selectedDate,
        className: selectedClass !== 'ALL' ? selectedClass : undefined,
        status: 'ABSENT',
      });
      setRecords(allRecords);
    } catch (err) {
      console.error('Error fetching absent records:', err);
      setErrorMsg('Failed to load absent students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbsentRecords();
  }, [selectedDate, selectedClass]);

  // Handle Reason Change
  const handleUpdateReason = async (
    record: AttendanceRecord,
    newReason: AbsenceReasonKey | string
  ) => {
    if (!record.id) return;
    setSavingId(record.id);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await attendanceService.updateAbsenceReason(record.id, newReason, record.absenceNote);
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, absenceReason: newReason } : r))
      );
      setSuccessMsg(`Reason updated for ${record.studentName}.`);
      if (onRefreshTopStats) onRefreshTopStats();
    } catch (err) {
      console.error('Error updating absence reason:', err);
      setErrorMsg('Failed to update absence reason.');
    } finally {
      setSavingId(null);
    }
  };

  // Handle Note Save
  const handleSaveNote = async (record: AttendanceRecord) => {
    if (!record.id) return;
    setSavingId(record.id);
    try {
      await attendanceService.updateAbsenceReason(
        record.id,
        record.absenceReason || 'UNINFORMED',
        tempNote
      );
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, absenceNote: tempNote } : r))
      );
      setEditingNoteId(null);
      setTempNote('');
      setSuccessMsg(`Remark saved for ${record.studentName}.`);
    } catch (err) {
      console.error('Error updating note:', err);
      setErrorMsg('Failed to save absence note.');
    } finally {
      setSavingId(null);
    }
  };

  // Quick Change Status (e.g. if student showed up late)
  const handleQuickStatusChange = async (
    record: AttendanceRecord,
    newStatus: 'PRESENT' | 'LATE' | 'HALF_DAY'
  ) => {
    if (!record.id) return;
    setSavingId(record.id);
    try {
      await attendanceService.saveAttendanceBatch(
        [
          {
            studentDocUid: record.studentUid,
            studentId: record.studentId,
            name: record.studentName,
            rollNumber: record.rollNumber,
            className: record.className,
            section: record.section,
            status: newStatus,
          },
        ],
        record.date,
        record.className,
        record.section,
        'ADMIN'
      );
      // Remove from absent list
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setSuccessMsg(`${record.studentName} marked as ${newStatus}.`);
      if (onRefreshTopStats) onRefreshTopStats();
    } catch (err) {
      console.error('Error changing student status:', err);
      setErrorMsg('Failed to update student status.');
    } finally {
      setSavingId(null);
    }
  };

  // Stats calculation
  const totalAbsent = records.length;
  const sickCount = records.filter(
    (r) => r.absenceReason === 'SICK_LEAVE' || r.absenceReason?.toLowerCase().includes('sick')
  ).length;
  const urgentCount = records.filter(
    (r) => r.absenceReason === 'URGENT_WORK' || r.absenceReason?.toLowerCase().includes('family')
  ).length;
  const approvedCount = records.filter(
    (r) => r.absenceReason === 'APPROVED_LEAVE' || r.absenceReason?.toLowerCase().includes('approved')
  ).length;
  const uninformedCount = records.filter(
    (r) => !r.absenceReason || r.absenceReason === 'UNINFORMED'
  ).length;
  const otherCount = totalAbsent - (sickCount + urgentCount + approvedCount + uninformedCount);

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (selectedReasonFilter !== 'ALL') {
      if (selectedReasonFilter === 'UNINFORMED') {
        if (r.absenceReason && r.absenceReason !== 'UNINFORMED') return false;
      } else {
        if (r.absenceReason !== selectedReasonFilter) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.studentName?.toLowerCase().includes(q);
      const matchId = r.studentId?.toLowerCase().includes(q);
      const matchRoll = r.rollNumber?.toLowerCase().includes(q);
      const matchClass = r.className?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchRoll && !matchClass) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER & REASON SUMMARY CARDS */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/80">
                <XCircle className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#001c46]">
                Absent Students Tracker & Reasons
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Track absent students, categorize reasons for absence, and manage parent communications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (onDateChange) onDateChange(e.target.value);
              }}
              className="px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#001c46] focus:outline-none"
            />
            <button
              onClick={loadAbsentRecords}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
              title="Refresh Absentees"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() =>
                printElementById('absent-students-printable-report', {
                  title: `Absent_Students_${selectedDate}`,
                  landscape: false,
                })
              }
              className="px-3.5 py-2 bg-[#001c46] hover:bg-[#002d6b] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Print Absent Students List"
            >
              <Printer className="w-4 h-4 text-[#FFC907]" />
              <span>Print List</span>
            </button>
          </div>
        </div>

        {/* 4 PRIMARY REASON SUMMARY CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Total Absent */}
          <div
            onClick={() => setSelectedReasonFilter('ALL')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedReasonFilter === 'ALL'
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-300'
                : 'bg-rose-50/70 border-rose-200/80 text-rose-900 hover:bg-rose-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Absent</span>
              <span className="text-xs">📋</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">{totalAbsent}</div>
            <div className={`text-[10px] font-medium mt-0.5 ${selectedReasonFilter === 'ALL' ? 'text-rose-100' : 'text-rose-600'}`}>
              All absentees
            </div>
          </div>

          {/* Sick / Medical */}
          <div
            onClick={() => setSelectedReasonFilter('SICK_LEAVE')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedReasonFilter === 'SICK_LEAVE'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200/80 text-amber-900 hover:bg-amber-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sick / Medical</span>
              <span className="text-xs">🤒</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">{sickCount}</div>
            <div className={`text-[10px] font-medium mt-0.5 ${selectedReasonFilter === 'SICK_LEAVE' ? 'text-amber-100' : 'text-amber-600'}`}>
              बीमारी / अस्वस्थता
            </div>
          </div>

          {/* Family / Urgent */}
          <div
            onClick={() => setSelectedReasonFilter('URGENT_WORK')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedReasonFilter === 'URGENT_WORK'
                ? 'bg-orange-500 text-white border-orange-600 shadow-sm ring-2 ring-orange-300'
                : 'bg-orange-50/70 border-orange-200/80 text-orange-900 hover:bg-orange-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider">Family / Urgent</span>
              <span className="text-xs">🏠</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">{urgentCount}</div>
            <div className={`text-[10px] font-medium mt-0.5 ${selectedReasonFilter === 'URGENT_WORK' ? 'text-orange-100' : 'text-orange-600'}`}>
              पारिवारिक / आकस्मिक
            </div>
          </div>

          {/* Approved Leave */}
          <div
            onClick={() => setSelectedReasonFilter('APPROVED_LEAVE')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedReasonFilter === 'APPROVED_LEAVE'
                ? 'bg-blue-500 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                : 'bg-blue-50/70 border-blue-200/80 text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider">Approved Leave</span>
              <span className="text-xs">📝</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">{approvedCount}</div>
            <div className={`text-[10px] font-medium mt-0.5 ${selectedReasonFilter === 'APPROVED_LEAVE' ? 'text-blue-100' : 'text-blue-600'}`}>
              स्वीकृत अवकाश
            </div>
          </div>

          {/* Uninformed */}
          <div
            onClick={() => setSelectedReasonFilter('UNINFORMED')}
            className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedReasonFilter === 'UNINFORMED'
                ? 'bg-rose-700 text-white border-rose-800 shadow-sm ring-2 ring-rose-400'
                : 'bg-rose-50/40 border-rose-200/60 text-rose-800 hover:bg-rose-100/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider">Uninformed</span>
              <span className="text-xs">❓</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">{uninformedCount}</div>
            <div className={`text-[10px] font-medium mt-0.5 ${selectedReasonFilter === 'UNINFORMED' ? 'text-rose-200' : 'text-rose-600'}`}>
              बिना सूचना / अ सूचित
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            >
              <option value="ALL">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Reason:</span>
            <select
              value={selectedReasonFilter}
              onChange={(e) => setSelectedReasonFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            >
              <option value="ALL">All Reasons ({records.length})</option>
              {ABSENCE_REASONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.icon} {r.shortLabel} ({r.hindiLabel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or roll..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
          />
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            ×
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl flex items-center justify-between text-xs font-bold shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900">
            ×
          </button>
        </div>
      )}

      {/* ABSENT STUDENTS LIST */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading absent students...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">No absent students found</h3>
          <p className="text-xs text-gray-500">
            {records.length === 0
              ? `Great! All students are marked present or no attendance recorded for ${selectedDate}.`
              : 'No absent students match your selected filters.'}
          </p>
        </div>
      ) : (
        <div id="absent-students-printable-report" className="space-y-3">
          {/* Print Only School Header */}
          <div className="hidden print:block mb-4 p-4 border-b-2 border-[#001c46] text-center">
            <h1 className="text-2xl font-black text-[#001c46] tracking-wider uppercase">GP ACADEMY</h1>
            <p className="text-xs font-bold text-gray-700 uppercase mt-0.5">
              Daily Absent Students Report — Date: {selectedDate}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Class: {selectedClass} | Reason Filter: {selectedReasonFilter} | Total Absentees: {filteredRecords.length}
            </p>
          </div>

          {filteredRecords.map((record) => {
            const currentReasonKey = record.absenceReason || 'UNINFORMED';
            const reasonDetails = getAbsenceReasonDetails(currentReasonKey);
            const isEditingThisNote = editingNoteId === record.id;
            const isUpdating = savingId === record.id;

            return (
              <div
                key={record.id || record.studentUid}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs hover:border-gray-300 transition-all space-y-3.5"
              >
                {/* TOP ROW: STUDENT INFO & QUICK ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 font-black text-sm flex items-center justify-center shrink-0 border border-rose-200">
                      {record.rollNumber || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900">
                          {record.studentName}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#001c46] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {record.studentId}
                        </span>
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {record.className} - {record.section}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                        <span>Roll: <strong>{record.rollNumber || '—'}</strong></span>
                        <span>•</span>
                        <span>Date: <strong>{record.date}</strong></span>
                        <span>•</span>
                        <span>Marked by: <strong>{record.markedBy || 'Staff'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* QUICK STATUS RESTORE BUTTONS */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">
                      Change to:
                    </span>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleQuickStatusChange(record, 'PRESENT')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Mark Present"
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleQuickStatusChange(record, 'LATE')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Mark Late"
                    >
                      Late
                    </button>
                  </div>
                </div>

                {/* MIDDLE ROW: REASON SELECTOR PILLS */}
                <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#001c46] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📌</span>
                      <span>Reason for Absence (अनुपस्थिति का कारण):</span>
                    </span>
                    {isUpdating && (
                      <span className="text-[10px] font-bold text-[#001c46] flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Saving reason...
                      </span>
                    )}
                  </div>

                  {/* 4+ Standard Reasons Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ABSENCE_REASONS.map((reason) => {
                      const isSelected = currentReasonKey === reason.key;
                      return (
                        <button
                          key={reason.key}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateReason(record, reason.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? `${reason.badgeBg} ${reason.badgeText} ${reason.badgeBorder} ring-2 ring-offset-1 ring-current shadow-xs font-black`
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100/80'
                          }`}
                          title={`${reason.label} (${reason.hindiLabel}): ${reason.description}`}
                        >
                          <span>{reason.icon}</span>
                          <span>{reason.shortLabel}</span>
                          <span className="text-[10px] opacity-75 font-normal">
                            ({reason.hindiLabel})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM ROW: REMARK / NOTE & PARENT CALL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  {/* Note / Remark area */}
                  <div className="flex-1">
                    {isEditingThisNote ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="e.g. Fever doctor note sent, expected back Monday..."
                          className="flex-1 px-3 py-1.5 bg-white border border-[#001c46] rounded-xl text-xs font-medium focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveNote(record)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-[#001c46] text-white rounded-xl font-bold text-xs hover:bg-[#001535] cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setTempNote('');
                          }}
                          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-semibold text-[11px]">Remark:</span>
                        {record.absenceNote ? (
                          <span className="text-gray-800 bg-amber-50/60 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium italic text-xs">
                            "{record.absenceNote}"
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">
                            No specific remarks added.
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingNoteId(record.id || null);
                            setTempNote(record.absenceNote || '');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors cursor-pointer"
                          title="Edit Remark"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
