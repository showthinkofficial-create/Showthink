import React from 'react';
import { Eye, Edit3, UserX, UserCheck, Phone, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Student } from '../../../types/student';

interface StudentCardProps {
  student: Student;
  onView: (uid: string) => void;
  onEdit: (uid: string) => void;
  onDisable: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onView,
  onEdit,
  onDisable,
}) => {
  const isActive = student.status === 'ACTIVE';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-3 font-sans">
      {/* Header: Photo, Name, ID & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#001c46] text-[#FFC907] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
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
            <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
              {student.name}
            </h4>
            <span className="text-[11px] font-mono font-bold text-[#001c46] bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
              {student.studentId}
            </span>
          </div>
        </div>

        <div>
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
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-gray-50/80 rounded-xl text-xs">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Class & Sec
          </span>
          <span className="font-extrabold text-gray-800">
            {student.className} ({student.section || 'A'})
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Roll Number
          </span>
          <span className="font-mono font-extrabold text-gray-800">
            {student.rollNumber || '-'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Board
          </span>
          <span className="font-bold text-[#001c46]">
            {student.board}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Parent Name
          </span>
          <span className="font-semibold text-gray-800 truncate block">
            {student.parentName}
          </span>
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono font-bold text-gray-800">{student.phone}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(student.uid)}
            className="p-1.5 text-gray-600 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(student.uid)}
            className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Profile"
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
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-emerald-700 hover:bg-white'
              }`}
              title={isActive ? 'Student is currently Enabled' : 'Click to Enable student account'}
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
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-0.5 transition-all cursor-pointer ${
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
      </div>
    </div>
  );
};

export default StudentCard;
