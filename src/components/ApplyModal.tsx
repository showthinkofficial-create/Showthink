import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Sparkles, MessageSquare, Phone } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdmissionEnquiry } from '../types';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyModal({ isOpen, onClose }: ApplyModalProps) {
  // 13 Fields State
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [admissionClass, setAdmissionClass] = useState('');
  const [boardPreference, setBoardPreference] = useState<'CBSE' | 'UP Board' | 'Not Sure' | 'Not Applicable'>('CBSE');
  const [enquiryType, setEnquiryType] = useState('New Admission');
  const [previousSchool, setPreviousSchool] = useState('');
  const [area, setArea] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Call' | 'WhatsApp'>('Call');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  if (!isOpen) return null;

  // Rule: Check if admission class is Nursery to Class 8
  const isJuniorClass = (grade: string) => {
    const juniorClasses = [
      'Nursery', 'LKG', 'UKG',
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'
    ];
    return juniorClasses.includes(grade);
  };

  const handleAdmissionClassChange = (val: string) => {
    setAdmissionClass(val);
    if (isJuniorClass(val) && boardPreference === 'UP Board') {
      setBoardPreference('CBSE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validation
    if (!studentName.trim() || !parentName.trim() || !phone.trim() || !currentClass || !admissionClass || !area.trim() || !consent) {
      setErrorMsg('Please fill in all required fields (*).');
      return;
    }

    const indianPhonePattern = /^[6-9]\d{9}$/;
    if (!indianPhonePattern.test(phone.trim())) {
      setErrorMsg('Primary Mobile Number must be a valid 10-digit Indian number.');
      return;
    }

    if (alternatePhone.trim() && !/^\d{10,12}$/.test(alternatePhone.trim())) {
      setErrorMsg('Alternate Mobile Number must be valid.');
      return;
    }

    setIsSubmitting(true);

    try {
      const enquiryId = 'GPA-' + Math.floor(100000 + Math.random() * 900000);
      setGeneratedId(enquiryId);

      const enquiryData: AdmissionEnquiry = {
        id: enquiryId,
        studentName: studentName.trim(),
        parentName: parentName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        currentClass,
        admissionClass,
        boardPreference,
        enquiryType,
        previousSchool: previousSchool.trim() || undefined,
        area: area.trim(),
        preferredContactMethod,
        message: message.trim() || undefined,
        consent,
        status: 'New',
        source: 'Website',
        createdAt: new Date().toISOString()
      };

      // 1. Save to Firebase (Firestore)
      const enquiryRef = doc(collection(db, 'enquiries'), enquiryId);
      await setDoc(enquiryRef, enquiryData);

      // 2. Save locally for fallback tracking
      const existingRaw = localStorage.getItem('gp_academy_enquiries');
      let enquiries: any[] = [];
      if (existingRaw) {
        try {
          enquiries = JSON.parse(existingRaw);
        } catch (err) {
          console.error('Error parsing local enquiries', err);
        }
      }
      enquiries.unshift(enquiryData);
      localStorage.setItem('gp_academy_enquiries', JSON.stringify(enquiries));

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error saving to Firestore:', err);
      setErrorMsg('Database submission failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const formattedMsg = `*GP ACADEMY ADMISSION ENQUIRY* 🎓
----------------------------------
*Enquiry ID:* ${generatedId}
*Student Name:* ${studentName.trim()}
*Parent Name:* ${parentName.trim()}
*Phone:* ${phone.trim()}
${alternatePhone.trim() ? `*Alt Phone:* ${alternatePhone.trim()}\n` : ''}*Current Class:* ${currentClass}
*Admission For:* ${admissionClass}
*Board Pref:* ${boardPreference}
*Enquiry Type:* ${enquiryType}
${previousSchool.trim() ? `*Prev School:* ${previousSchool.trim()}\n` : ''}*Area/Address:* ${area.trim()}
*Preferred Contact:* ${preferredContactMethod}
${message.trim() ? `*Message:* ${message.trim()}\n` : ''}----------------------------------
_Submitted via Online Application Portal_`;

    const whatsappUrl = `https://wa.me/919818776563?text=${encodeURIComponent(formattedMsg)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClose = () => {
    // Reset state & close
    setStudentName('');
    setParentName('');
    setPhone('');
    setAlternatePhone('');
    setCurrentClass('');
    setAdmissionClass('');
    setBoardPreference('CBSE');
    setEnquiryType('New Admission');
    setPreviousSchool('');
    setArea('');
    setPreferredContactMethod('Call');
    setMessage('');
    setConsent(false);
    setErrorMsg('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-[0_20px_60px_rgba(26,50,93,0.35)] flex flex-col max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white p-3.5 relative">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FFC907]/25 text-[#FFC907] text-[9px] font-black uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" /> Admission Inquiry 2026-27
              </span>
              <h2 className="text-base sm:text-lg font-sans font-black tracking-tight">
                Admission Enquiry Form
              </h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body - scroll only if screen height is extremely small */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border-l-3 border-red-500 text-red-800 rounded-r-lg text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="p-5 bg-green-50 border border-green-200 text-green-900 rounded-xl space-y-4 text-center py-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-sans font-black text-[#001c46]">Admission Enquiry Submitted!</h3>
                <p className="text-xs text-green-800 max-w-sm mx-auto">
                  Your enquiry has been securely saved to our database with Reference ID: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-green-200 text-[#001c46] text-xs">{generatedId}</strong>.
                </p>
                <p className="text-[11px] text-gray-500">
                  Please click the button below to connect with our administrative desk on WhatsApp and track your admission status instantly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Send on WhatsApp
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Row 1: Student & Parent Name */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Student full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Parent full name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
              </div>

              {/* Row 2: Mobile & Alternate Mobile */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Alternate Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="Alternate contact (optional)"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
              </div>

              {/* Row 3: Current Class & Admission For */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Student's Current Class *
                  </label>
                  <select
                    required
                    value={currentClass}
                    onChange={(e) => setCurrentClass(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px] text-gray-700"
                  >
                    <option value="">Select current...</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                    ))}
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Admission Required For *
                  </label>
                  <select
                    required
                    value={admissionClass}
                    onChange={(e) => handleAdmissionClassChange(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px] text-gray-700"
                  >
                    <option value="">Select target...</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                    ))}
                    <option value="Coaching">Coaching</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Board Preference & Enquiry Type */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Board Preference *
                  </label>
                  <select
                    required
                    value={boardPreference}
                    onChange={(e) => setBoardPreference(e.target.value as any)}
                    className="w-full px-2 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px] text-gray-700"
                  >
                    <option value="CBSE">CBSE</option>
                    {!isJuniorClass(admissionClass) && (
                      <option value="UP Board">UP Board</option>
                    )}
                    <option value="Not Sure">Not Sure</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Enquiry Type *
                  </label>
                  <select
                    required
                    value={enquiryType}
                    onChange={(e) => setEnquiryType(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px] text-gray-700"
                  >
                    <option value="New Admission">New Admission</option>
                    <option value="Fee Details">Fee Details</option>
                    <option value="School Visit">School Visit</option>
                    <option value="Coaching Classes">Coaching Classes</option>
                    <option value="Referral Offer">Referral Offer</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Previous School & Address/Area */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Previous School
                  </label>
                  <input
                    type="text"
                    placeholder="Name of last school"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Address / Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 110"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
              </div>

              {/* Row 6: Preferred Contact Method & Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide block">
                    Preferred Contact Method *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredContactMethod('Call')}
                      className={`py-1 text-[11px] font-bold rounded border transition-all flex items-center justify-center gap-1 ${
                        preferredContactMethod === 'Call'
                          ? 'border-[#001c46] bg-[#001c46]/5 text-[#001c46]'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Phone className="w-3 h-3" /> Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredContactMethod('WhatsApp')}
                      className={`py-1 text-[11px] font-bold rounded border transition-all flex items-center justify-center gap-1 ${
                        preferredContactMethod === 'WhatsApp'
                          ? 'border-[#001c46] bg-[#001c46]/5 text-[#001c46]'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black text-[#001c46] uppercase tracking-wide">
                    Message / Remarks
                  </label>
                  <textarea
                    rows={1}
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-2.5 py-1 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#001c46] text-[11px]"
                  />
                </div>
              </div>

              {/* Consent and Submit */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[#001c46] rounded border-gray-300"
                  />
                  <span className="text-[9px] text-gray-500 leading-tight">
                    I agree to be contacted by GP Academy regarding admission and school information. *
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-[#001c46] hover:bg-[#1A325D] text-[#FFC907] font-sans font-black uppercase tracking-wider rounded border border-black transition-all shadow text-[10px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  {isSubmitting ? (
                    'Submitting to Database...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Admission Enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Compact Footer */}
        <div className="bg-gray-50 p-2 border-t border-gray-100 flex justify-between items-center text-[9px] text-gray-400">
          <span>📅 Admissions strictly subject to eligibility & verifications.</span>
          <span className="font-bold text-[#001c46]">GP ACADEMY</span>
        </div>
      </div>
    </div>
  );
}
