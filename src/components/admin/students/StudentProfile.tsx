import React from 'react';
import {
  ArrowLeft,
  Edit3,
  UserX,
  UserCheck,
  User,
  Phone,
  Building,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { Student } from '../../../types/student';

interface StudentProfileProps {
  student: Student;
  onEdit: () => void;
  onDisable: () => void;
  onBack: () => void;
  onManagePortalAccess?: () => void;
}

export default function StudentProfile({
  student,
  onEdit,
  onDisable,
  onBack,
  onManagePortalAccess,
}: StudentProfileProps) {
  const isActive = student.status === 'ACTIVE';
  const hasPortalAccess = Boolean(student.authUid && student.authUid.trim() !== '');

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Back to Students List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#001c46] text-[#FFC907] font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              {student.profilePhoto ? (
                <img
                  src={student.profilePhoto}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                student.name.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#001c46] tracking-tight">{student.name}</h2>
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
              </div>
              <p className="text-xs font-mono font-bold text-gray-500 mt-0.5">
                Student ID: <span className="text-[#001c46] font-black">{student.studentId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Student</span>
          </button>

          <button
            onClick={onDisable}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              isActive
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            {isActive ? (
              <>
                <UserX className="w-4 h-4" />
                <span>Disable Student</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Enable Student</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Student Information */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 md:col-span-2">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-[#001c46]">
            <User className="w-4 h-4 text-[#FFC907]" />
            <h3 className="text-sm font-black uppercase tracking-wider">Student Information</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Student ID</span>
              <span className="font-mono font-black text-[#001c46] text-sm">{student.studentId}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</span>
              <span className="font-extrabold text-gray-900">{student.name}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Enrolled Class</span>
              <span className="font-extrabold text-gray-800">{student.className}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Section</span>
              <span className="font-extrabold text-gray-800">{student.section || 'A'}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Roll Number</span>
              <span className="font-mono font-bold text-gray-800">{student.rollNumber || 'Not assigned'}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Academic Board</span>
              <span className="font-black text-blue-700">{student.board}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date of Birth</span>
              <span className="font-medium text-gray-800">{student.dateOfBirth || 'Not provided'}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Admission Date</span>
              <span className="font-medium text-gray-800">{student.admissionDate || 'Not provided'}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email</span>
              <span className="font-medium text-gray-800 truncate block">{student.email || 'None'}</span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
              <span className={`font-black ${isActive ? 'text-emerald-700' : 'text-rose-700'}`}>{student.status}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Parent Information */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-[#001c46]">
            <Phone className="w-4 h-4 text-[#FFC907]" />
            <h3 className="text-sm font-black uppercase tracking-wider">Parent & Contact Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Parent / Guardian Name</span>
              <span className="font-extrabold text-gray-900 text-sm">{student.parentName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Primary Phone</span>
                <span className="font-mono font-bold text-[#001c46] text-sm">+91 {student.phone}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Alternate Phone</span>
                <span className="font-mono text-gray-700">{student.alternatePhone ? `+91 ${student.alternatePhone}` : 'None'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Residential Address</span>
              <p className="font-medium text-gray-800 leading-relaxed mt-0.5">{student.address || 'Address not provided'}</p>
            </div>
          </div>
        </div>

        {/* Section 3: Academic Information */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-[#001c46]">
            <Building className="w-4 h-4 text-[#FFC907]" />
            <h3 className="text-sm font-black uppercase tracking-wider">Academic Background</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Previous School</span>
              <span className="font-bold text-gray-800 block text-sm mt-0.5">{student.previousSchool || 'First time enrollment / No record'}</span>
            </div>

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-gray-400 block font-bold">Record Created</span>
                <span className="font-mono text-gray-600">{new Date(student.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-bold">Last Updated</span>
                <span className="font-mono text-gray-600">{new Date(student.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Student & Parent Portal Login Access */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 md:col-span-2">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#001c46]">
              <KeyRound className="w-4 h-4 text-[#FFC907]" />
              <h3 className="text-sm font-black uppercase tracking-wider">Portal Login & Parent Access</h3>
            </div>
            {hasPortalAccess ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Account Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>No Portal Account Linked</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900">
                {hasPortalAccess
                  ? 'This student is linked to an active parent/student portal login.'
                  : 'Grant online portal login access to student or parents.'}
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {hasPortalAccess
                  ? 'The linked guardian can log in to view real-time attendance, test marks, daily homework, notices, and payment receipts.'
                  : 'Create a secured credential via Admin Panel → Portal Users to allow parents to track attendance, exams, fees, and homework.'}
              </p>
              {hasPortalAccess && student.authUid && (
                <p className="text-[10px] font-mono text-gray-400 mt-1">
                  Auth UID: <span className="text-gray-600">{student.authUid}</span>
                </p>
              )}
            </div>

            {onManagePortalAccess && (
              <button
                type="button"
                onClick={onManagePortalAccess}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#001c46] hover:bg-[#002d6b] text-[#FFC907] text-xs font-extrabold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{hasPortalAccess ? 'Manage Portal Access' : 'Create Portal Access'}</span>
                <ExternalLink className="w-3 h-3 text-white/60 ml-0.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Back Button Footer */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-extrabold text-xs border border-gray-300 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </button>
      </div>
    </div>
  );
}
