import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Timetable,
  TimetableEntry,
  TimetableFormData,
  TimetableEntryFormData,
  TimetableStatus,
  DayOfWeek,
  EntryType,
  DAYS_OF_WEEK,
  SECTION_OPTIONS,
  ACADEMIC_SESSION_OPTIONS,
  ENTRY_TYPE_OPTIONS,
} from '../../types/timetable';
import { CLASS_OPTIONS, BOARD_OPTIONS, getAllowedBoardsForClass } from '../../types/student';
import { SUBJECT_OPTIONS, Teacher } from '../../types/teacher';
import { timetableService } from '../../services/timetableService';
import { teacherService } from '../../services/teacherService';
import { printElementById } from '../../lib/printUtils';
import {
  Clock,
  Plus,
  Search,
  Filter,
  Calendar,
  UserCheck,
  Building,
  Edit,
  Trash2,
  Printer,
  CheckCircle,
  AlertTriangle,
  Archive,
  Eye,
  ArrowLeft,
  X,
  Loader2,
  BookOpen,
  Coffee,
  Sun,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';

interface TimetableManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function TimetableManager({ currentPath, onNavigate }: TimetableManagerProps) {
  const { userProfile } = useAuth();

  // Role Security Check
  const isAdminOrSuper = userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';

  // Extract ID from path if viewing detail: /admin/timetable/XYZ
  const timetableIdFromPath = useMemo(() => {
    const parts = currentPath.split('/admin/timetable/');
    if (parts.length > 1 && parts[1]) {
      return parts[1].split('/')[0];
    }
    return null;
  }, [currentPath]);

  // Main List State
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filterSession, setFilterSession] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterBoard, setFilterBoard] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Timetable Detail View State
  const [activeTimetable, setActiveTimetable] = useState<Timetable | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [selectedMobileDay, setSelectedMobileDay] = useState<DayOfWeek>('Monday');

  // Teachers Database List
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Modals Control
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form States - Timetable Header
  const [headerForm, setHeaderForm] = useState<TimetableFormData>({
    academicSession: '2026-2027',
    className: 'Class 1',
    section: 'A',
    board: 'CBSE',
    status: 'DRAFT',
  });
  const [isSubmittingHeader, setIsSubmittingHeader] = useState(false);
  const [headerFormError, setHeaderFormError] = useState<string | null>(null);

  // Form States - Period / Break Entry
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [entryForm, setEntryForm] = useState<TimetableEntryFormData>({
    timetableId: '',
    day: 'Monday',
    periodNumber: 1,
    startTime: '08:00',
    endTime: '08:45',
    subject: 'Mathematics',
    teacherId: '',
    teacherName: '',
    room: 'Room 101',
    type: 'CLASS',
  });
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);
  const [entryFormError, setEntryFormError] = useState<string | null>(null);

  // Load initial list of timetables & teachers
  useEffect(() => {
    fetchTimetables();
    fetchTeachersList();
  }, []);

  // Fetch timetable detail if timetableIdFromPath changes
  useEffect(() => {
    if (timetableIdFromPath) {
      loadTimetableDetail(timetableIdFromPath);
    } else {
      setActiveTimetable(null);
      setEntries([]);
    }
  }, [timetableIdFromPath]);

  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await timetableService.getTimetables();
      setTimetables(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load timetables.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachersList = async () => {
    try {
      const teacherData = await teacherService.getTeachers();
      setTeachers(teacherData);
    } catch (err) {
      console.warn('Failed to load teachers for timetable assignment:', err);
    }
  };

  const loadTimetableDetail = async (id: string) => {
    setLoadingEntries(true);
    try {
      const tt = await timetableService.getTimetableById(id);
      if (tt) {
        setActiveTimetable(tt);
        const entryList = await timetableService.getTimetableEntries(id);
        setEntries(entryList);
      } else {
        setActiveTimetable(null);
        setError('Timetable not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading timetable details.');
    } finally {
      setLoadingEntries(false);
    }
  };

  // Filtered Timetables for List View
  const filteredTimetables = useMemo(() => {
    return timetables.filter((tt) => {
      if (filterSession && tt.academicSession !== filterSession) return false;
      if (filterClass && tt.className !== filterClass) return false;
      if (filterSection && tt.section !== filterSection) return false;
      if (filterBoard && tt.board !== filterBoard) return false;
      if (filterStatus && tt.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        const matchMeta =
          tt.className.toLowerCase().includes(queryLower) ||
          tt.section.toLowerCase().includes(queryLower) ||
          tt.academicSession.toLowerCase().includes(queryLower) ||
          tt.board.toLowerCase().includes(queryLower);
        if (!matchMeta) return false;
      }
      return true;
    });
  }, [timetables, filterSession, filterClass, filterSection, filterBoard, filterStatus, searchQuery]);

  // Filtered Entries for Active Timetable (Detail View search)
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const queryLower = searchQuery.toLowerCase().trim();
    return entries.filter((entry) => {
      const matchSub = entry.subject.toLowerCase().includes(queryLower);
      const matchTeach = entry.teacherName?.toLowerCase().includes(queryLower) || false;
      const matchRoom = entry.room?.toLowerCase().includes(queryLower) || false;
      return matchSub || matchTeach || matchRoom;
    });
  }, [entries, searchQuery]);

  // Handle Class change in Header Form to auto-set Board according to GP Academy rules
  const handleHeaderClassChange = (newClass: string) => {
    const allowed = getAllowedBoardsForClass(newClass);
    const newBoard = allowed.includes(headerForm.board) ? headerForm.board : allowed[0];
    setHeaderForm((prev) => ({
      ...prev,
      className: newClass,
      board: newBoard,
    }));
  };

  // Submit Header Form (Create or Edit Timetable)
  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeaderFormError(null);
    setIsSubmittingHeader(true);

    try {
      if (editingTimetable) {
        await timetableService.updateTimetable(editingTimetable.id, headerForm);
        setEditingTimetable(null);
        if (activeTimetable && activeTimetable.id === editingTimetable.id) {
          setActiveTimetable((prev) => (prev ? { ...prev, ...headerForm } : null));
        }
      } else {
        const created = await timetableService.createTimetable(headerForm);
        setIsCreateModalOpen(false);
        onNavigate(`/admin/timetable/${created.id}`);
      }
      await fetchTimetables();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setHeaderFormError(err.message || 'Failed to save timetable header.');
    } finally {
      setIsSubmittingHeader(false);
    }
  };

  // Open Period / Break Entry Modal
  const handleOpenEntryModal = (entryToEdit?: TimetableEntry, defaultDay?: DayOfWeek, defaultPeriod?: number) => {
    setEntryFormError(null);
    if (entryToEdit) {
      setEditingEntry(entryToEdit);
      const isKnownSub = (SUBJECT_OPTIONS as readonly string[]).includes(entryToEdit.subject);
      setIsCustomSubject(!isKnownSub && entryToEdit.type === 'CLASS');
      setCustomSubjectInput(isKnownSub ? '' : entryToEdit.subject);

      setEntryForm({
        timetableId: entryToEdit.timetableId,
        day: entryToEdit.day,
        periodNumber: entryToEdit.periodNumber,
        startTime: entryToEdit.startTime,
        endTime: entryToEdit.endTime,
        subject: entryToEdit.subject,
        teacherId: entryToEdit.teacherId || '',
        teacherName: entryToEdit.teacherName || '',
        room: entryToEdit.room || '',
        type: entryToEdit.type,
      });
    } else {
      setEditingEntry(null);
      setIsCustomSubject(false);
      setCustomSubjectInput('');

      // Auto-compute next period number if not specified
      const currentDayEntries = entries.filter((e) => e.day === (defaultDay || 'Monday'));
      const maxPeriod = currentDayEntries.reduce((max, e) => Math.max(max, e.periodNumber), 0);
      const nextPeriodNum = defaultPeriod || maxPeriod + 1;

      // Estimate timings
      const startHour = 8 + Math.floor((nextPeriodNum - 1) * 0.75);
      const startMin = ((nextPeriodNum - 1) * 45) % 60;
      const endHour = startHour + Math.floor((startMin + 45) / 60);
      const endMin = (startMin + 45) % 60;

      const formatTime = (h: number, m: number) =>
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      setEntryForm({
        timetableId: activeTimetable?.id || '',
        day: defaultDay || selectedMobileDay || 'Monday',
        periodNumber: nextPeriodNum,
        startTime: formatTime(startHour, startMin),
        endTime: formatTime(endHour, endMin),
        subject: 'Mathematics',
        teacherId: '',
        teacherName: '',
        room: 'Room 101',
        type: 'CLASS',
      });
    }
    setIsEntryModalOpen(true);
  };

  // Selected Teacher Status Check
  const selectedTeacherObj = useMemo(() => {
    if (!entryForm.teacherId) return null;
    return teachers.find((t) => t.uid === entryForm.teacherId) || null;
  }, [entryForm.teacherId, teachers]);

  // Submit Entry Form (Add or Edit Period/Break)
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntryFormError(null);

    // Form final subject string
    let finalSubject = entryForm.subject;
    if (entryForm.type === 'CLASS' && isCustomSubject) {
      if (!customSubjectInput.trim()) {
        setEntryFormError('Please enter a custom subject name.');
        return;
      }
      finalSubject = customSubjectInput.trim();
    }

    if (!finalSubject.trim()) {
      setEntryFormError('Please select or specify a subject/title.');
      return;
    }

    // Determine teacher name from selected object if CLASS
    let teacherNameStr = '';
    if (entryForm.type === 'CLASS' && entryForm.teacherId) {
      if (selectedTeacherObj) {
        if (selectedTeacherObj.status === 'DISABLED') {
          setEntryFormError(`Teacher "${selectedTeacherObj.name}" is disabled and cannot be assigned.`);
          return;
        }
        teacherNameStr = selectedTeacherObj.name;
      }
    }

    const payload: TimetableEntryFormData = {
      ...entryForm,
      subject: finalSubject,
      teacherName: teacherNameStr,
    };

    setIsSubmittingEntry(true);
    try {
      if (editingEntry) {
        await timetableService.updateTimetableEntry(editingEntry.id, payload);
      } else {
        await timetableService.addTimetableEntry(payload);
      }
      if (activeTimetable) {
        await loadTimetableDetail(activeTimetable.id);
      }
      setIsEntryModalOpen(false);
    } catch (err: any) {
      setEntryFormError(err.message || 'Error saving period entry.');
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  // Delete Timetable Entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this period entry?')) return;
    try {
      await timetableService.deleteTimetableEntry(entryId);
      if (activeTimetable) {
        await loadTimetableDetail(activeTimetable.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete period entry.');
    }
  };

  // Status Actions (Publish, Archive, Draft)
  const handleUpdateStatus = async (id: string, newStatus: TimetableStatus) => {
    try {
      await timetableService.updateTimetableStatus(id, newStatus);
      if (activeTimetable && activeTimetable.id === id) {
        setActiveTimetable((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      await fetchTimetables();
    } catch (err: any) {
      alert(err.message || 'Failed to update timetable status.');
    }
  };

  // Delete Entire Timetable
  const handleDeleteTimetable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timetable? All schedule entries will be deleted.')) {
      return;
    }
    try {
      await timetableService.deleteTimetable(id);
      await fetchTimetables();
      if (timetableIdFromPath === id) {
        onNavigate('/admin/timetable');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete timetable.');
    }
  };

  // Get distinct period numbers sorted across all entries
  const periodNumbersSorted = useMemo(() => {
    const set = new Set<number>();
    entries.forEach((e) => set.add(e.periodNumber));
    if (set.size === 0) return [1, 2, 3, 4, 5, 6, 7, 8];
    return Array.from(set).sort((a, b) => a - b);
  }, [entries]);

  // Guard: Unauthorized View
  if (!isAdminOrSuper) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-lg max-w-xl mx-auto my-12 border border-red-100">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-[#001c46] uppercase mb-2">Access Restricted</h2>
        <p className="text-gray-600 text-sm mb-6">
          Only Super Admins and Admins can view or manage class timetables.
        </p>
        <button
          onClick={() => onNavigate('/admin')}
          className="px-6 py-2.5 bg-[#001c46] text-white font-bold rounded-xl hover:bg-navy-800 transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // ==========================================
  // DETAIL VIEW FOR /admin/timetable/:id
  // ==========================================
  if (activeTimetable) {
    return (
      <div className="space-y-6">
        {/* Top Header & Breadcrumb Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/admin/timetable')}
              className="p-2.5 rounded-2xl bg-gray-50 text-gray-600 hover:bg-[#001c46] hover:text-white transition-all cursor-pointer shrink-0 shadow-xs"
              title="Back to Timetables List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-1 bg-navy-50 text-[#001c46] rounded-lg uppercase tracking-wider">
                  Session: {activeTimetable.academicSession}
                </span>
                <span className="text-xs font-black px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg uppercase tracking-wider">
                  {activeTimetable.board}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    activeTimetable.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeTimetable.status === 'ARCHIVED'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {activeTimetable.status}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#001c46] tracking-tight mt-1">
                {activeTimetable.className} - Section {activeTimetable.section} Timetable
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <button
              onClick={() => handleOpenEntryModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#001c46] hover:bg-navy-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#FFC907]" />
              <span>Add Period / Break</span>
            </button>

            {/* Status Change Controls */}
            {activeTimetable.status === 'DRAFT' && (
              <button
                onClick={() => handleUpdateStatus(activeTimetable.id, 'PUBLISHED')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                title="Publish Timetable"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Publish</span>
              </button>
            )}

            {activeTimetable.status === 'PUBLISHED' && (
              <button
                onClick={() => handleUpdateStatus(activeTimetable.id, 'ARCHIVED')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                title="Archive Timetable"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
            )}

            {activeTimetable.status === 'ARCHIVED' && (
              <button
                onClick={() => handleUpdateStatus(activeTimetable.id, 'DRAFT')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                title="Revert to Draft"
              >
                <Edit className="w-4 h-4" />
                <span>Revert to Draft</span>
              </button>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={() =>
                printElementById('printable-timetable', {
                  title: `${activeTimetable.className}_${activeTimetable.section}_Timetable`,
                  landscape: true,
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#001c46] font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all cursor-pointer hover:border-[#001c46]/30 active:scale-95"
              title="Print Timetable"
            >
              <Printer className="w-4 h-4 text-[#001c46]" />
              <span>Print</span>
            </button>

            {/* Delete Timetable Button */}
            <button
              onClick={() => handleDeleteTimetable(activeTimetable.id)}
              className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title="Delete Entire Timetable"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search inside Timetable View */}
        <div className="bg-white p-4 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search period by subject, teacher name, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ================= Printable Timetable View (Targeted by @media print) ================= */}
        <div id="printable-timetable" className="print:block bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Print Only Header */}
          <div className="hidden print:block mb-6 border-b-2 border-[#001c46] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-[#001c46] tracking-wider uppercase">GP ACADEMY</h1>
                <p className="text-xs font-bold text-gray-600">Official Class Timetable Schedule</p>
              </div>
              <div className="text-right text-xs font-bold text-gray-700 space-y-0.5">
                <p><span className="text-gray-500">Academic Session:</span> {activeTimetable.academicSession}</p>
                <p><span className="text-gray-500">Class & Section:</span> {activeTimetable.className} - {activeTimetable.section}</p>
                <p><span className="text-gray-500">Board:</span> {activeTimetable.board}</p>
              </div>
            </div>
          </div>

          {loadingEntries ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#001c46]" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Schedule Entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center bg-gray-50/70 rounded-2xl border-2 border-dashed border-gray-200">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#001c46] mb-1">No timetable available for this class.</h3>
              <p className="text-xs text-gray-500 mb-5 max-w-md mx-auto">
                No periods or breaks have been created for {activeTimetable.className} ({activeTimetable.section}) yet.
              </p>
              <button
                onClick={() => handleOpenEntryModal()}
                className="px-5 py-2.5 bg-[#001c46] hover:bg-navy-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#FFC907]" />
                <span>Add First Period</span>
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TIMETABLE GRID (Hidden on mobile) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-[#001c46] text-white">
                      <th className="p-3 text-xs font-black uppercase tracking-wider border border-white/20 w-28 text-center">
                        Period / Time
                      </th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th
                          key={day}
                          className="p-3 text-xs font-black uppercase tracking-wider border border-white/20 text-center min-w-[140px]"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodNumbersSorted.map((pNum) => {
                      // Find representative timing for this period
                      const repEntry = entries.find((e) => e.periodNumber === pNum);
                      const timeLabel = repEntry
                        ? `${repEntry.startTime} - ${repEntry.endTime}`
                        : `Period ${pNum}`;

                      return (
                        <tr key={pNum} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                          {/* Period Label Column */}
                          <td className="p-3 border border-gray-200 text-center bg-gray-50/80 align-middle">
                            <div className="text-xs font-black text-[#001c46]">Period {pNum}</div>
                            {repEntry && (
                              <div className="text-[10px] font-bold text-gray-500 mt-0.5">{timeLabel}</div>
                            )}
                          </td>

                          {/* Days Columns */}
                          {DAYS_OF_WEEK.map((day) => {
                            const matchEntry = filteredEntries.find(
                              (e) => e.day === day && e.periodNumber === pNum
                            );

                            if (!matchEntry) {
                              return (
                                <td
                                  key={day}
                                  className="p-2 border border-gray-200 text-center align-middle group relative"
                                >
                                  <button
                                    onClick={() => handleOpenEntryModal(undefined, day, pNum)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 bg-navy-50 text-[#001c46] rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#001c46] hover:text-white transition-all cursor-pointer mx-auto inline-flex items-center gap-1"
                                    title="Assign Period"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </button>
                                </td>
                              );
                            }

                            // Class vs Break vs Assembly styling
                            const isBreak = matchEntry.type === 'BREAK';
                            const isAssembly = matchEntry.type === 'ASSEMBLY';

                            return (
                              <td
                                key={day}
                                className={`p-3 border border-gray-200 align-top relative group transition-all ${
                                  isBreak
                                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                                    : isAssembly
                                    ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                                    : 'bg-white hover:bg-blue-50/40'
                                }`}
                              >
                                {/* Quick Edit/Delete overlay icons */}
                                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg shadow-xs transition-opacity z-10 print:hidden">
                                  <button
                                    onClick={() => handleOpenEntryModal(matchEntry)}
                                    className="p-1 text-gray-600 hover:text-[#001c46] rounded-md transition-colors"
                                    title="Edit Period"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntry(matchEntry.id)}
                                    className="p-1 text-red-500 hover:text-red-700 rounded-md transition-colors"
                                    title="Delete Period"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {isBreak || isAssembly ? (
                                  <div className="text-center py-2">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        isBreak
                                          ? 'bg-amber-200 text-amber-900'
                                          : 'bg-purple-200 text-purple-900'
                                      }`}
                                    >
                                      {isBreak ? <Coffee className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                                      {matchEntry.type}
                                    </span>
                                    <div className="font-black text-xs mt-1">{matchEntry.subject}</div>
                                    <div className="text-[10px] font-bold opacity-75 mt-0.5">
                                      {matchEntry.startTime} - {matchEntry.endTime}
                                    </div>
                                    {matchEntry.room && (
                                      <div className="text-[10px] font-medium opacity-80 mt-0.5">
                                        📍 {matchEntry.room}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-black text-xs text-[#001c46] leading-snug">
                                      {matchEntry.subject}
                                    </div>
                                    {matchEntry.teacherName && (
                                      <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 mt-1">
                                        <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span className="truncate">{matchEntry.teacherName}</span>
                                      </div>
                                    )}
                                    {matchEntry.room && (
                                      <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 mt-0.5">
                                        <Building className="w-2.5 h-2.5 shrink-0" />
                                        <span>{matchEntry.room}</span>
                                      </div>
                                    )}
                                    <div className="text-[10px] font-bold text-gray-400 mt-1">
                                      {matchEntry.startTime} - {matchEntry.endTime}
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE DAY-WISE CARDS LAYOUT (Shown on mobile / small screens) */}
              <div className="block lg:hidden print:hidden space-y-4">
                {/* Day Tab Selectors */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayCount = filteredEntries.filter((e) => e.day === day).length;
                    const isActive = selectedMobileDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedMobileDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#001c46] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{day.substring(0, 3)}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {dayCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Cards for Selected Mobile Day */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
                      {selectedMobileDay} Schedule
                    </h3>
                    <button
                      onClick={() => handleOpenEntryModal(undefined, selectedMobileDay)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-[#001c46] font-bold text-xs rounded-xl hover:bg-[#001c46] hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Entry</span>
                    </button>
                  </div>

                  {filteredEntries.filter((e) => e.day === selectedMobileDay).length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500">
                      <p className="text-xs font-bold">No periods assigned for {selectedMobileDay}.</p>
                    </div>
                  ) : (
                    filteredEntries
                      .filter((e) => e.day === selectedMobileDay)
                      .sort((a, b) => a.periodNumber - b.periodNumber)
                      .map((entry) => {
                        const isBreak = entry.type === 'BREAK';
                        const isAssembly = entry.type === 'ASSEMBLY';

                        return (
                          <div
                            key={entry.id}
                            className={`p-4 rounded-2xl border shadow-2xs transition-all relative ${
                              isBreak
                                ? 'bg-amber-50/80 border-amber-200'
                                : isAssembly
                                ? 'bg-purple-50/80 border-purple-200'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#001c46] text-white text-[10px] font-black rounded-lg uppercase">
                                  P{entry.periodNumber}
                                </span>
                                <span className="text-xs font-extrabold text-gray-500">
                                  {entry.startTime} - {entry.endTime}
                                </span>
                                {entry.type !== 'CLASS' && (
                                  <span
                                    className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                                      isBreak ? 'bg-amber-200 text-amber-900' : 'bg-purple-200 text-purple-900'
                                    }`}
                                  >
                                    {entry.type}
                                  </span>
                                )}
                              </div>

                              {/* Card Actions */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEntryModal(entry)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2">
                              <h4 className="text-sm font-black text-[#001c46]">{entry.subject}</h4>
                              {entry.teacherName && (
                                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                  <span>{entry.teacherName}</span>
                                </p>
                              )}
                              {entry.room && (
                                <p className="text-[11px] font-medium text-gray-600 flex items-center gap-1 mt-0.5">
                                  <Building className="w-3 h-3 shrink-0" />
                                  <span>{entry.room}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ENTRY EDIT/CREATE MODAL */}
        {isEntryModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#001c46]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-[#001c46]">
                    {editingEntry ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeTimetable.className} ({activeTimetable.section})
                  </p>
                </div>
                <button
                  onClick={() => setIsEntryModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-4 mt-4">
                {entryFormError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span className="font-semibold">{entryFormError}</span>
                  </div>
                )}

                {/* Entry Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1.5">
                    Entry Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ENTRY_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setEntryForm((prev) => ({
                            ...prev,
                            type: opt.value,
                            subject: opt.value === 'BREAK' ? 'Short Break' : opt.value === 'ASSEMBLY' ? 'Morning Assembly' : 'Mathematics',
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          entryForm.type === opt.value
                            ? 'bg-[#001c46] text-white border-[#001c46] shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs font-black">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day & Period Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                      Day
                    </label>
                    <select
                      value={entryForm.day}
                      onChange={(e) =>
                        setEntryForm((prev) => ({ ...prev, day: e.target.value as DayOfWeek }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                      Period Number
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={entryForm.periodNumber}
                      onChange={(e) =>
                        setEntryForm((prev) => ({
                          ...prev,
                          periodNumber: Math.max(1, parseInt(e.target.value) || 1),
                        }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                      required
                    />
                  </div>
                </div>

                {/* Timings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={entryForm.startTime}
                      onChange={(e) =>
                        setEntryForm((prev) => ({ ...prev, startTime: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={entryForm.endTime}
                      onChange={(e) =>
                        setEntryForm((prev) => ({ ...prev, endTime: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                      required
                    />
                  </div>
                </div>

                {/* Subject / Title */}
                <div>
                  <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                    {entryForm.type === 'CLASS' ? 'Subject' : 'Break / Event Name'}
                  </label>
                  {entryForm.type === 'CLASS' ? (
                    <div className="space-y-2">
                      <select
                        value={isCustomSubject ? 'CUSTOM' : entryForm.subject}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM') {
                            setIsCustomSubject(true);
                          } else {
                            setIsCustomSubject(false);
                            setEntryForm((prev) => ({ ...prev, subject: e.target.value }));
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                      >
                        {SUBJECT_OPTIONS.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                        <option value="CUSTOM">+ Add Custom Subject...</option>
                      </select>

                      {isCustomSubject && (
                        <input
                          type="text"
                          placeholder="Type custom subject name (e.g., Artificial Intelligence)..."
                          value={customSubjectInput}
                          onChange={(e) => setCustomSubjectInput(e.target.value)}
                          className="w-full px-3 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                          required
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Lunch Break, Short Break, Morning Assembly..."
                      value={entryForm.subject}
                      onChange={(e) =>
                        setEntryForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                      required
                    />
                  )}
                </div>

                {/* Teacher Assignment (Only for CLASS type) */}
                {entryForm.type === 'CLASS' && (
                  <div>
                    <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                      Assign Teacher
                    </label>
                    <select
                      value={entryForm.teacherId}
                      onChange={(e) =>
                        setEntryForm((prev) => ({ ...prev, teacherId: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                    >
                      <option value="">-- Select Teacher --</option>
                      {teachers.map((t) => (
                        <option key={t.uid} value={t.uid}>
                          {t.name} ({t.teacherId || 'Faculty'}) {t.status === 'DISABLED' ? '🚫 [DISABLED]' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Warning if selected teacher is disabled */}
                    {selectedTeacherObj && selectedTeacherObj.status === 'DISABLED' && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Warning: This teacher is disabled and cannot be assigned.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Room Number */}
                <div>
                  <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                    Room Number / Location <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101, Science Lab 1, Computer Center..."
                    value={entryForm.room}
                    onChange={(e) =>
                      setEntryForm((prev) => ({ ...prev, room: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEntryModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEntry || (selectedTeacherObj?.status === 'DISABLED')}
                    className="px-5 py-2.5 bg-[#001c46] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-navy-800 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingEntry && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TIMETABLES LIST VIEW (Main Route /admin/timetable)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#001c46]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#001c46] tracking-tight">
              Class Timetables
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage academic schedules, weekly period grids, break timings, and teacher assignments.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTimetable(null);
            setHeaderForm({
              academicSession: '2026-2027',
              className: 'Class 1',
              section: 'A',
              board: 'CBSE',
              status: 'DRAFT',
            });
            setHeaderFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-[#001c46] hover:bg-navy-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#FFC907]" />
          <span>Create Timetable</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-[#001c46] uppercase tracking-wider border-b border-gray-100 pb-3">
          <Filter className="w-4 h-4 text-[#FFC907]" />
          <span>Filter Timetables</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Session */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Session</label>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="">All Sessions</option>
              {ACADEMIC_SESSION_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Board */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Board</label>
            <select
              value={filterBoard}
              onChange={(e) => setFilterBoard(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="">All Boards</option>
              {BOARD_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Timetables Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#001c46]" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading Timetables Directory...</p>
        </div>
      ) : filteredTimetables.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-2xs">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-[#001c46]">No timetable created yet.</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-6">
            Get started by creating a new timetable schedule for a class and section.
          </p>
          <button
            onClick={() => {
              setEditingTimetable(null);
              setIsCreateModalOpen(true);
            }}
            className="px-6 py-3 bg-[#001c46] hover:bg-navy-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#FFC907]" />
            <span>Create Timetable</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTimetables.map((tt) => (
            <div
              key={tt.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black px-2.5 py-1 bg-navy-50 text-[#001c46] rounded-lg uppercase tracking-wider">
                    {tt.academicSession}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      tt.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tt.status === 'ARCHIVED'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tt.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#001c46] tracking-tight group-hover:text-blue-900 transition-colors">
                  {tt.className} - Section {tt.section}
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-1">
                  Board: <span className="text-gray-800">{tt.board}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                  <span>Created by: {tt.createdBy || 'Admin'}</span>
                  <span>{new Date(tt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate(`/admin/timetable/${tt.id}`)}
                  className="flex-1 py-2.5 px-3 bg-[#001c46] hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#FFC907]" />
                  <span>View Schedule</span>
                </button>

                <button
                  onClick={() => {
                    setEditingTimetable(tt);
                    setHeaderForm({
                      academicSession: tt.academicSession,
                      className: tt.className,
                      section: tt.section,
                      board: tt.board,
                      status: tt.status,
                    });
                    setHeaderFormError(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Edit Info"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTimetable(tt.id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Timetable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT TIMETABLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-[#001c46]">
                {editingTimetable ? 'Edit Timetable Header' : 'Create Class Timetable'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="space-y-4 mt-4">
              {headerFormError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-semibold">
                  {headerFormError}
                </div>
              )}

              {/* Session */}
              <div>
                <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                  Academic Session
                </label>
                <select
                  value={headerForm.academicSession}
                  onChange={(e) => setHeaderForm((prev) => ({ ...prev, academicSession: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                >
                  {ACADEMIC_SESSION_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                    Class
                  </label>
                  <select
                    value={headerForm.className}
                    onChange={(e) => handleHeaderClassChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                    Section
                  </label>
                  <select
                    value={headerForm.section}
                    onChange={(e) => setHeaderForm((prev) => ({ ...prev, section: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                  >
                    {SECTION_OPTIONS.map((sec) => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Board */}
              <div>
                <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                  Board
                </label>
                <select
                  value={headerForm.board}
                  onChange={(e) => setHeaderForm((prev) => ({ ...prev, board: e.target.value as any }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                >
                  {getAllowedBoardsForClass(headerForm.className).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider mb-1">
                  Publish Status
                </label>
                <select
                  value={headerForm.status}
                  onChange={(e) => setHeaderForm((prev) => ({ ...prev, status: e.target.value as TimetableStatus }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-[#001c46]"
                >
                  <option value="DRAFT">DRAFT (Hidden from students & teachers)</option>
                  <option value="PUBLISHED">PUBLISHED (Active schedule)</option>
                  <option value="ARCHIVED">ARCHIVED (Past term record)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHeader}
                  className="px-5 py-2.5 bg-[#001c46] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-navy-800 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingHeader && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingTimetable ? 'Save Changes' : 'Create & Proceed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
