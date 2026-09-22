import React, { useState, useEffect } from 'react';
import { ExamResult } from '../../types/result';
import { resultService } from '../../services/resultService';
import { studentService } from '../../services/studentService';
import { Teacher } from '../../types/teacher';
import { Student } from '../../types/student';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  GraduationCap,
  Edit3,
  Save,
  ShieldAlert,
  Check,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Calendar,
  Layers,
  Users
} from 'lucide-react';

interface TeacherResultsViewProps {
  teacher: Teacher | null;
  assignedClasses: string[];
}

interface StudentMarkRow {
  studentUid: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  board: string;
  marksObtained: string;
  remarks: string;
}

export const TeacherResultsView: React.FC<TeacherResultsViewProps> = ({
  teacher,
  assignedClasses,
}) => {
  // Mode: 'entry' (Enter Marks) | 'analytics' (View & Analyze Results)
  const [activeSubMode, setActiveSubMode] = useState<'entry' | 'analytics'>('entry');

  // Loading & Feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- ENTRY MODE STATE ---
  const defaultClass = assignedClasses.length > 0 ? assignedClasses[0] : 'Class 10 - A';
  const parseClassSection = (str: string) => {
    if (str.includes('-')) {
      const parts = str.split('-');
      return { cls: parts[0].trim(), sec: parts[1].trim() };
    }
    return { cls: str.trim(), sec: 'A' };
  };

  const initialParsed = parseClassSection(defaultClass);
  const [entryClass, setEntryClass] = useState<string>(initialParsed.cls);
  const [entrySection, setEntrySection] = useState<string>(initialParsed.sec);
  const [entrySubject, setEntrySubject] = useState<string>(
    teacher?.subjects && teacher.subjects.length > 0 ? teacher.subjects[0] : 'Mathematics'
  );
  const [entryExam, setEntryExam] = useState<string>('Unit Test 1');
  const [customExam, setCustomExam] = useState<string>('');
  const [academicSession, setAcademicSession] = useState<string>('2025-2026');
  const [maxMarks, setMaxMarks] = useState<number>(50);
  const [evalDate, setEvalDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Students for Entry
  const [studentRows, setStudentRows] = useState<StudentMarkRow[]>([]);

  // --- ANALYTICS / VIEW MODE STATE ---
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterExam, setFilterExam] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch Existing Results for Analytics
  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await resultService.getExamResults();

      // Scoped only to teacher assigned classes
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

      setAllResults(scoped);
    } catch (err) {
      console.error('Error fetching exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [assignedClasses]);

  // 2. Load Students for Selected Class & Section in Entry Mode
  const loadStudentsForEntry = async () => {
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const allStudents = await studentService.getStudents();
      const filtered = allStudents.filter(
        (s) =>
          s.className.toLowerCase() === entryClass.toLowerCase() &&
          (s.section.toUpperCase() === entrySection.toUpperCase() || !s.section) &&
          s.status === 'ACTIVE'
      );

      // Sort by roll number or name
      filtered.sort((a, b) => {
        const rollA = parseInt(a.rollNumber || '0', 10);
        const rollB = parseInt(b.rollNumber || '0', 10);
        if (rollA && rollB) return rollA - rollB;
        return (a.name || '').localeCompare(b.name || '');
      });

      // Check if existing marks exist for this exam & subject
      const activeExamName = entryExam === 'CUSTOM' ? customExam : entryExam;
      const existingExamData = allResults.filter(
        (r) =>
          r.examName === activeExamName &&
          r.academicSession === academicSession &&
          r.className.toLowerCase() === entryClass.toLowerCase() &&
          r.section.toUpperCase() === entrySection.toUpperCase()
      );

      const rows: StudentMarkRow[] = filtered.map((st) => {
        // Find existing result for this student
        const matchedResult = existingExamData.find(
          (r) => r.studentUid === st.uid || r.studentId === st.studentId
        );
        let existingMark = '';
        let existingRemarks = '';

        if (matchedResult && matchedResult.subjects) {
          const subMatch = matchedResult.subjects.find(
            (s) => (s.subject || s.subjectName || '').toLowerCase() === entrySubject.toLowerCase()
          );
          if (subMatch && subMatch.marksObtained !== undefined) {
            existingMark = String(subMatch.marksObtained);
            existingRemarks = subMatch.remarks || '';
          }
        }

        return {
          studentUid: st.uid,
          studentId: st.studentId || st.uid,
          studentName: st.name,
          rollNumber: st.rollNumber || '—',
          className: st.className,
          section: st.section || entrySection,
          board: st.board || 'CBSE',
          marksObtained: existingMark,
          remarks: existingRemarks,
        };
      });

      setStudentRows(rows);
    } catch (err) {
      console.error('Error loading students for marks entry:', err);
      setErrorMessage('Failed to load students for the selected class.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubMode === 'entry') {
      loadStudentsForEntry();
    }
  }, [entryClass, entrySection, entrySubject, entryExam, customExam, academicSession, activeSubMode]);

  // Handle Mark Change for a row
  const handleMarkChange = (studentUid: string, val: string) => {
    setStudentRows((prev) =>
      prev.map((row) => (row.studentUid === studentUid ? { ...row, marksObtained: val } : row))
    );
  };

  // Handle Remarks Change
  const handleRemarksChange = (studentUid: string, val: string) => {
    setStudentRows((prev) =>
      prev.map((row) => (row.studentUid === studentUid ? { ...row, remarks: val } : row))
    );
  };

  // Bulk Actions
  const handleSetAllMarks = (score: number) => {
    setStudentRows((prev) =>
      prev.map((row) => ({ ...row, marksObtained: String(score) }))
    );
  };

  const handleClearAll = () => {
    setStudentRows((prev) =>
      prev.map((row) => ({ ...row, marksObtained: '', remarks: '' }))
    );
  };

  // Save Marks Submission
  const handleSaveMarks = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const activeExam = entryExam === 'CUSTOM' ? customExam.trim() : entryExam;
    if (!activeExam) {
      setErrorMessage('Please specify the Examination/Assessment name.');
      return;
    }

    if (!maxMarks || maxMarks <= 0) {
      setErrorMessage('Maximum marks must be greater than zero.');
      return;
    }

    // Verify authorized teacher class & subject
    const isAuthorizedClass = assignedClasses.some((c) =>
      c.toLowerCase().includes(entryClass.toLowerCase())
    );
    if (!isAuthorizedClass && assignedClasses.length > 0) {
      setErrorMessage(
        `Authorization Denied: You are not assigned to grade ${entryClass}. Only assigned faculty can submit marks.`
      );
      return;
    }

    const isAuthorizedSubject = teacher?.subjects?.some(
      (s) => s.toLowerCase() === entrySubject.toLowerCase()
    );
    if (!isAuthorizedSubject && teacher?.subjects && teacher.subjects.length > 0) {
      setErrorMessage(
        `Authorization Denied: You are not assigned to teach ${entrySubject}.`
      );
      return;
    }

    // Filter rows with entered marks
    const validRows = studentRows.filter((r) => r.marksObtained.trim() !== '');
    if (validRows.length === 0) {
      setErrorMessage('Please enter marks for at least one student before saving.');
      return;
    }

    // Check for marks > maxMarks
    for (const row of validRows) {
      const num = Number(row.marksObtained);
      if (isNaN(num) || num < 0 || num > maxMarks) {
        setErrorMessage(
          `Invalid marks for ${row.studentName}: marks must be between 0 and ${maxMarks}.`
        );
        return;
      }
    }

    setSaving(true);
    try {
      const batchEntries = validRows.map((r) => ({
        studentUid: r.studentUid,
        studentId: r.studentId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        className: entryClass,
        section: entrySection,
        board: r.board,
        marksObtained: Number(r.marksObtained),
        remarks: r.remarks,
      }));

      await resultService.saveSubjectMarksBatch(batchEntries, {
        examName: activeExam,
        academicSession,
        subject: entrySubject,
        maxMarks: Number(maxMarks),
        date: evalDate,
        teacherId: teacher?.teacherId || '',
        teacherUid: teacher?.uid || '',
        teacherName: teacher?.name || '',
      });

      setSuccessMessage(
        `Marks recorded successfully for ${validRows.length} students in ${entryClass} - ${entrySection} (${entrySubject})!`
      );
      await fetchResults();
    } catch (err: any) {
      console.error('Error saving subject marks batch:', err);
      setErrorMessage(err.message || 'Failed to record marks. Please verify network permissions.');
    } finally {
      setSaving(false);
    }
  };

  // Switch from Analytics view to edit an authorized result
  const handleEditResult = (r: ExamResult) => {
    // Check if authorized
    const isAuthClass = assignedClasses.some((ac) =>
      ac.toLowerCase().includes(r.className.toLowerCase())
    );
    const resultSubject = r.subject || (r.subjects && r.subjects[0]?.subject) || '';
    const isAuthSubject = teacher?.subjects?.some(
      (sub) => sub.toLowerCase() === resultSubject.toLowerCase()
    );

    if (!isAuthClass || !isAuthSubject) {
      setErrorMessage(
        'Access Denied: You cannot modify marks belonging to an unauthorized class or subject.'
      );
      return;
    }

    setEntryClass(r.className);
    setEntrySection(r.section || 'A');
    if (resultSubject) setEntrySubject(resultSubject);
    setEntryExam(r.examName);
    setAcademicSession(r.academicSession);
    setActiveSubMode('entry');
  };

  // --- ANALYTICS FILTERING ---
  const filteredResults = allResults.filter((r) => {
    if (filterClass !== 'ALL' && r.className !== filterClass) return false;
    if (filterSection !== 'ALL' && r.section !== filterSection) return false;
    const rSub = r.subject || (r.subjects && r.subjects[0]?.subject) || '';
    if (filterSubject !== 'ALL' && rSub !== filterSubject) return false;
    if (filterExam !== 'ALL' && r.examName !== filterExam) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        r.studentName.toLowerCase().includes(q) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
        (r.studentId && r.studentId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const stats = resultService.computeResultStats(filteredResults);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#001c46]">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-black">Academic Marks & Student Results</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Enter exam evaluations for assigned classes, subjects, and view performance metrics.
            </p>
          </div>

          {/* Sub-Mode Toggle Buttons */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveSubMode('entry')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all inline-flex items-center gap-2 ${
                activeSubMode === 'entry'
                  ? 'bg-[#001c46] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#FFC907]" />
              <span>Enter Marks</span>
            </button>

            <button
              onClick={() => setActiveSubMode('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all inline-flex items-center gap-2 ${
                activeSubMode === 'analytics'
                  ? 'bg-[#001c46] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>View Results & Analytics</span>
            </button>
          </div>
        </div>

        {/* Global Success / Error Alerts */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="flex-1">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-bold animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* ----------------- MODE 1: ENTER MARKS ----------------- */}
        {activeSubMode === 'entry' && (
          <div className="space-y-6">
            
            {/* Form Selection Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold">
              
              {/* Class & Section Selection */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">
                  Assigned Class & Section
                </label>
                <select
                  value={`${entryClass} - ${entrySection}`}
                  onChange={(e) => {
                    const parsed = parseClassSection(e.target.value);
                    setEntryClass(parsed.cls);
                    setEntrySection(parsed.sec);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                >
                  {assignedClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection (Restricted to Teacher's Assigned Subjects) */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">
                  Assigned Subject
                </label>
                <select
                  value={entrySubject}
                  onChange={(e) => setEntrySubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                >
                  {teacher?.subjects && teacher.subjects.length > 0 ? (
                    teacher.subjects.map((sub, i) => (
                      <option key={i} value={sub}>
                        {sub}
                      </option>
                    ))
                  ) : (
                    <option value="Mathematics">Mathematics</option>
                  )}
                </select>
              </div>

              {/* Exam Name */}
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">
                  Exam / Assessment
                </label>
                <select
                  value={entryExam}
                  onChange={(e) => setEntryExam(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                >
                  <option value="Unit Test 1">Unit Test 1</option>
                  <option value="Unit Test 2">Unit Test 2</option>
                  <option value="Periodic Assessment 1">Periodic Assessment 1</option>
                  <option value="Mid-Term Examination">Mid-Term Examination</option>
                  <option value="Quarterly Examination">Quarterly Examination</option>
                  <option value="Pre-Board Examination">Pre-Board Examination</option>
                  <option value="Annual Examination">Annual Examination</option>
                  <option value="CUSTOM">Other / Custom Name...</option>
                </select>
                {entryExam === 'CUSTOM' && (
                  <input
                    type="text"
                    placeholder="Enter assessment title..."
                    value={customExam}
                    onChange={(e) => setCustomExam(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                )}
              </div>

              {/* Academic Session, Max Marks & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider text-[10px]">Session</label>
                  <select
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2024-2025">2024-2025</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider text-[10px]">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Quick Bulk Actions Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#001c46] uppercase tracking-wider text-[11px]">
                  Enrolled Students ({studentRows.length})
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500 font-medium">
                  Maximum Evaluation: <strong className="text-gray-800">{maxMarks} Marks</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetAllMarks(maxMarks)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl font-bold border border-blue-200 transition-colors"
                >
                  Set All Full Marks
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={loadStudentsForEntry}
                  className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reload Student List"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Students Marks Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Loading roster for {entryClass} - {entrySection}...
                  </p>
                </div>
              ) : studentRows.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Users className="w-10 h-10 text-gray-300 mx-auto" />
                  <h4 className="text-sm font-black text-gray-800">No Enrolled Students</h4>
                  <p className="text-xs text-gray-500">
                    No active students found in {entryClass} - {entrySection}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#001c46] text-white font-black uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-16 text-center">Roll</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4 w-32">Admission ID</th>
                        <th className="py-3 px-4 w-36 text-center">Obtained Marks (/ {maxMarks})</th>
                        <th className="py-3 px-4 w-28 text-center">% Score</th>
                        <th className="py-3 px-4 w-24 text-center">Grade</th>
                        <th className="py-3 px-4 w-28 text-center">Evaluation</th>
                        <th className="py-3 px-4">Faculty Remarks (Optional)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {studentRows.map((row) => {
                        const marksNum = row.marksObtained.trim() !== '' ? Number(row.marksObtained) : null;
                        const pct = marksNum !== null && maxMarks > 0 ? Math.round((marksNum / maxMarks) * 1000) / 10 : null;
                        const isPassed = pct !== null ? pct >= 33 : null;
                        const grade = pct !== null ? resultService.calculateGrade(pct) : null;

                        return (
                          <tr key={row.studentUid} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 text-center font-mono font-bold text-gray-600">
                              {row.rollNumber}
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              {row.studentName}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-500">
                              {row.studentId}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max={maxMarks}
                                step="0.5"
                                placeholder={`0 - ${maxMarks}`}
                                value={row.marksObtained}
                                onChange={(e) => handleMarkChange(row.studentUid, e.target.value)}
                                className={`w-28 px-3 py-1.5 text-center font-mono font-black rounded-xl border outline-none transition-all ${
                                  marksNum !== null && (marksNum < 0 || marksNum > maxMarks)
                                    ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-300'
                                    : 'border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#001c46]'
                                }`}
                              />
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-[#001c46]">
                              {pct !== null ? `${pct}%` : '—'}
                            </td>
                            <td className="py-3 px-4 text-center font-black">
                              {grade ? (
                                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                                  {grade}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isPassed !== null ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {isPassed ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-red-600" />
                                  )}
                                  {isPassed ? 'PASSED' : 'FAILED'}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Pending</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="e.g. Good performance"
                                value={row.remarks}
                                onChange={(e) => handleRemarksChange(row.studentUid, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:bg-white focus:border-[#001c46]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>
                  All marks entered are tagged with your institutional Faculty ID (
                  <strong>{teacher?.teacherId || 'GP-FACULTY'}</strong>) and verified under institutional grading rules.
                </span>
              </div>

              <button
                type="button"
                disabled={saving || studentRows.length === 0}
                onClick={handleSaveMarks}
                className="w-full sm:w-auto px-8 py-3 bg-[#001c46] hover:bg-blue-900 disabled:bg-gray-300 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Marks...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#FFC907]" />
                    <span>Save & Record Subject Marks</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ----------------- MODE 2: ANALYTICS & RESULTS LIST ----------------- */}
        {activeSubMode === 'analytics' && (
          <div className="space-y-6">
            
            {/* Filter Bar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-bold">
              
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">Student Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Name or Roll..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">Class</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                >
                  <option value="ALL">All Classes</option>
                  {assignedClasses.map((cls, idx) => {
                    const parsed = parseClassSection(cls);
                    return (
                      <option key={idx} value={parsed.cls}>
                        {cls}
                      </option>
                    );
                  })}
                </select>
              </div>

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

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">Subject</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                >
                  <option value="ALL">All Subjects</option>
                  {teacher?.subjects?.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider text-[10px]">Exam Type</label>
                <select
                  value={filterExam}
                  onChange={(e) => setFilterExam(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
                >
                  <option value="ALL">All Exams</option>
                  <option value="Unit Test 1">Unit Test 1</option>
                  <option value="Unit Test 2">Unit Test 2</option>
                  <option value="Periodic Assessment 1">Periodic Assessment 1</option>
                  <option value="Mid-Term Examination">Mid-Term Examination</option>
                  <option value="Quarterly Examination">Quarterly Examination</option>
                  <option value="Annual Examination">Annual Examination</option>
                </select>
              </div>

            </div>

            {/* Analytics Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Appeared</span>
                <span className="text-xl font-black text-[#001c46]">{stats.studentsAppeared}</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
                <span className="text-emerald-700 font-bold block text-[10px] uppercase">Pass Percentage</span>
                <span className="text-xl font-black text-emerald-900">{stats.passPercentage}%</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
                <span className="text-blue-700 font-bold block text-[10px] uppercase">Class Average</span>
                <span className="text-xl font-black text-blue-900">{stats.averagePercentage}%</span>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 shadow-2xs space-y-1">
                <span className="text-purple-700 font-bold block text-[10px] uppercase">Highest Marks</span>
                <span className="text-xl font-black text-purple-900">{stats.highestPercentage}%</span>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Fetching academic result records...
                  </p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#001c46] text-white font-black uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Roll No</th>
                        <th className="py-3.5 px-4">Class & Sec</th>
                        <th className="py-3.5 px-4">Exam Name</th>
                        <th className="py-3.5 px-4">Subject</th>
                        <th className="py-3.5 px-4 text-center">Marks Obtained</th>
                        <th className="py-3.5 px-4 text-center">% Score</th>
                        <th className="py-3.5 px-4 text-center">Grade</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {filteredResults.map((r) => {
                        const pct = Number(r.percentage || 0);
                        const isPassed = r.status === 'PASSED' || r.resultStatus === 'PASSED' || pct >= 33;
                        const subjectDisplay = r.subject || (r.subjects && r.subjects[0]?.subject) || '—';
                        const marksDisplay =
                          r.totalMarksObtained !== undefined
                            ? `${r.totalMarksObtained} / ${r.totalMaxMarks || r.totalMax || 100}`
                            : r.totalObtained !== undefined
                            ? `${r.totalObtained} / ${r.totalMax || 100}`
                            : '—';

                        return (
                          <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-900">
                              {r.studentName}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-600">
                              {r.rollNumber || '—'}
                            </td>
                            <td className="py-3 px-4 text-gray-800 whitespace-nowrap">
                              {r.className} - {r.section}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {r.examName}
                            </td>
                            <td className="py-3 px-4 text-gray-800 font-bold">
                              {subjectDisplay}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-gray-900">
                              {marksDisplay}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-[#001c46]">
                              {pct}%
                            </td>
                            <td className="py-3 px-4 text-center font-black">
                              <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                                {r.grade || '—'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                                  isPassed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {isPassed ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-600" />
                                )}
                                {isPassed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleEditResult(r)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-[#001c46] hover:text-white rounded-lg text-gray-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                                title="Edit or update marks"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <Award className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-extrabold text-gray-800">No Exam Results Found</h3>
                  <p className="text-xs text-gray-500">
                    No result records match your selected class, section, subject, or search filter.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
