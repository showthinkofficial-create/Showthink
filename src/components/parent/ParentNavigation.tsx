import React from 'react';
import { ParentTab } from '../../types/parent';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Award,
  CreditCard,
  Calendar,
  Bell,
  Image,
  User,
} from 'lucide-react';

interface ParentNavigationProps {
  activeTab: ParentTab;
  onTabChange: (tab: ParentTab) => void;
  noticesCount?: number;
}

interface NavItem {
  id: ParentTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const ParentNavigation: React.FC<ParentNavigationProps> = ({
  activeTab,
  onTabChange,
  noticesCount = 0,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'children', label: 'My Children', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'fees', label: 'Fees & Receipts', icon: CreditCard },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'notices', label: 'Notices', icon: Bell, badge: noticesCount },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  // Mobile navigation subset
  const mobileNavItems: { id: ParentTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-2xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'fees' && activeTab === 'receipts');

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                      : 'text-gray-600 hover:text-[#001c46] hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFC907]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                        isActive
                          ? 'bg-[#FFC907] text-[#001c46]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/90 py-1.5 px-2 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] rounded-t-2xl">
        <div className="flex justify-around items-center">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'fees' && activeTab === 'receipts') ||
              (item.id === 'dashboard' && activeTab === 'timetable') ||
              (item.id === 'children' && activeTab === 'results');

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-[#001c46] font-black' : 'text-gray-400 hover:text-gray-600 font-semibold'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-all ${
                    isActive ? 'bg-[#001c46] text-[#FFC907]' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
