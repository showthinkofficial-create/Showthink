import React, { useState, useEffect } from 'react';
import { ExamResult } from '../../types/result';
import { resultService } from '../../services/resultService';
import { Teacher } from '../../types/teacher';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

interface TeacherResultsViewProps {
  teacher: Teacher | null;
  assignedClasses: string[];
}

export const TeacherResultsView: React.FC<TeacherResultsViewProps> = ({
  teacher,
  assignedClasses,
}) => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterExam, setFilterExam] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await resultService.getExamResults();

      // Filter by teacher assigned classes
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

      setResults(scoped);
    } catch (err) {
      console.error('Error fetching exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filter items in memory
  const filteredResults = results.filter((r) => {
    if (filterClass !== 'ALL' && r.className !== filterClass) return false;
    if (filterSection !== 'ALL' && r.section.toUpperCase() !== filterSection) return false;
    if (filterSubject !== 'ALL' && r.subject.toLowerCase() !== filterSubject.toLowerCase()) return false;
    if (filterExam !== 'ALL' && r.examName.toLowerCase() !== filterExam.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        (r.rollNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate metrics for filtered set
  const stats = resultService.computeResultStats(filteredResults);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <Award className="w-6 h-6 text-[#FFC907]" />
              <h2 className="text-xl font-black">Student Academic Results</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Read-only performance analytics and exam marks for students in your assigned classes.
            </p>
          </div>

          <span className="px-3.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full font-bold text-xs">
            Faculty Read-Only Portal
          </span>
        </div>

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
              {assignedClasses.map((cls, idx) => (
                <option key={idx} value={cls.includes('-') ? cls.split('-')[0].trim() : cls}>
                  {cls}
                </option>
              ))}
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
              <option value="Mid-Term Examination">Mid-Term Examination</option>
              <option value="Annual Examination">Annual Examination</option>
              <option value="Unit Test 1">Unit Test 1</option>
              <option value="Unit Test 2">Unit Test 2</option>
            </select>
          </div>

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
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fetching published result records...</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredResults.map((r) => {
                  const pct = Number(r.percentage || 0);
                  const isPassed = r.status === 'PASSED' || pct >= 33;
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
                        {r.subject}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-gray-900">
                        {r.marksObtained} / {r.totalMarks}
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
                          {isPassed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                          {isPassed ? 'PASSED' : 'FAILED'}
                        </span>
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
  );
};
