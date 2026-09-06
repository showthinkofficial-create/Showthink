import React from 'react';
import { ParentProfile } from '../../types/parent';
import { Student } from '../../types/student';
import {
  User,
  Mail,
  Phone,
  Shield,
  Users,
  CheckCircle2,
  Lock,
  Building,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ParentProfileViewProps {
  parentProfile: ParentProfile | null;
  email: string;
  childrenList: Student[];
}

export const ParentProfileView: React.FC<ParentProfileViewProps> = ({
  parentProfile,
  email,
  childrenList,
}) => {
  const name = parentProfile?.name || 'Parent / Guardian';
  const phone = parentProfile?.phone || '9818776563';
  const status = parentProfile?.status || 'ACTIVE';

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Guardian Account Profile</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Registered guardian credentials and institutional authorization mapping.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Status: {status}</span>
        </div>
      </div>

      {/* Role & Security Restriction Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          <span className="font-bold block text-amber-950">Security & Authorization Policy:</span>
          Parent/Guardian credentials are authenticated via verified institutional records. System role, permissions, and linked student identifiers cannot be altered online. To update linked phone numbers or register additional siblings, please contact the GP Academy Administration Office.
        </div>
      </div>

      {/* Parent Information Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
        <h3 className="text-xs font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#001c46]" />
          <span>Guardian Identity Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Parent / Guardian Name
            </span>
            <span className="text-sm font-black text-gray-900 block">{name}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Assigned Role
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#001c46]">PARENT</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-bold text-gray-900 truncate">{email || parentProfile?.email}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Contact Phone Number
            </span>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-bold text-gray-900">{phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Children Roster */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#001c46]" />
            <h3 className="text-xs font-black text-[#001c46] uppercase tracking-wider">
              Linked Children & Institutional IDs ({childrenList.length})
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-semibold">
            Institutional Roster
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {childrenList.map((child) => (
            <div
              key={child.uid}
              className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#001c46] text-[#FFC907] font-black text-sm flex items-center justify-center shrink-0">
                  {child.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-900 truncate">
                    {child.name}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-medium block">
                    ID: <span className="font-bold text-gray-700">{child.studentId}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-200 text-gray-600 font-medium">
                <div>
                  <span className="text-gray-400 block text-[10px]">Class & Sec</span>
                  <span className="font-bold text-gray-800">{child.className} - {child.section}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Roll No</span>
                  <span className="font-bold text-gray-800">{child.rollNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
