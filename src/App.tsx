import React, { useState, useEffect } from 'react';
import { ActivePage } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApplyModal from './components/ApplyModal';

// Page Imports
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import Facilities from './pages/Facilities';
import Gallery from './pages/Gallery';
import NewsEvents from './pages/NewsEvents';
import Contact from './pages/Contact';
import Legal from './pages/Legal';

// Lucide Icons
import { Home as HomeIcon, Phone, GraduationCap, MapPin, MessageSquare, AlertCircle } from 'lucide-react';
import { SCHOOL_DETAILS } from './data/content';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Auto-open admission enquiry modal popup after 2 seconds on initial website visit
  useEffect(() => {
    const popupTimer = setTimeout(() => {
      setIsApplyModalOpen(true);
    }, 2000);

    return () => clearTimeout(popupTimer);
  }, []);

  // Page switcher
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} onOpenApplyModal={() => setIsApplyModalOpen(true)} />;
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
      default:
        // 404 Fallback view
        return (
          <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6 animate-fadeIn font-sans">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-3xl font-black text-[#001c46]">Page Not Found</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We couldn't locate the regulatory department or visual module you are trying to open.
            </p>
            <button
              onClick={() => setActivePage('home')}
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
      <Navbar activePage={activePage} setActivePage={setActivePage} onOpenApplyModal={() => setIsApplyModalOpen(true)} />

      {/* Main Content Wrapper */}
      <main className="flex-grow pt-0">
        <div className="mx-auto">
          {renderPage()}
        </div>
      </main>

      {/* Global Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Sticky Bottom Navigation Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-100 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] rounded-t-2xl">
        <button
          onClick={() => setActivePage('home')}
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

        {/* Central visual hub badge */}
        <button
          onClick={() => setActivePage('academics')}
          className="flex flex-col items-center justify-center bg-[#001c46] text-[#FFC907] w-14 h-14 rounded-full -mt-7 border-4 border-white shadow-lg active:scale-95 transition-all"
        >
          <GraduationCap className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActivePage('admissions')}
          className={`flex flex-col items-center justify-center transition-all ${
            activePage === 'admissions' ? 'text-[#001c46] scale-105' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Enquire</span>
        </button>

        <button
          onClick={() => setActivePage('contact')}
          className={`flex flex-col items-center justify-center transition-all ${
            activePage === 'contact' ? 'text-[#001c46] scale-105' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Visit</span>
        </button>
      </nav>

      {/* Adjust padding at bottom on mobile to offset bottom nav */}
      <div className="h-16 md:hidden"></div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919818776563?text=Hello%20GP%20Academy%2C%20I%20want%20to%20enquire%20about%20admissions."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Chat on WhatsApp"
        id="whatsapp-floating-button"
      >
        {/* Dynamic tooltip */}
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
    </div>
  );
}
