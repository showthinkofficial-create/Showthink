import React from 'react';
import {
  User,
  ShieldCheck,
  Calendar,
  Phone,
  Home,
  BookOpen,
  Mail,
  Award,
  Lock,
  Info
} from 'lucide-react';
import { Student } from '../../types/student';

interface StudentProfileViewProps {
  student: Student;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        {/* Photo */}
        <div className="relative shrink-0">
          {student.profilePhoto ? (
            <img
              src={student.profilePhoto}
              alt={student.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#001c46] shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#001c46] text-[#FFC907] font-black text-3xl sm:text-4xl flex items-center justify-center border-2 border-[#001c46] shadow-md">
              {student.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-600 text-white rounded-full shadow-xs" title="Active Verified Profile">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>

        {/* Basic Info */}
        <div className="text-center md:text-left space-y-2 flex-1 w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-black text-gray-900">{student.name}</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase">
              {student.status}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-600">
            Student ID: <span className="font-bold text-[#001c46]">{student.studentId}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-1 text-xs font-semibold text-gray-500">
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg">
              Class: {student.className} ({student.section})
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg">
              Roll No: {student.rollNumber || 'N/A'}
            </span>
            <span className="px-3 py-1 bg-[#001c46]/10 text-[#001c46] rounded-lg">
              Board: {student.board}
            </span>
          </div>
        </div>

        {/* Read only info box */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 w-full md:max-w-xs shrink-0">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-900">Read-Only Profile</span>
            Academic records and student profiles can only be updated by GP Academy Administration.
          </div>
        </div>
      </div>

      {/* Grid of Profile Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Academic Details */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#001c46] pb-3 border-b border-gray-100">
            <BookOpen className="w-5 h-5 text-[#FFC907]" />
            <h2 className="font-black text-base">Academic Details</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Student ID</span>
              <span className="font-black text-gray-900 text-right">{student.studentId}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Class Name</span>
              <span className="font-black text-gray-900 text-right">{student.className}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Section</span>
              <span className="font-black text-gray-900 text-right">{student.section}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Roll Number</span>
              <span className="font-black text-gray-900 text-right">{student.rollNumber || 'Not Assigned'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Education Board</span>
              <span className="font-black text-gray-900 text-right">{student.board}</span>
            </div>

            <div className="flex justify-between items-center py-2 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Admission Date</span>
              <span className="font-black text-gray-900 text-right">{student.admissionDate || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Personal & Parent Details */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#001c46] pb-3 border-b border-gray-100">
            <User className="w-5 h-5 text-[#FFC907]" />
            <h2 className="font-black text-base">Personal & Parent Information</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Parent/Guardian Name</span>
              <span className="font-black text-gray-900 text-right">{student.parentName}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Primary Contact Phone</span>
              <span className="font-black text-gray-900 text-right">{student.phone}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Alternate Phone</span>
              <span className="font-black text-gray-900 text-right">{student.alternatePhone || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Date of Birth</span>
              <span className="font-black text-gray-900 text-right">{student.dateOfBirth || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Student Email</span>
              <span className="font-black text-gray-900 truncate max-w-[140px] sm:max-w-[200px] text-right">{student.email || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-start py-2 gap-2">
              <span className="text-gray-500 font-medium shrink-0">Residential Address</span>
              <span className="font-black text-gray-900 text-right max-w-[160px] sm:max-w-[220px] break-words">{student.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
