import React from 'react';
import Logo from '../Logo';
import { LogOut, Globe, User, ShieldCheck } from 'lucide-react';
import { Student } from '../../types/student';

interface StudentHeaderProps {
  student: Student | null;
  email: string;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  student,
  email,
  onNavigateHome,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Portal Tag */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
            <Logo size={40} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#001c46] tracking-tight">GP ACADEMY</h1>
                <span className="px-2 py-0.5 bg-[#001c46] text-[#FFC907] text-[10px] font-black rounded-md uppercase tracking-wider">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Official Student Workspace</p>
            </div>
          </div>
        </div>

        {/* User Info Badge & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {student && (
            <div className="flex items-center gap-2.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/80">
              {student.profilePhoto ? (
                <img
                  src={student.profilePhoto}
                  alt={student.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#001c46] text-[#FFC907] font-black text-xs flex items-center justify-center">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden md:block">
                <div className="text-xs font-black text-gray-900 leading-tight flex items-center gap-1">
                  <span>{student.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                </div>
                <div className="text-[10px] text-gray-500 font-semibold">
                  {student.className} - {student.section} | ID: {student.studentId}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#001c46] px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
              title="Return to Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden xs:inline">Website</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
