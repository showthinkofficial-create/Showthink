import React from 'react';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Award,
  CreditCard,
  Clock,
  Bell,
  Image as ImageIcon
} from 'lucide-react';

export type StudentTab =
  | 'dashboard'
  | 'profile'
  | 'attendance'
  | 'results'
  | 'fees'
  | 'timetable'
  | 'notices'
  | 'gallery';

interface StudentNavigationProps {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
}

export const StudentNavigation: React.FC<StudentNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const desktopTabs: { id: StudentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'results', label: 'Results', icon: <Award className="w-4 h-4" /> },
    { id: 'fees', label: 'Fees', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'timetable', label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
    { id: 'notices', label: 'Notices', icon: <Bell className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const mobileTabs: { id: StudentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'results', label: 'Results', icon: <Award className="w-5 h-5" /> },
    { id: 'fees', label: 'Fees', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Horizontal Navigation Bar */}
      <div className="bg-[#001c46] text-white shadow-md hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
            {desktopTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FFC907] text-[#001c46] shadow-xs'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-45 bg-white border-t border-gray-200 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex justify-around items-center px-1 py-2">
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#001c46] font-black scale-105'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <div className={isActive ? 'text-[#001c46]' : 'text-gray-400'}>
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
