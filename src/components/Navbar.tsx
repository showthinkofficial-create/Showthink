import React, { useState } from 'react';
import { ActivePage } from '../types';
import { SCHOOL_DETAILS } from '../data/content';
import { Menu, X, Phone, Mail, Award, Clock } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenApplyModal: () => void;
}

export default function Navbar({ activePage, setActivePage, onOpenApplyModal }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { label: string; value: ActivePage }[] = [
    { label: 'Home', value: 'home' },
    { label: 'About Us', value: 'about' },
    { label: 'Academics', value: 'academics' },
    { label: 'Admissions', value: 'admissions' },
    { label: 'Facilities', value: 'facilities' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'News & Events', value: 'news' },
    { label: 'Contact Us', value: 'contact' },
  ];

  const desktopNavItems: { label: string; value: ActivePage }[] = [
    { label: 'HOME', value: 'home' },
    { label: 'ACADEMICS', value: 'academics' },
    { label: 'ADMISSIONS', value: 'admissions' },
    { label: 'FACILITIES', value: 'facilities' },
    { label: 'CAMPUS LIFE', value: 'gallery' },
    { label: 'ABOUT US', value: 'about' },
  ];

  const isItemActive = (value: ActivePage) => {
    if (value === 'home' && activePage === 'home') return true;
    if (value === 'academics' && activePage === 'academics') return true;
    if (value === 'admissions' && activePage === 'admissions') return true;
    if (value === 'facilities' && activePage === 'facilities') return true;
    if (value === 'gallery' && activePage === 'gallery') return true;
    if (value === 'about' && activePage === 'about') return true;
    return false;
  };

  return (
    <>
      {/* Dynamic Top Announcement Bar & Contacts */}
      <div className="hidden md:block bg-[#001c46] text-white py-2 px-4 border-b border-white/10 text-xs font-sans relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-300">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#FFC907]" />
              <a href={`tel:${SCHOOL_DETAILS.phone}`}>{SCHOOL_DETAILS.phone}</a>
            </span>
            <span className="h-3 w-px bg-white/20 hidden sm:block"></span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#FFC907]" />
              <a href={`mailto:${SCHOOL_DETAILS.email}`}>{SCHOOL_DETAILS.email}</a>
            </span>
            <span className="h-3 w-px bg-white/20 hidden md:block"></span>
            <span className="hidden md:flex items-center gap-1.5 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-[#FFC907]" />
              <span>{SCHOOL_DETAILS.hoursWeekday}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-hidden text-center md:text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFC907] text-[#001c46] font-extrabold text-[10px] uppercase tracking-wider animate-pulse">
              <Award className="w-3 h-3" /> Offer
            </span>
            <span className="text-gray-200 font-medium text-[11px] sm:text-xs">
              {SCHOOL_DETAILS.offers.admission} | {SCHOOL_DETAILS.offers.extras}
            </span>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm h-[70px] flex items-center transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center w-full">
          {/* Logo Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Go to Home"
          >
            {/* Logo Badge Container */}
            <div className="flex items-center gap-3 shrink-0">
              <Logo size={56} className="group-hover:scale-105 transition-transform duration-300" />
            </div>

            {/* Brand Text */}
            <div className="flex flex-col justify-center">
              <span className="font-sans font-black text-xl sm:text-2xl tracking-tight text-[#1A325D] block uppercase leading-none">
                GP ACADEMY
              </span>
              <span className="text-[9px] text-[#1A325D] font-bold tracking-[0.05em] uppercase mt-1 leading-none">
                KNOWLEDGE IS THE BIGGEST MONEY
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {desktopNavItems.map((item) => {
              const isActive = isItemActive(item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => setActivePage(item.value)}
                  className="relative py-2 px-1 text-[13px] xl:text-sm font-black tracking-wide text-[#1A325D] hover:text-[#001c46] transition-all flex flex-col items-center cursor-pointer"
                >
                  <span className="uppercase">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#FFC907] rounded-full mx-auto w-10/12" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Call-to-action button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('login')}
              className="hidden md:inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-[#001c46] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-black"
            >
              <span>Portal Login</span>
            </button>
            <button
              onClick={onOpenApplyModal}
              className="hidden sm:inline-flex bg-[#132d56] hover:bg-[#0c203f] text-white px-6 py-3 rounded-xl border-2 border-[#FFC907] text-sm font-bold tracking-wide transition-all shadow-md active:scale-95 hover:shadow-lg cursor-pointer"
            >
              Apply Now
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#001c46] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setActivePage('home');
                setIsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Go to Home"
            >
              <Logo size={42} />
              <span className="font-bold text-gray-800 text-base">GP Academy</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activePage === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    setActivePage(item.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-[#001c46] text-white border-l-4 border-[#FFC907]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <Phone className="w-4 h-4 text-[#001c46]" />
              <span>{SCHOOL_DETAILS.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <Mail className="w-4 h-4 text-[#001c46]" />
              <span>{SCHOOL_DETAILS.email}</span>
            </div>
            <button
              onClick={() => {
                setActivePage('login');
                setIsOpen(false);
              }}
              className="w-full bg-[#001c46] hover:bg-[#1A325D] text-[#FFC907] p-3.5 rounded-xl text-center text-xs font-extrabold uppercase tracking-wider transition-all"
            >
              Institutional Portal Login
            </button>
            <button
              onClick={() => {
                onOpenApplyModal();
                setIsOpen(false);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 p-3.5 rounded-xl text-center text-xs font-bold tracking-wider transition-all"
            >
              Admission Enquiry
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
