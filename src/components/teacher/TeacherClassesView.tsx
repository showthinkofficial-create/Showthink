import React, { useState } from 'react';
import { Teacher } from '../../types/teacher';
import { Student } from '../../types/student';
import {
  Users,
  GraduationCap,
  BookOpen,
  Search,
  X,
  Phone,
  User,
  CheckCircle2,
  ListFilter
} from 'lucide-react';

interface ClassSummaryItem {
  className: string;
  section: string;
  subjects: string[];
  students: Student[];
}

interface TeacherClassesViewProps {
  teacher: Teacher | null;
  classSummaries: ClassSummaryItem[];
  loading: boolean;
}

export const TeacherClassesView: React.FC<TeacherClassesViewProps> = ({
  teacher,
  classSummaries,
  loading,
}) => {
  const [selectedClassItem, setSelectedClassItem] = useState<ClassSummaryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Assigned Class Records...</p>
      </div>
    );
  }

  const filteredStudents = (selectedClassItem?.students || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.parentName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Title Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#001c46]">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black">My Assigned Classes</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Overview of academic sections and enrolled students assigned to your teaching workload.
          </p>
        </div>

        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 font-bold text-xs">
          Total Assigned: {classSummaries.length} Sections
        </div>
      </div>

      {/* Class Cards Grid */}
      {classSummaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classSummaries.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#001c46] text-[#FFC907] font-black text-xs uppercase tracking-wider">
                    {item.className}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                    Sec {item.section}
                  </span>
                </div>

                {/* Main Stats */}
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Enrolled Students
                    </span>
                    <span className="font-extrabold text-gray-900 text-sm">{item.students.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                    <span className="text-gray-500 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      Taught Subject(s)
                    </span>
                    <span className="font-bold text-[#001c46] truncate max-w-[150px]">
                      {item.subjects.join(', ') || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedClassItem(item);
                  setSearchQuery('');
                }}
                className="w-full py-2.5 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all inline-flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>View Student Roll</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-extrabold text-gray-800">No Classes Assigned</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            You do not currently have explicit class sections linked in your faculty profile. Please contact the administration department to configure your class schedule.
          </p>
        </div>
      )}

      {/* Student List Modal */}
      {selectedClassItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
            
            {/* Modal Header */}
            <div className="bg-[#001c46] text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  Student Roll — {selectedClassItem.className} (Sec {selectedClassItem.section})
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Total {selectedClassItem.students.length} Registered Students
                </p>
              </div>
              <button
                onClick={() => setSelectedClassItem(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name, roll number, ID, or parent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#001c46] outline-none"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-500 hover:text-gray-900 font-bold px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Modal Student Table */}
            <div className="p-6 overflow-y-auto flex-grow space-y-3">
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-black uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Parent / Guardian</th>
                        <th className="py-2.5 px-3">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {filteredStudents.map((std) => (
                        <tr key={std.uid} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#001c46]">
                            {std.rollNumber || '—'}
                          </td>
                          <td className="py-3 px-3 font-bold text-gray-900">
                            {std.name}
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                            {std.studentId}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            {std.parentName}
                          </td>
                          <td className="py-3 px-3 text-gray-700 font-mono flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            {std.phone}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-xs italic">
                  No students matching your search query.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
              <button
                onClick={() => setSelectedClassItem(null)}
                className="px-5 py-2 bg-[#001c46] text-white text-xs font-bold rounded-xl hover:bg-[#1a325d] transition-all"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
