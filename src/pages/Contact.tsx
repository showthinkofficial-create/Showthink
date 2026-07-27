import React, { useState } from 'react';
import { SCHOOL_DETAILS } from '../data/content';
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackSent, setBookedStatus] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert('Please fill out all the fields.');
      return;
    }
    setBookedStatus(true);
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Page Title */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            Noida Headquarters
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            Get In Touch With GP Academy
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Our admissions office is ready to support you with enrollment parameters, referral rewards, or fee structures.
          </p>
        </div>
      </section>

      {/* Main layout */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Contact details */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h3 className="text-2xl font-sans font-black text-[#001c46] mb-1">
              Contact Channels
            </h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              Bhangel - Noida Campus Details
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <MapPin className="w-6 h-6 text-[#1A325D] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-[#001c46] mb-1">Academy Address</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {SCHOOL_DETAILS.address}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Phone className="w-6 h-6 text-[#1A325D] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-[#001c46] mb-1">Direct Call Channel</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Call our admissions manager directly at: <br />
                  <a href={`tel:${SCHOOL_DETAILS.phone}`} className="font-extrabold text-[#1A325D] underline">
                    {SCHOOL_DETAILS.phone}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Mail className="w-6 h-6 text-[#1A325D] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-[#001c46] mb-1">Email Queries</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Send your certificates or transfer inquiries to: <br />
                  <a href={`mailto:${SCHOOL_DETAILS.email}`} className="font-extrabold text-[#1A325D] underline">
                    {SCHOOL_DETAILS.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Clock className="w-6 h-6 text-[#1A325D] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-[#001c46] mb-1">Operational Hours</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {SCHOOL_DETAILS.hoursWeekday} <br />
                  {SCHOOL_DETAILS.hoursWeekend}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Enquiry Message */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-sans font-black text-[#001c46] mb-1">
              Send Quick Message
            </h3>
            <p className="text-xs text-gray-500">
              Complete the quick contact form below, and we will get back to you within 2-4 hours.
            </p>
          </div>

          {feedbackSent && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
              <span>Thank you! Your feedback message has been logged. Our office represents response shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#001c46] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9818776563"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#001c46] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">Your Message or Enquiry details *</label>
              <textarea
                required
                rows={4}
                placeholder="Ask us anything about CBSE/UP Board choices, admission deadlines, uniform sets, etc..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#001c46] text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#001c46] hover:bg-[#1A325D] text-[#FFC907] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Instant Message
            </button>
          </form>
        </div>
      </section>

      {/* Structured Google Maps representation container */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-sans font-black text-[#001c46] mb-1">
              Interactive Campus Location Map
            </h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              Bhangel Salarpur Noida Metro Proximities
            </p>
          </div>

          <div className="h-[400px] w-full bg-slate-100 rounded-3xl overflow-hidden relative border border-gray-200 shadow-inner flex items-center justify-center text-center">
            {/* Real OpenStreetMap embedding for exact address! */}
            <iframe
              title="GP Academy Location Map"
              src="https://maps.google.com/maps?q=Bhangel%20Goyal%20Colony%20Salarpur%20Khadar%20Noida%20Uttar%20Pradesh%20201304&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 z-10"
            ></iframe>

            {/* Backup illustrative details */}
            <div className="relative z-0 p-8 space-y-3">
              <MapPin className="w-12 h-12 text-[#1A325D] mx-auto animate-bounce" />
              <h4 className="font-extrabold text-[#001c46] text-base">Bhangel - Salarpur Sector Area, Noida</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Our main school branch resides beside the central Noida Expressway belt in close proximity to Goyal Colony.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
