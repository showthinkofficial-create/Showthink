import React from 'react';
import {
  LayoutDashboard,
  User,
  Users,
  CheckSquare,
  History,
  Award,
  Calendar,
  Bell,
  Image as ImageIcon
} from 'lucide-react';

export type TeacherTab =
  | 'dashboard'
  | 'profile'
  | 'classes'
  | 'attendance'
  | 'attendance-history'
  | 'results'
  | 'timetable'
  | 'notices'
  | 'gallery';

interface TeacherNavigationProps {
  activeTab: TeacherTab;
  onSelectTab: (tab: TeacherTab) => void;
}

export const TeacherNavigation: React.FC<TeacherNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: { id: TeacherTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'classes', label: 'My Classes', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Mark Attendance', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'attendance-history', label: 'Attendance History', icon: <History className="w-4 h-4" /> },
    { id: 'results', label: 'Student Results', icon: <Award className="w-4 h-4" /> },
    { id: 'timetable', label: 'My Timetable', icon: <Calendar className="w-4 h-4" /> },
    { id: 'notices', label: 'Notice Board', icon: <Bell className="w-4 h-4" /> },
    { id: 'gallery', label: 'School Gallery', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-xs sticky top-[61px] z-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                    : 'text-gray-600 hover:text-[#001c46] hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
