import React, { useState } from 'react';
import { SCHOOL_DETAILS } from '../data/content';
import { AdmissionEnquiry } from '../types';
import { CheckCircle, AlertCircle, FileText, Send, HelpCircle, ClipboardCheck, Sparkles, Gift } from 'lucide-react';

export default function Admissions() {
  // Form State
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState<'CBSE' | 'UP Board'>('CBSE');
  const [studentAge, setStudentAge] = useState('');
  const [remarks, setRemarks] = useState('');

  // UI feedback state
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmittedId(null);

    // Basic Validation
    if (!studentName.trim() || !parentName.trim() || !phone.trim() || !grade || !studentAge.trim()) {
      setErrorMsg('Please fill out all required fields (*).');
      return;
    }

    const indianPhonePattern = /^[6-9]\d{9}$/;
    if (!indianPhonePattern.test(phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }

    // Create custom enquiry object
    const newId = 'GPA-' + Math.floor(100000 + Math.random() * 900000);
    const newEnquiry: AdmissionEnquiry = {
      id: newId,
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      phone: phone.trim(),
      previousSchool: previousSchool.trim() || 'Not Applicable',
      grade,
      board,
      interestType: 'Admission',
      studentAge: studentAge.trim(),
      remarks: remarks.trim(),
      status: 'Received',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage list
    const existingRaw = localStorage.getItem('gp_academy_enquiries');
    let enquiries: AdmissionEnquiry[] = [];
    if (existingRaw) {
      try {
        enquiries = JSON.parse(existingRaw);
      } catch (err) {
        console.error('Error parsing inquiries', err);
      }
    }
    enquiries.unshift(newEnquiry);
    localStorage.setItem('gp_academy_enquiries', JSON.stringify(enquiries));

    // Reset Form Fields
    setStudentName('');
    setParentName('');
    setPhone('');
    setPreviousSchool('');
    setGrade('');
    setStudentAge('');
    setRemarks('');
    setSubmittedId(newId);
  };

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Mini Title Header */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            Admissions Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            Apply Online & Exclusive Offers
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Admissions for Academic Session 2026-27 are now open. Simple and quick form submission.
          </p>
        </div>
      </section>

      {/* Seasonal Special Admission Offers */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-yellow-600/10 font-black text-7xl font-sans">
              $0
            </div>
            <div className="space-y-3">
              <span className="px-2.5 py-1 bg-[#FFC907] text-[#001c46] text-[10px] font-black uppercase tracking-widest rounded inline-block">
                Free Admission
              </span>
              <h3 className="text-lg font-sans font-black text-[#001c46]">Zero Registration Fee</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We have completely waived all standard admission and entry-test registration fees from <strong>June to August</strong>.
              </p>
            </div>
            <div className="pt-4 border-t border-yellow-200 mt-4 text-[11px] font-bold text-[#001c46]">
              Valid: {SCHOOL_DETAILS.offers.duration}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-blue-700/10 font-black text-7xl font-sans">
              Kit
            </div>
            <div className="space-y-3">
              <span className="px-2.5 py-1 bg-[#1A325D] text-[#FFC907] text-[10px] font-black uppercase tracking-widest rounded inline-block">
                Free Uniform Gift
              </span>
              <h3 className="text-lg font-sans font-black text-[#001c46]">Complimentary Tie & Belt</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every newly enrolled student is gifted an academy tie and professional belt set upon successful confirmation of documents.
              </p>
            </div>
            <div className="pt-4 border-t border-blue-200 mt-4 text-[11px] font-bold text-[#001c46]">
              Claimed at physical desk
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-purple-700/10 font-black text-7xl font-sans">
              3x3
            </div>
            <div className="space-y-3">
              <span className="px-2.5 py-1 bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest rounded inline-block">
                Referral Exemption
              </span>
              <h3 className="text-lg font-sans font-black text-[#001c46]">3 Months Free Tuition</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Refer 3 students who join GP Academy, and get a 3-month waiver on your own ward's tuition fees (T&C Apply).
              </p>
            </div>
            <div className="pt-4 border-t border-purple-200 mt-4 text-[11px] font-bold text-[#001c46]">
              June - August cycle only
            </div>
          </div>
        </div>
      </section>

      {/* Main Admissions Interface */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-2xl font-sans font-black text-[#001c46] mb-1">
                Online Admission Enquiry
              </h3>
              <p className="text-xs text-gray-500">
                Please fill in the form below to initiate your ward's admission process.
              </p>
            </div>

            {/* Feedback messages */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submittedId && (
              <div className="p-5 bg-green-50 border-l-4 border-green-500 text-green-900 rounded-r-xl space-y-2">
                <div className="flex items-center gap-2 text-sm font-black">
                  <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
                  <span>Enquiry Submitted Successfully!</span>
                </div>
                <p className="text-xs text-green-800">
                  Your reference ID is <strong className="font-mono text-xs">{submittedId}</strong>. Our admissions counselor will get in touch with you shortly.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Sharma"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Parent Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Indian Mobile e.g. 9818776563"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Student Previous School (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. St. Xavier's School"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Target Grade Level *
                    </label>
                    <select
                      required
                      value={grade}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGrade(val);
                        if (!['High (Class 9-10)', 'Senior Secondary (Class 11-12)'].includes(val)) {
                          setBoard('CBSE');
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm text-gray-700 font-semibold"
                    >
                      <option value="">Select Grade Level...</option>
                      <option value="Nursery">Nursery / Playgroup</option>
                      <option value="LKG / UKG">LKG / UKG</option>
                      <option value="Primary (Class 1-5)">Primary (Class 1-5)</option>
                      <option value="Middle (Class 6-8)">Middle (Class 6-8)</option>
                      <option value="High (Class 9-10)">High (Class 9-10)</option>
                      <option value="Senior Secondary (Class 11-12)">Senior Secondary (Class 11-12)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Preferred Academic Board *
                    </label>
                    <div className={`grid gap-2 ${['High (Class 9-10)', 'Senior Secondary (Class 11-12)'].includes(grade) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <button
                        type="button"
                        onClick={() => setBoard('CBSE')}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                          board === 'CBSE'
                            ? 'border-[#001c46] bg-[#001c46]/5 text-[#001c46]'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                        }`}
                      >
                        CBSE
                      </button>
                      {['High (Class 9-10)', 'Senior Secondary (Class 11-12)'].includes(grade) && (
                        <button
                          type="button"
                          onClick={() => setBoard('UP Board')}
                          className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                            board === 'UP Board'
                              ? 'border-[#001c46] bg-[#001c46]/5 text-[#001c46]'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          UP Board
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Student's Age *
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={25}
                      required
                      placeholder="e.g. 5"
                      value={studentAge}
                      onChange={(e) => setStudentAge(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm text-gray-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#001c46] block">
                      Referrer Name / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Referred by Mrs. Sharma"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#001c46] block">
                    Additional Remarks / Specific Doubts
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any specific medical or past report card detail here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#001c46] hover:bg-[#1A325D] text-[#FFC907] font-sans font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Application Enquiry
                </button>
              </form>
            </div>

            {/* Document Checklist Side */}
            <div className="lg:col-span-5 space-y-8">
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-6 h-6 text-[#1A325D]" />
                  <h3 className="text-lg font-sans font-black text-[#001c46]">
                    Onboarding Checklist
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Parents are requested to bring original copies of these records to the campus during physical interview verification:
                </p>
                <ul className="space-y-3 text-xs text-gray-700 font-bold">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4.5 h-4.5 text-[#FFC907] shrink-0 mt-0.5" />
                    <span>Birth Certificate issued by municipal corporation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4.5 h-4.5 text-[#FFC907] shrink-0 mt-0.5" />
                    <span>Student Aadhaar Card & Parent's ID/Address Proof.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4.5 h-4.5 text-[#FFC907] shrink-0 mt-0.5" />
                    <span>6 Recent Passport size photos of student, 2 of parents.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4.5 h-4.5 text-[#FFC907] shrink-0 mt-0.5" />
                    <span>Previous Grade Report Card (Not required for Nursery/LKG).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4.5 h-4.5 text-[#FFC907] shrink-0 mt-0.5" />
                    <span>Transfer Certificate counter-signed by education department.</span>
                  </li>
                </ul>
              </div>

              {/* Extra Offer Graphics box */}
              <div className="p-8 bg-[#001c46] text-white rounded-3xl space-y-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 text-[#FFC907]/10 pointer-events-none">
                  <Gift className="w-48 h-48" />
                </div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#FFC907] uppercase">
                  Seasonal Campaign
                </span>
                <h4 className="text-lg font-sans font-black">Free Uniform Tie & Belt Package</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Upon final fee processing and class allotment, receive free standard academy belt and Tie set from the logistics desk. Valid June-August admissions cycle only.
                </p>
              </div>
            </div>
          </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-[#1A325D] mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46]">
            Admissions FAQs
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Everything Parents Need To Know</p>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2">
            <h4 className="font-sans font-extrabold text-[#001c46] text-base">
              Q. What is the lowest age requirement for Nursery entry?
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              The applicant should be 3 years of age or older as of March 31st of the target academic cycle.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2">
            <h4 className="font-sans font-extrabold text-[#001c46] text-base">
              Q. How long does the free admission waive offer run?
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our zero-admission cost campaign runs strictly from June through August. Applications filed post August 31st are subject to standard entry fees.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2">
            <h4 className="font-sans font-extrabold text-[#001c46] text-base">
              Q. How do we claim the free Tie & Belt items?
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Once documents are verified and class details are assigned at our Noida office, the uniform logistics desk issues standard custom accessories completely free.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2">
            <h4 className="font-sans font-extrabold text-[#001c46] text-base">
              Q. Are students from UP Board eligible to transition to CBSE stream?
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Yes, we accommodate transition students. We administer a basic concept screening assessment to suggest any booster support classes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
