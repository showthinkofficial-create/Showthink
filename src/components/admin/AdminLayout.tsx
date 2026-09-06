import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigateHome: () => void;
  activeTitle?: string;
}

export default function AdminLayout({
  children,
  currentPath,
  onNavigate,
  onNavigateHome,
  activeTitle,
}: AdminLayoutProps) {
  const { logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-800 font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={logout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Column (offset by 64px / w-64 on lg screens) */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full transition-all">
        {/* Top Header Bar */}
        <AdminTopbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigateHome={onNavigateHome}
          activeTitle={activeTitle}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
