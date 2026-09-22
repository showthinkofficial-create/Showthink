import React from 'react';
import {
  Eye,
  Edit3,
  UserX,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  GraduationCap,
  KeyRound,
  Trash2,
  Calendar
} from 'lucide-react';
import { Teacher } from '../../../types/teacher';

interface TeacherTableProps {
  teachers: Teacher[];
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onToggleStatus: (teacher: Teacher) => void;
  onResetPassword: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export default function TeacherTable({
  teachers,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: TeacherTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
            <th className="py-3.5 px-4">Teacher</th>
            <th className="py-3.5 px-4">Teacher ID</th>
            <th className="py-3.5 px-4">Email</th>
            <th className="py-3.5 px-4">Subjects</th>
            <th className="py-3.5 px-4">Classes</th>
            <th className="py-3.5 px-4">Section</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Created Date</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
          {teachers.map((teacher) => {
            const isActive = teacher.status === 'ACTIVE';
            const sections = teacher.assignedSections && teacher.assignedSections.length > 0
              ? teacher.assignedSections
              : ['A'];

            return (
              <tr key={teacher.uid} className="hover:bg-gray-50/60 transition-colors">
                {/* Name & Avatar */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    {teacher.profilePhoto ? (
                      <img
                        src={teacher.profilePhoto}
                        alt={teacher.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#001c46]/10 text-[#001c46] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{teacher.name}</div>
                      {teacher.qualification && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-amber-600" />
                          <span>{teacher.qualification}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Teacher ID */}
                <td className="py-3.5 px-4 font-mono font-bold text-[#001c46]">
                  {teacher.teacherId}
                </td>

                {/* Email */}
                <td className="py-3.5 px-4 text-gray-600 truncate max-w-[170px]" title={teacher.email}>
                  {teacher.email}
                </td>

                {/* Subjects */}
                <td className="py-3.5 px-4 max-w-[170px]">
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.slice(0, 2).map((subj, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60"
                      >
                        <BookOpen className="w-2.5 h-2.5 text-amber-600" />
                        {subj}
                      </span>
                    ))}
                    {teacher.subjects.length > 2 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-gray-100 text-gray-600">
                        +{teacher.subjects.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Assigned Classes */}
                <td className="py-3.5 px-4 max-w-[150px]">
                  <div className="flex flex-wrap gap-1">
                    {teacher.assignedClasses.slice(0, 2).map((cls, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60"
                      >
                        {cls}
                      </span>
                    ))}
                    {teacher.assignedClasses.length > 2 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-gray-100 text-gray-600">
                        +{teacher.assignedClasses.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Section */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {sections.map((sec) => (
                      <span
                        key={sec}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200"
                      >
                        Sec {sec}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                    }`}
                  >
                    {isActive ? (
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                    )}
                    {teacher.status}
                  </span>
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                  {teacher.createdAt
                    ? new Date(teacher.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : teacher.joiningDate
                    ? new Date(teacher.joiningDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '—'}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View */}
                    <button
                      onClick={() => onView(teacher)}
                      className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="View Teacher Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(teacher)}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Teacher Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={() => onResetPassword(teacher)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Reset Password (Dispatch Email)"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>

                    {/* Disable / Enable Toggle */}
                    <button
                      onClick={() => onToggleStatus(teacher)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isActive ? 'Disable Teacher' : 'Enable Teacher'}
                    >
                      {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(teacher)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

