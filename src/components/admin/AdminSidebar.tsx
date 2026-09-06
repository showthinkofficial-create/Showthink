import React from 'react';
import Logo from '../Logo';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  Award,
  BookOpen,
  CreditCard,
  Clock,
  Megaphone,
  UserPlus,
  Image,
  BarChart3,
  Settings,
  KeyRound,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';

export interface AdminNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { id: 'portal-users', label: 'Portal Users', path: '/admin/portal-users', icon: KeyRound },
  { id: 'students', label: 'Students', path: '/admin/students', icon: Users },
  { id: 'teachers', label: 'Teachers', path: '/admin/teachers', icon: UserCheck },
  { id: 'attendance', label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
  { id: 'results', label: 'Results', path: '/admin/results', icon: Award },
  { id: 'homework', label: 'Homework', path: '/admin/homework', icon: BookOpen },
  { id: 'fees', label: 'Fees', path: '/admin/fees', icon: CreditCard },
  { id: 'timetable', label: 'Timetable', path: '/admin/timetable', icon: Clock },
  { id: 'notices', label: 'Notices', path: '/admin/notices', icon: Megaphone },
  { id: 'admissions', label: 'Admissions', path: '/admin/admissions', icon: UserPlus },
  { id: 'gallery', label: 'Gallery', path: '/admin/gallery', icon: Image },
  { id: 'reports', label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  currentPath,
  onNavigate,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#001c46] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl border-r border-white/10 font-sans`}
      >
        {/* Top Header & Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Logo size={40} className="shrink-0 group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-sans font-black text-white text-base tracking-wide block leading-tight">
                GP ACADEMY
              </span>
              <span className="text-[10px] font-bold text-[#FFC907] uppercase tracking-widest block">
                Admin Control
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            // Exact match for dashboard or subpath match for subroutes
            const isActive =
              item.path === '/admin'
                ? currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard'
                : currentPath.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC907] text-[#001c46] shadow-md font-extrabold'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#001c46]' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#001c46]" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Footer & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#001535]">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
