import React from 'react';
import { ActivePage } from '../types';
import { SCHOOL_DETAILS } from '../data/content';
import { GraduationCap, MapPin, Phone, Mail, Clock, ShieldAlert } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer className="bg-[#001c46] text-gray-300 pt-16 pb-12 border-t-2 border-[#FFC907]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Card */}
          <div className="space-y-6">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Go to Home"
            >
              <Logo size={56} className="group-hover:scale-105 transition-transform duration-300" />
              <span className="font-sans font-extrabold text-white text-xl tracking-wide group-hover:text-[#FFC907] transition-colors">
                GP ACADEMY
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Noida's premier educational institute from Nursery to Class 12. Blending modern technological focus with a structured, disciplined environment for maximum growth.
            </p>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-[#FFC907] block font-bold mb-1">
                Our Tagline
              </span>
              <p className="text-white font-serif italic text-sm">
                "{SCHOOL_DETAILS.tagline}"
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#FFC907] font-bold text-sm uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button 
                  onClick={() => setActivePage('home')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Home Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('about')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Philosophy & Principal's Message
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('academics')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Academic Pathways (K-12)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('admissions')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Admission Policies & Process
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('contact')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Contact & Locate Us
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="text-[#FFC907] font-bold text-sm uppercase tracking-wider mb-6">
              Resources
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button 
                  onClick={() => setActivePage('facilities')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  School Infrastructure & Labs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('gallery')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Campus Life Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('news')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  News, Notices & Milestones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('blog')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Educational Journal & Articles (Noida)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('legal')}
                  className="hover:text-white hover:underline transition-all text-gray-400 text-left"
                >
                  Privacy Policy & Terms
                </button>
              </li>
              <li className="pt-2 border-t border-white/5 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Portals</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <button 
                    onClick={() => setActivePage('login')}
                    className="text-[#FFC907] hover:underline transition-all"
                  >
                    Student / Parent
                  </button>
                  <span className="text-gray-600">|</span>
                  <button 
                    onClick={() => setActivePage('teacher-login')}
                    className="text-gray-300 hover:text-white hover:underline transition-all"
                  >
                    Faculty
                  </button>
                  <span className="text-gray-600">|</span>
                  <button 
                    onClick={() => setActivePage('admin-login')}
                    className="text-gray-400 hover:text-white hover:underline transition-all"
                  >
                    Admin
                  </button>
                </div>
              </li>
            </ul>
          </div>

          {/* Location & Contacts */}
          <div>
            <h4 className="text-[#FFC907] font-bold text-sm uppercase tracking-wider mb-6">
              Contact Noida
            </h4>
            <ul className="space-y-4 text-xs text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FFC907] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {SCHOOL_DETAILS.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FFC907] shrink-0" />
                <a href={`tel:${SCHOOL_DETAILS.phone}`} className="hover:text-white transition-colors">
                  {SCHOOL_DETAILS.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FFC907] shrink-0" />
                <a href={`mailto:${SCHOOL_DETAILS.email}`} className="hover:text-white transition-colors">
                  {SCHOOL_DETAILS.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#FFC907] shrink-0 mt-0.5" />
                <div>
                  <p>{SCHOOL_DETAILS.hoursWeekday}</p>
                  <p>{SCHOOL_DETAILS.hoursWeekend}</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower copyright bar with explicit local SEO terms */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="space-y-1 text-center md:text-left">
            <p>
              &copy; {new Date().getFullYear()} GP Academy. {SCHOOL_DETAILS.tagline}. All Rights Reserved.
            </p>
            <p className="text-[10px] text-gray-500">
              Ranked among the top schools in Bhangel, Salarpur Khadar, and Noida near Goyal Colony.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
              Nursery to Class XII (CBSE & UP)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
