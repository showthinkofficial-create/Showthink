import React, { useState } from 'react';
import { Student } from '../../types/student';
import { Teacher } from '../../types/teacher';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Phone,
  User,
  ShieldCheck,
  Calendar,
  X,
  Eye,
  BookOpen
} from 'lucide-react';

interface TeacherStudentsViewProps {
  teacher: Teacher | null;
  classSummaries: {
    className: string;
    section: string;
    subjects: string[];
    students: Student[];
  }[];
  loading?: boolean;
}

export const TeacherStudentsView: React.FC<TeacherStudentsViewProps> = ({
  teacher,
  classSummaries,
  loading = false,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalStudent, setActiveModalStudent] = useState<Student | null>(null);

  // Flatten all students from assigned class summaries
  const allAssignedStudents: { student: Student; subjects: string[] }[] = [];
  classSummaries.forEach((summary) => {
    summary.students.forEach((st) => {
      // Prevent duplicates if a student is listed in multiple summaries
      if (!allAssignedStudents.some((item) => item.student.uid === st.uid)) {
        allAssignedStudents.push({ student: st, subjects: summary.subjects });
      }
    });
  });

  // Filter students
  const filteredStudents = allAssignedStudents.filter(({ student }) => {
    const classSectionKey = `${student.className} - ${student.section}`;
    if (selectedClassFilter !== 'ALL' && classSectionKey !== selectedClassFilter && student.className !== selectedClassFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        student.name.toLowerCase().includes(q) ||
        (student.studentId && student.studentId.toLowerCase().includes(q)) ||
        (student.rollNumber && student.rollNumber.toLowerCase().includes(q)) ||
        (student.parentName && student.parentName.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Sort by roll number or name
  filteredStudents.sort((a, b) => {
    const rollA = parseInt(a.student.rollNumber || '0', 10);
    const rollB = parseInt(b.student.rollNumber || '0', 10);
    if (rollA && rollB) return rollA - rollB;
    return a.student.name.localeCompare(b.student.name);
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <Users className="w-6 h-6 text-[#FFC907]" />
              <h2 className="text-xl font-black">My Assigned Students Roster</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Verified student enrollments across your authorized faculty classes and teaching sections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-black text-xs">
              {filteredStudents.length} Active Students
            </span>
          </div>
        </div>

        {/* Search & Class Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          
          <div className="sm:col-span-2 space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, admission ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">
              Assigned Class / Section
            </label>
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#001c46] outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Assigned Classes ({classSummaries.length})</option>
                {classSummaries.map((s, idx) => (
                  <option key={idx} value={`${s.className} - ${s.section}`}>
                    {s.className} - {s.section} ({s.students.length} students)
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Main Student List Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Loading student roster from database...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-gray-800">No Students Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No students match the selected class or search filter. Only students in your assigned classes are displayed.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#001c46] text-white font-black uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 w-16 text-center">Roll</th>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Class & Section</th>
                    <th className="py-3.5 px-4">Parent / Guardian</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredStudents.map(({ student, subjects }) => (
                    <tr key={student.uid} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-black text-gray-700">
                        {student.rollNumber || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.profilePhoto ? (
                            <img
                              src={student.profilePhoto}
                              alt={student.name}
                              className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#001c46] font-black flex items-center justify-center text-sm shadow-2xs">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-gray-900 block text-xs">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium block">
                              Board: {student.board || 'CBSE'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-bold whitespace-nowrap">
                        {student.className} - {student.section}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {student.parentName || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {student.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {student.phone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveModalStudent(student)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-[#001c46] hover:text-white rounded-xl text-gray-700 font-bold text-[11px] transition-all inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="block md:hidden divide-y divide-gray-100 p-3 space-y-3">
              {filteredStudents.map(({ student }) => (
                <div
                  key={student.uid}
                  className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#001c46] font-black flex items-center justify-center text-sm shadow-2xs">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{student.name}</h4>
                        <p className="text-[11px] text-gray-500 font-mono">
                          ID: {student.studentId} | Roll: {student.rollNumber || '—'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {student.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Class</span>
                      <span className="font-bold text-gray-800">
                        {student.className} - {student.section}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Board</span>
                      <span className="font-bold text-gray-800">{student.board || 'CBSE'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Guardian</span>
                      <span className="font-bold text-gray-800 truncate block">
                        {student.parentName || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Phone</span>
                      <span className="font-mono text-gray-800">{student.phone || '—'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalStudent(student)}
                    className="w-full py-2 bg-white hover:bg-[#001c46] hover:text-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Student Profile</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Student Details Modal */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl border border-gray-100 animate-scaleIn">
            
            <button
              onClick={() => setActiveModalStudent(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {activeModalStudent.profilePhoto ? (
                <img
                  src={activeModalStudent.profilePhoto}
                  alt={activeModalStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#001c46] shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#001c46] text-[#FFC907] font-black flex items-center justify-center text-2xl shadow-sm">
                  {activeModalStudent.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#001c46]">
                    {activeModalStudent.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 font-mono font-bold">
                  Admission ID: {activeModalStudent.studentId}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  Active Enrolled Student
                </div>
              </div>
            </div>

            {/* Academic & Personal Detail Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Class & Section</span>
                <p className="font-black text-gray-900">
                  {activeModalStudent.className} - {activeModalStudent.section}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Roll Number</span>
                <p className="font-mono font-black text-gray-900">
                  {activeModalStudent.rollNumber || 'Not Assigned'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Educational Board</span>
                <p className="font-black text-gray-900">
                  {activeModalStudent.board || 'CBSE'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Admission Date</span>
                <p className="font-medium text-gray-800">
                  {activeModalStudent.admissionDate || 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-0.5 col-span-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Parent / Guardian Name</span>
                <p className="font-bold text-gray-900">
                  {activeModalStudent.parentName || 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-0.5 col-span-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Emergency Contact</span>
                <p className="font-mono font-bold text-gray-900">
                  {activeModalStudent.phone || 'N/A'}
                  {activeModalStudent.alternatePhone && ` / ${activeModalStudent.alternatePhone}`}
                </p>
              </div>
            </div>

            {/* Privacy Compliance Footer Notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
              <strong>Institutional Privacy:</strong> Financial fee histories and authentication credentials are restricted to school administrators and guardians.
            </div>

            <button
              type="button"
              onClick={() => setActiveModalStudent(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
            >
              Close Roster View
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
