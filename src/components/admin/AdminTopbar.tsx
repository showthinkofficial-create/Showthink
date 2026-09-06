import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, User as UserIcon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

interface AdminTopbarProps {
  onToggleMobileSidebar: () => void;
  onNavigateHome: () => void;
  activeTitle?: string;
}

export default function AdminTopbar({
  onToggleMobileSidebar,
  onNavigateHome,
  activeTitle = 'GP Academy Admin Panel',
}: AdminTopbarProps) {
  const { userProfile, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const roleLabel =
    userProfile?.role === 'SUPER_ADMIN'
      ? 'SUPER ADMIN'
      : userProfile?.role === 'ADMIN'
      ? 'ADMIN'
      : userProfile?.role || 'ADMIN';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200/80 shadow-xs px-4 sm:px-6 py-3.5 flex items-center justify-between font-sans">
      {/* Left: Mobile Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#001c46] hover:bg-gray-100 transition-colors"
          aria-label="Toggle Sidebar Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-black text-[#001c46] tracking-tight leading-none">
            GP Academy Admin Panel
          </h1>
          {activeTitle && (
            <p className="text-[11px] font-bold text-gray-500 mt-0.5 hidden sm:block">
              {activeTitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Notifications, User Profile Badge & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Public Website Button */}
        <button
          onClick={onNavigateHome}
          className="hidden md:inline-flex text-xs font-bold text-gray-600 hover:text-[#001c46] px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
        >
          Public Site
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-gray-500 hover:text-[#001c46] hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* User Profile Dropdown / Badge */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-xl bg-[#001c46] text-[#FFC907] font-black text-xs flex items-center justify-center shadow-xs">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>

            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-gray-900 block leading-tight">
                {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Administrator'}
              </span>
              <span className="text-[10px] font-extrabold text-[#001c46] bg-[#FFC907] px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5">
                {roleLabel}
              </span>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-20 font-sans space-y-1">
                <div className="px-4 py-2.5 border-b border-gray-100 space-y-1.5">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{userProfile?.displayName || 'Administrator'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{userProfile?.email}</p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#001c46] bg-[#FFC907] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      {roleLabel}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      userProfile?.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${userProfile?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      Status: {userProfile?.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigateHome();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Return to GP Academy Website
                </button>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
