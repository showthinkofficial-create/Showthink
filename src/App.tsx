import React, { useState, useEffect } from 'react';
import { ActivePage } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApplyModal from './components/ApplyModal';

// Auth Context & Guards
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Auth & Panel Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminPanel from './pages/panels/AdminPanel';
import TeacherPanel from './pages/panels/TeacherPanel';
import PortalPanel from './pages/panels/PortalPanel';
import StudentPanel from './pages/panels/StudentPanel';
import { ParentPanel } from './pages/panels/ParentPanel';

// Public Website Page Imports
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import Facilities from './pages/Facilities';
import Gallery from './pages/Gallery';
import NewsEvents from './pages/NewsEvents';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Blog from './pages/Blog';
import { updatePageSEO } from './components/common/SEOHead';

// Lucide Icons
import { Home as HomeIcon, Phone, GraduationCap, MapPin, MessageSquare, AlertCircle, LogIn, Bot, Sparkles } from 'lucide-react';
import { SCHOOL_DETAILS } from './data/content';
import AIChatbotModal from './components/common/AIChatbotModal';

function MainApp() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync state with browser path location on init & popstate
  useEffect(() => {
    const handleLocationSync = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');

      if (mode === 'resetPassword' || oobCode || path === '/reset-password') {
        setActivePage('reset-password');
      } else if (path === '/admin/login') {
        setActivePage('admin-login');
      } else if (path === '/teacher/login') {
        setActivePage('teacher-login');
      } else if (path === '/login' || path === '/portal/login') {
        setActivePage('login');
      } else if (path === '/forgot-password') {
        setActivePage('forgot-password');
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        setActivePage('admin');
      } else if (path === '/teacher' || path.startsWith('/teacher/')) {
        setActivePage('teacher');
      } else if (path === '/portal' || path.startsWith('/portal/')) {
        setActivePage('portal');
      } else if (path === '/student' || path.startsWith('/student/')) {
        setActivePage('portal');
      } else if (path === '/parent' || path.startsWith('/parent/')) {
        setActivePage('portal');
      }
    };

    handleLocationSync();
    window.addEventListener('popstate', handleLocationSync);
    return () => window.removeEventListener('popstate', handleLocationSync);
  }, []);

  // Update SEO Title, Meta tags, Robots, OpenGraph, Canonical, and Schema.org on page change
  useEffect(() => {
    const pageToPathMap: Record<ActivePage, string> = {
      home: '/',
      about: '/about',
      academics: '/academics',
      admissions: '/admissions',
      facilities: '/facilities',
      gallery: '/gallery',
      news: '/notices',
      contact: '/contact',
      legal: '/legal',
      blog: '/blog',
      login: '/portal/login',
      'admin-login': '/admin/login',
      'teacher-login': '/teacher/login',
      'forgot-password': '/forgot-password',
      'reset-password': '/reset-password',
      admin: '/admin',
      teacher: '/teacher',
      portal: '/portal',
      student: '/portal',
      parent: '/portal'
    };
    const path = pageToPathMap[activePage] || '/';
    updatePageSEO(path);
  }, [activePage]);

  // Update browser URL on page change if appropriate
  const handlePageChange = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const routeMap: Partial<Record<ActivePage, string>> = {
      login: '/portal/login',
      'admin-login': '/admin/login',
      'teacher-login': '/teacher/login',
      'forgot-password': '/forgot-password',
      'reset-password': '/reset-password',
      admin: '/admin',
      teacher: '/teacher/dashboard',
      portal: '/portal/dashboard',
      student: '/portal/dashboard',
      parent: '/portal/dashboard',
      home: '/',
    };

    const targetUrl = routeMap[page];
    if (targetUrl && window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  // Auto-open admission enquiry modal popup after 2 seconds on initial website visit
  useEffect(() => {
    const popupTimer = setTimeout(() => {
      if (
        activePage !== 'login' &&
        activePage !== 'admin-login' &&
        activePage !== 'teacher-login' &&
        activePage !== 'forgot-password' &&
        activePage !== 'reset-password' &&
        activePage !== 'admin' &&
        activePage !== 'teacher' &&
        activePage !== 'student' &&
        activePage !== 'parent' &&
        activePage !== 'portal'
      ) {
        setIsApplyModalOpen(true);
      }
    }, 2000);

    return () => clearTimeout(popupTimer);
  }, []);

  // Full screen standalone views for Login & Protected Role Panels
  if (activePage === 'admin-login') {
    return (
      <Login
        portalType="admin"
        isAdminMode={true}
        onNavigateToForgotPassword={() => {
          const target = '/forgot-password?role=admin';
          window.history.pushState({}, '', target);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        onNavigateHome={() => handlePageChange('home')}
        onLoginSuccess={(role) => {
          if (role === 'SUPER_ADMIN' || role === 'ADMIN') handlePageChange('admin');
          else handlePageChange('home');
        }}
      />
    );
  }

  if (activePage === 'teacher-login') {
    return (
      <Login
        portalType="teacher"
        onNavigateToForgotPassword={() => {
          const target = '/forgot-password?role=teacher';
          window.history.pushState({}, '', target);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        onNavigateHome={() => handlePageChange('home')}
        onLoginSuccess={(role) => {
          if (role === 'TEACHER') handlePageChange('teacher');
          else if (role === 'SUPER_ADMIN' || role === 'ADMIN') handlePageChange('admin');
          else handlePageChange('home');
        }}
      />
    );
  }

  if (activePage === 'login') {
    return (
      <Login
        portalType="portal"
        onNavigateToForgotPassword={() => handlePageChange('forgot-password')}
        onNavigateHome={() => handlePageChange('home')}
        onLoginSuccess={(role) => {
          if (role === 'SUPER_ADMIN' || role === 'ADMIN') handlePageChange('admin');
          else if (role === 'TEACHER') handlePageChange('teacher');
          else if (role === 'PORTAL_USER' || role === 'STUDENT' || role === 'PARENT') handlePageChange('portal');
          else handlePageChange('home');
        }}
      />
    );
  }

  if (activePage === 'forgot-password') {
    return (
      <ForgotPassword
        onNavigateToLogin={() => {
          const searchParams = new URLSearchParams(window.location.search);
          const role = searchParams.get('role');
          if (role === 'admin') handlePageChange('admin-login');
          else if (role === 'teacher') handlePageChange('teacher-login');
          else handlePageChange('login');
        }}
        onNavigateHome={() => handlePageChange('home')}
      />
    );
  }

  if (activePage === 'reset-password') {
    return (
      <ResetPassword
        onNavigateToLogin={() => handlePageChange('admin-login')}
        onNavigateHome={() => handlePageChange('home')}
        onNavigateToForgotPassword={() => handlePageChange('forgot-password')}
      />
    );
  }

  if (activePage === 'admin') {
    return (
      <ProtectedRoute onNavigateToLogin={() => handlePageChange('admin-login')}>
        <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']} onNavigateToPanel={(r) => handlePageChange(r.toLowerCase() as ActivePage)}>
          <AdminPanel onNavigateHome={() => handlePageChange('home')} />
        </RoleGuard>
      </ProtectedRoute>
    );
  }

  if (activePage === 'teacher') {
    return (
      <ProtectedRoute onNavigateToLogin={() => handlePageChange('teacher-login')}>
        <RoleGuard allowedRoles={['TEACHER']} onNavigateToPanel={(r) => handlePageChange(r.toLowerCase() as ActivePage)}>
          <TeacherPanel onNavigateHome={() => handlePageChange('home')} />
        </RoleGuard>
      </ProtectedRoute>
    );
  }

  if (activePage === 'portal' || activePage === 'student' || activePage === 'parent') {
    return (
      <ProtectedRoute onNavigateToLogin={() => handlePageChange('login')}>
        <RoleGuard allowedRoles={['PORTAL_USER', 'STUDENT', 'PARENT', 'ADMIN', 'SUPER_ADMIN']} onNavigateToPanel={(r) => handlePageChange(r.toLowerCase() as ActivePage)}>
          <PortalPanel onNavigateHome={() => handlePageChange('home')} />
        </RoleGuard>
      </ProtectedRoute>
    );
  }

  // Public Website View
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={handlePageChange} onOpenApplyModal={() => setIsApplyModalOpen(true)} />;
      case 'about':
        return <AboutUs />;
      case 'academics':
        return <Academics />;
      case 'admissions':
        return <Admissions />;
      case 'facilities':
        return <Facilities />;
      case 'gallery':
        return <Gallery />;
      case 'news':
        return <NewsEvents />;
      case 'contact':
        return <Contact />;
      case 'legal':
        return <Legal />;
      case 'blog':
        return <Blog setActivePage={handlePageChange} onOpenApplyModal={() => setIsApplyModalOpen(true)} />;
      default:
        return (
          <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6 animate-fadeIn font-sans">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-3xl font-black text-[#001c46]">Page Not Found</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We couldn't locate the regulatory department or visual module you are trying to open.
            </p>
            <button
              onClick={() => handlePageChange('home')}
              className="bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all inline-block"
            >
              Back To Home Portal
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans select-none selection:bg-[#FFC907]/30 selection:text-[#001c46]">
      {/* Navigation bar */}
      <Navbar activePage={activePage} setActivePage={handlePageChange} onOpenApplyModal={() => setIsApplyModalOpen(true)} />

      {/* Main Content Wrapper */}
      <main className="flex-grow pt-0">
        <div className="mx-auto">
          {renderPage()}
        </div>
      </main>

      {/* Global Footer */}
      <Footer setActivePage={handlePageChange} />

      {/* Sticky Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-100 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] rounded-t-2xl">
        <button
          onClick={() => handlePageChange('home')}
          className={`flex flex-col items-center justify-center transition-all ${
            activePage === 'home' ? 'text-[#001c46] scale-105' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Home</span>
        </button>

        <a
          href={`tel:${SCHOOL_DETAILS.phone}`}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-700 transition-all"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Call</span>
        </a>

        <button
          onClick={() => handlePageChange('login')}
          title="Portal Login"
          aria-label="Portal Login"
          className={`flex flex-col items-center justify-center bg-[#001c46] hover:bg-[#002866] text-[#FFC907] w-14 h-14 rounded-full -mt-7 border-4 border-white shadow-lg active:scale-95 transition-all cursor-pointer ${
            activePage === 'login' || activePage === 'portal' || activePage === 'teacher' || activePage === 'admin'
              ? 'ring-2 ring-[#FFC907] scale-105'
              : ''
          }`}
        >
          <LogIn className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-tight text-white mt-0.5 leading-none">Portal</span>
        </button>

        <button
          onClick={() => setIsChatbotOpen(true)}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            isChatbotOpen ? 'text-[#001c46] scale-105 font-black' : 'text-gray-400 hover:text-gray-700'
          }`}
          title="GP Shiksha AI Assistant"
          aria-label="AI Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#001c46]" />
            <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC907] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC907]"></span>
            </span>
          </div>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-[#001c46]">AI Chat</span>
        </button>

        <button
          onClick={() => handlePageChange('contact')}
          className={`flex flex-col items-center justify-center transition-all ${
            activePage === 'contact' ? 'text-[#001c46] scale-105' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Visit</span>
        </button>
      </nav>

      {/* Mobile offset */}
      <div className="h-16 md:hidden"></div>

      {/* Desktop Floating AI Chatbot Button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="hidden md:flex fixed bottom-24 right-6 z-50 bg-[#001c46] hover:bg-[#002866] text-[#FFC907] px-4 py-3 rounded-full shadow-[0_4px_16px_rgba(0,28,70,0.35)] hover:shadow-[0_6px_22px_rgba(0,28,70,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 items-center gap-2.5 group cursor-pointer border border-[#FFC907]/30"
        title="GP Shiksha AI Assistant"
        id="ai-chatbot-desktop-button"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-[#FFC907]" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC907] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC907]"></span>
          </span>
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-white">Ask AI</span>
      </button>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919818776563?text=Hello%20GP%20Academy%2C%20I%20want%20to%20enquire%20about%20admissions."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Chat on WhatsApp"
        id="whatsapp-floating-button"
      >
        <span className="absolute right-full mr-3 bg-[#001c46] text-[#FFC907] text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg pointer-events-none hidden md:inline-block">
          Chat on WhatsApp
        </span>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WhatsApp" 
          className="w-7 h-7 sm:w-8 h-8 select-none" 
          referrerPolicy="no-referrer"
        />
      </a>

      {/* Global Apply/Enquiry Modal */}
      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />

      {/* GP Shiksha AI Chatbot Modal */}
      <AIChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
        onOpenApplyModal={() => setIsApplyModalOpen(true)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
