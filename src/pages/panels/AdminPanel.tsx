import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from '../admin/AdminDashboard';
import AdminSubpage from '../admin/AdminSubpage';
import PortalUsersManager from '../admin/PortalUsersManager';
import StudentsManager from '../admin/StudentsManager';
import TeachersManager from '../admin/TeachersManager';
import AttendanceManager from '../admin/AttendanceManager';
import FeesManager from '../admin/FeesManager';
import TimetableManager from '../admin/TimetableManager';
import NoticesManager from '../admin/NoticesManager';
import AdmissionsManager from '../admin/AdmissionsManager';
import GalleryManager from '../admin/GalleryManager';
import ReportsAnalytics from '../admin/ReportsAnalytics';
import SchoolSettingsManager from '../admin/SchoolSettingsManager';

interface AdminPanelProps {
  onNavigateHome?: () => void;
}

export default function AdminPanel({ onNavigateHome }: AdminPanelProps) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const initial = window.location.pathname.toLowerCase().replace(/\/$/, '');
    return initial.startsWith('/admin') ? initial : '/admin';
  });

  // Keep state in sync with window location changes / popstate events
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path.startsWith('/admin')) {
        setCurrentPath(path === '/admin' ? '/admin' : path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Extract section key from path (e.g. /admin/students -> students)
  const getSectionKey = (path: string): string => {
    const cleanPath = path.replace(/\/$/, '');
    if (cleanPath === '/admin' || cleanPath === '') {
      return 'dashboard';
    }
    const parts = cleanPath.split('/admin/');
    return parts[1] ? parts[1].split('/')[0] : 'dashboard';
  };

  const sectionKey = getSectionKey(currentPath);

  // Section titles for Topbar
  const sectionTitles: Record<string, string> = {
    dashboard: 'Management Dashboard',
    'portal-users': 'Portal User Management',
    students: 'Student Directory',
    teachers: 'Faculty Directory',
    attendance: 'Attendance Records',
    results: 'Examination & Results',
    homework: 'Homework & Assignments',
    fees: 'Fee Collection Ledger',
    timetable: 'Class Timetables',
    notices: 'Notice Board',
    admissions: 'Admission Applications',
    gallery: 'Media Gallery',
    reports: 'Institutional Reports',
    settings: 'System Configuration',
  };

  const activeTitle = sectionTitles[sectionKey] || 'GP Academy Admin Panel';

  return (
    <AdminLayout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onNavigateHome={handleHomeClick}
      activeTitle={activeTitle}
    >
      {sectionKey === 'dashboard' ? (
        <AdminDashboard onNavigate={handleNavigate} />
      ) : sectionKey === 'portal-users' ? (
        <PortalUsersManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'students' ? (
        <StudentsManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'teachers' ? (
        <TeachersManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'attendance' ? (
        <AttendanceManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'fees' ? (
        <FeesManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'timetable' ? (
        <TimetableManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'notices' ? (
        <NoticesManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'admissions' ? (
        <AdmissionsManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'gallery' ? (
        <GalleryManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : sectionKey === 'reports' ? (
        <ReportsAnalytics />
      ) : sectionKey === 'settings' ? (
        <SchoolSettingsManager currentPath={currentPath} onNavigate={handleNavigate} />
      ) : (
        <AdminSubpage sectionKey={sectionKey} />
      )}
    </AdminLayout>
  );
}
