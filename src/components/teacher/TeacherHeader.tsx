import React from 'react';
import Logo from '../Logo';
import { LogOut, Home, ShieldCheck, User } from 'lucide-react';
import { Teacher } from '../../types/teacher';
import { UserProfile } from '../../types/auth';

interface TeacherHeaderProps {
  teacher: Teacher | null;
  userProfile: UserProfile | null;
  onNavigateHome: () => void;
  onLogout: () => void;
  onSelectTab: (tab: string) => void;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  teacher,
  userProfile,
  onNavigateHome,
  onLogout,
  onSelectTab,
}) => {
  const displayName = teacher?.name || userProfile?.displayName || 'Faculty Member';
  const teacherId = teacher?.teacherId || 'GP-T-FACULTY';

  return (
    <header className="bg-[#001c46] text-white shadow-md border-b border-[#1a325d] sticky top-0 z-30 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Logo size={40} className="bg-white/10 p-1 rounded-xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  GP ACADEMY
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFC907] text-[#001c46] uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  Faculty Workspace
                </span>
              </div>
              <p className="text-[11px] text-blue-200 font-medium">Teacher Academic Portal</p>
            </div>
          </div>

          {/* Right: Teacher Credentials & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Profile Brief Badge */}
            <button
              onClick={() => onSelectTab('profile')}
              className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left border border-white/10"
              title="View Profile"
            >
              {teacher?.profilePhoto ? (
                <img
                  src={teacher.profilePhoto}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#FFC907]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FFC907] text-[#001c46] flex items-center justify-center font-black text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs">
                <p className="font-bold text-white line-clamp-1">{displayName}</p>
                <p className="text-[10px] text-blue-200 font-mono">{teacherId}</p>
              </div>
            </button>

            {/* Public Site Button */}
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-100 hover:text-white px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              title="Return to GP Academy Public Site"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
              title="Logout from Faculty Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
