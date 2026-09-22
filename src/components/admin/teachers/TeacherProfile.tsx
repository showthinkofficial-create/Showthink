import React from 'react';
import {
  ArrowLeft,
  Edit3,
  UserX,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Clock,
  KeyRound,
  Trash2,
  Layers,
  Shield
} from 'lucide-react';
import { Teacher } from '../../../types/teacher';

interface TeacherProfileProps {
  teacher: Teacher;
  onBack: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
}

export default function TeacherProfile({
  teacher,
  onBack,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}: TeacherProfileProps) {
  const isActive = teacher.status === 'ACTIVE';
  const sections = teacher.assignedSections && teacher.assignedSections.length > 0
    ? teacher.assignedSections
    : ['A'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Back to teachers"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                {teacher.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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
            <p className="text-xs font-mono font-bold text-[#001c46] mt-0.5">
              Teacher ID: {teacher.teacherId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Back to List
          </button>

          <button
            onClick={onEdit}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span>Edit</span>
          </button>

          <button
            onClick={onResetPassword}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-700" />
            <span>Reset Password</span>
          </button>

          <button
            onClick={onToggleStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 border ${
              isActive
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            {isActive ? (
              <>
                <UserX className="w-3.5 h-3.5 text-amber-700" />
                <span>Disable Account</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Enable Account</span>
              </>
            )}
          </button>

          <button
            onClick={onDelete}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-700" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Card Profile */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#001c46] to-[#002a66] p-6 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {teacher.profilePhoto ? (
            <img
              src={teacher.profilePhoto}
              alt={teacher.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center font-black text-2xl uppercase shadow-md shrink-0">
              {teacher.name.charAt(0)}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1.5">
            <h2 className="text-xl font-black tracking-tight">{teacher.name}</h2>
            {teacher.qualification && (
              <p className="text-xs text-amber-300 font-bold flex items-center justify-center sm:justify-start gap-1">
                <GraduationCap className="w-4 h-4" />
                <span>{teacher.qualification}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-blue-100/90 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 opacity-75" />
                <span>{teacher.email}</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 opacity-75" />
                <span>{teacher.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#001c46] border-b border-gray-100 pb-2">
              Personal Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Teacher ID
                </span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {teacher.teacherId}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Full Name
                </span>
                <span className="font-bold text-gray-900">{teacher.name}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Email Address
                </span>
                <span className="font-medium text-gray-800">{teacher.email}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Primary Mobile Phone
                </span>
                <span className="font-mono font-bold text-gray-900">{teacher.phone}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Alternate Phone
                </span>
                <span className="font-mono text-gray-700">
                  {teacher.alternatePhone || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Residential Address
                </span>
                <span className="text-gray-800 font-medium leading-relaxed">
                  {teacher.address || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#001c46] border-b border-gray-100 pb-2">
              Professional Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Qualification
                </span>
                <span className="font-bold text-gray-900">
                  {teacher.qualification || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                  Subjects Taught
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    teacher.subjects.map((subj, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        <BookOpen className="w-3 h-3 text-amber-600" />
                        {subj}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">None assigned</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                  Assigned Classes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                    teacher.assignedClasses.map((cls, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {cls}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">None assigned</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                  Assigned Sections
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sections.map((sec) => (
                    <span
                      key={sec}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200"
                    >
                      Section {sec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                  Portal Access Role
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                  <Shield className="w-3 h-3 text-[#001c46]" />
                  <span>TEACHER (Firebase Auth / Teacher Portal)</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Joining Date
                </span>
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold mt-0.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isActive ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  {teacher.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-gray-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Created: {new Date(teacher.createdAt).toLocaleString('en-IN')}
          </span>
          <span>
            Last Updated: {new Date(teacher.updatedAt).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
