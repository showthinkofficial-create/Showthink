import React from 'react';
import { Eye, Edit3, UserX, UserCheck, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Student } from '../../../types/student';

interface StudentTableProps {
  students: Student[];
  onView: (uid: string) => void;
  onEdit: (uid: string) => void;
  onDisable: (student: Student) => void;
}

export default function StudentTable({
  students,
  onView,
  onEdit,
  onDisable,
}: StudentTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-2xs font-sans">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50/90 text-[#001c46] uppercase font-black tracking-wider border-b border-gray-200">
          <tr>
            <th className="px-4 py-3.5">Student ID</th>
            <th className="px-4 py-3.5">Student Name</th>
            <th className="px-4 py-3.5">Class</th>
            <th className="px-4 py-3.5">Sec</th>
            <th className="px-4 py-3.5">Roll No</th>
            <th className="px-4 py-3.5">Parent Name</th>
            <th className="px-4 py-3.5">Phone</th>
            <th className="px-4 py-3.5">Board</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
          {students.map((student) => {
            const isActive = student.status === 'ACTIVE';

            return (
              <tr
                key={student.uid}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                {/* Student ID */}
                <td className="px-4 py-3 font-mono font-extrabold text-[#001c46]">
                  {student.studentId}
                </td>

                {/* Student Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#001c46] text-[#FFC907] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={student.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        student.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-gray-900 block leading-tight group-hover:text-[#001c46]">
                        {student.name}
                      </span>
                      {student.email && (
                        <span className="text-[10px] text-gray-400 block truncate max-w-[140px]">
                          {student.email}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Class */}
                <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">
                  {student.className}
                </td>

                {/* Section */}
                <td className="px-4 py-3 font-bold text-gray-800">
                  {student.section || 'A'}
                </td>

                {/* Roll Number */}
                <td className="px-4 py-3 font-mono text-gray-600">
                  {student.rollNumber || '-'}
                </td>

                {/* Parent Name */}
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {student.parentName}
                </td>

                {/* Phone */}
                <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">
                  {student.phone}
                </td>

                {/* Board */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      student.board === 'CBSE'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {student.board}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <ShieldCheck className="w-3 h-3" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80">
                      <ShieldAlert className="w-3 h-3" />
                      <span>DISABLED</span>
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => onView(student.uid)}
                      className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="View Student Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEdit(student.uid)}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Student Information"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Dual Option: Enabled & Disabled Segmented Selector */}
                    <div className="inline-flex items-center p-0.5 bg-gray-100/90 rounded-xl border border-gray-200 shadow-2xs">
                      {/* Enabled Option Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isActive) onDisable(student);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-gray-500 hover:text-emerald-700 hover:bg-white'
                        }`}
                        title={isActive ? 'Student is currently Enabled / Active' : 'Click to Enable student account'}
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Enabled</span>
                      </button>

                      {/* Disabled Option Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isActive) onDisable(student);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                          !isActive
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-gray-500 hover:text-rose-700 hover:bg-white'
                        }`}
                        title={!isActive ? 'Student is currently Disabled' : 'Click to Disable student account'}
                      >
                        <UserX className="w-3 h-3" />
                        <span>Disabled</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
