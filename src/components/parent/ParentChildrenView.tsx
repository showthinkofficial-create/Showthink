import React from 'react';
import { Student } from '../../types/student';
import {
  Users,
  User,
  GraduationCap,
  Calendar,
  Phone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Hash,
  Award,
} from 'lucide-react';

interface ParentChildrenViewProps {
  childrenList: Student[];
  selectedChild: Student | null;
  onSelectChild: (child: Student) => void;
}

export const ParentChildrenView: React.FC<ParentChildrenViewProps> = ({
  childrenList,
  selectedChild,
  onSelectChild,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Linked Children Profiles</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Official academic enrollment records for your linked child / children at GP Academy.
          </p>
        </div>

        <div className="text-xs bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-gray-600 font-semibold self-start sm:self-auto">
          Total Linked: <span className="font-bold text-[#001c46]">{childrenList.length} Student(s)</span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-blue-50 border border-blue-200/80 p-3.5 sm:p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold block">Official Academic Record View:</span>
          Parent/guardian can view verified academic information. Modifications to roll numbers, class transfers, or personal details must be submitted to the School Administration Office.
        </div>
      </div>

      {/* Children Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {childrenList.map((child) => {
          const isSelected = selectedChild?.uid === child.uid;
          const isDisabled = child.status === 'DISABLED';

          return (
            <div
              key={child.uid}
              className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs relative ${
                isSelected
                  ? 'border-[#001c46] ring-2 ring-[#001c46]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Top Card Accent */}
              <div
                className={`h-2.5 ${
                  isDisabled
                    ? 'bg-red-500'
                    : isSelected
                    ? 'bg-[#001c46]'
                    : 'bg-gray-200'
                }`}
              />

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Profile Header Row */}
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {child.profilePhoto ? (
                      <img
                        src={child.profilePhoto}
                        alt={child.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-gray-100 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#001c46] text-[#FFC907] font-black text-lg sm:text-xl flex items-center justify-center shrink-0 shadow-xs">
                        {child.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">
                          {child.name}
                        </h3>
                        {isSelected && (
                          <span className="text-[10px] bg-[#FFC907] text-[#001c46] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-500 block mt-0.5">
                        ID: {child.studentId}
                      </span>
                    </div>
                  </div>

                  {/* Account Status Badge */}
                  <div>
                    {isDisabled ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Inactive</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enrolled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Inactive Notice if disabled */}
                {isDisabled && (
                  <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 font-medium">
                    This student account is currently inactive. Please contact school administration.
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-gray-50/80 p-3 sm:p-4 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Class & Section</span>
                    <span className="font-black text-gray-900">
                      {child.className} — Section {child.section}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Roll Number</span>
                    <span className="font-black text-gray-900">
                      {child.rollNumber || 'Not Assigned'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Academic Board</span>
                    <span className="font-black text-gray-900">
                      {child.board || 'CBSE'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-bold block text-[10px] uppercase">Admission Date</span>
                    <span className="font-black text-gray-900">
                      {child.admissionDate || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectChild(child)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#001c46] text-[#FFC907] shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isSelected ? '✓ Currently Selected for Monitoring' : 'Select This Child'}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
