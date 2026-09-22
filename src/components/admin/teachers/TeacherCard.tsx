import React from 'react';
import {
  Eye,
  Edit3,
  UserX,
  UserCheck,
  Phone,
  Mail,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { Teacher } from '../../../types/teacher';

interface TeacherCardProps {
  teacher: Teacher;
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onToggleStatus: (teacher: Teacher) => void;
  onResetPassword: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}) => {
  const isActive = teacher.status === 'ACTIVE';
  const sections = teacher.assignedSections && teacher.assignedSections.length > 0
    ? teacher.assignedSections
    : ['A'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-3.5">
      {/* Header: Avatar, Name, ID & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {teacher.profilePhoto ? (
            <img
              src={teacher.profilePhoto}
              alt={teacher.name}
              className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#001c46]/10 text-[#001c46] flex items-center justify-center font-bold text-sm uppercase shrink-0">
              {teacher.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{teacher.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-bold text-[#001c46]">
                {teacher.teacherId}
              </span>
              {teacher.qualification && (
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                  {teacher.qualification}
                </span>
              )}
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {isActive ? (
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-3 h-3 text-rose-600" />
          )}
          {teacher.status}
        </span>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 gap-1.5 text-xs text-gray-600 bg-gray-50/70 rounded-xl p-2.5 border border-gray-100">
        <div className="flex items-center gap-2 truncate">
          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{teacher.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-mono">{teacher.phone}</span>
        </div>
      </div>

      {/* Subjects, Classes & Section */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
            Subjects Taught
          </span>
          <div className="flex flex-wrap gap-1">
            {teacher.subjects.map((subj, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70"
              >
                <BookOpen className="w-2.5 h-2.5 text-amber-600" />
                {subj}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
              Assigned Classes
            </span>
            <div className="flex flex-wrap gap-1">
              {teacher.assignedClasses.map((cls, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/70"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
              Section
            </span>
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
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-1.5">
        <button
          onClick={() => onView(teacher)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
        <button
          onClick={() => onEdit(teacher)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onResetPassword(teacher)}
          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-colors cursor-pointer"
          title="Reset Password"
        >
          <KeyRound className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onToggleStatus(teacher)}
          className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${
            isActive
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
          }`}
          title={isActive ? 'Disable Teacher' : 'Enable Teacher'}
        >
          {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => onDelete(teacher)}
          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          title="Delete Teacher"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TeacherCard;

