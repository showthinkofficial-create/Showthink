import React from 'react';
import { Teacher } from '../../types/teacher';
import { UserProfile } from '../../types/auth';
import {
  User,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface TeacherProfileViewProps {
  teacher: Teacher | null;
  userProfile: UserProfile | null;
}

export const TeacherProfileView: React.FC<TeacherProfileViewProps> = ({ teacher, userProfile }) => {
  const displayName = teacher?.name || userProfile?.displayName || 'Faculty Member';
  const teacherId = teacher?.teacherId || 'GP-T-FACULTY';
  const email = teacher?.email || userProfile?.email || 'N/A';
  const phone = teacher?.phone || 'N/A';
  const alternatePhone = teacher?.alternatePhone || 'N/A';
  const qualification = teacher?.qualification || 'Not specified';
  const subjects = teacher?.subjects || [];
  const assignedClasses = teacher?.assignedClasses || [];
  const joiningDate = teacher?.joiningDate || 'N/A';
  const address = teacher?.address || 'Not specified';

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Read-only Information Header Notice */}
      <div className="bg-blue-50 border border-blue-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3 text-blue-900 text-xs">
        <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-blue-950">Faculty Information Authorization Policy</p>
          <p className="text-blue-800 leading-relaxed">
            Faculty credentials, qualification levels, subject assignments, and assigned classes are managed strictly by GP Academy School Administration. Teacher accounts cannot self-modify academic roles or permissions.
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Card Header Cover */}
        <div className="bg-gradient-to-r from-[#001c46] via-[#1a325d] to-[#001c46] p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
            {teacher?.profilePhoto ? (
              <img
                src={teacher.profilePhoto}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#FFC907] shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FFC907] text-[#001c46] flex items-center justify-center text-4xl font-black shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left space-y-1.5 flex-grow">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC907] text-[#001c46] text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Teacher Account
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h2>
              <p className="text-xs text-blue-200 font-mono font-bold">Institutional Faculty ID: {teacherId}</p>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Section 1: Academic Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Academic & Teaching Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Assigned Subjects</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.length > 0 ? (
                    subjects.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg font-bold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">None assigned</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Assigned Classes</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {assignedClasses.length > 0 ? (
                    assignedClasses.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-bold">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">None assigned</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <GraduationCap className="w-4 h-4 text-[#001c46]" />
                  <span>Highest Qualification</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{qualification}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Date of Joining</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{joiningDate}</p>
              </div>

            </div>
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Contact & Institutional Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email Address</span>
                </div>
                <p className="font-bold text-gray-900">{email}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Phone Number</span>
                </div>
                <p className="font-bold text-gray-900">{phone} {alternatePhone !== 'N/A' && ` / ${alternatePhone}`}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Residential Address</span>
                </div>
                <p className="font-bold text-gray-900">{address}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Firebase Auth UID</span>
                </div>
                <p className="font-mono text-gray-600 text-[11px] break-all">{userProfile?.uid}</p>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
