import React from 'react';
import Logo from '../Logo';
import { ParentProfile } from '../../types/parent';
import { Student } from '../../types/student';
import { ParentChildSelector } from './ParentChildSelector';
import { LogOut, Home, UserCheck, Shield, ChevronRight } from 'lucide-react';

interface ParentHeaderProps {
  parentProfile: ParentProfile | null;
  email: string;
  childrenList: Student[];
  selectedChild: Student | null;
  onSelectChild: (child: Student) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const ParentHeader: React.FC<ParentHeaderProps> = ({
  parentProfile,
  email,
  childrenList,
  selectedChild,
  onSelectChild,
  onNavigateHome,
  onLogout,
}) => {
  const displayName = parentProfile?.name || email.split('@')[0] || 'Parent / Guardian';

  return (
    <header className="bg-white border-b border-gray-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity & Portal Tag */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
              title="Return to GP Academy Home"
            >
              <Logo size={42} className="group-hover:scale-105 transition-transform" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-[#001c46] tracking-tight">
                    GP ACADEMY
                  </span>
                  <span className="bg-[#001c46] text-[#FFC907] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
                    Combined Portal
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block truncate">
                  Student & Parent Portal
                </span>
              </div>
            </button>
          </div>

          {/* Center / Right: Child Selector & Parent Profile */}
          <div className="flex items-center gap-3">
            {/* Child Selector */}
            {childrenList.length > 0 && (
              <ParentChildSelector
                childrenList={childrenList}
                selectedChild={selectedChild}
                onSelectChild={onSelectChild}
              />
            )}

            {/* Parent Info & Actions */}
            <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-gray-200">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-black text-gray-900 truncate max-w-[140px]">
                    {displayName}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 block truncate max-w-[140px]">
                  {email}
                </span>
              </div>
            </div>

            {/* Home Link */}
            <button
              type="button"
              onClick={onNavigateHome}
              className="p-2 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-all cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-bold"
              title="Return to Public Website"
            >
              <Home className="w-4 h-4" />
              <span className="hidden xl:inline">School Site</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-xl font-bold text-xs transition-all border border-red-200/70 cursor-pointer"
              title="Sign Out of Portal"
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
