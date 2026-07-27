import React from 'react';
import { ShieldCheck, Info, FileText } from 'lucide-react';
import { SCHOOL_DETAILS } from '../data/content';

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 animate-fadeIn font-sans">
      <div className="text-center space-y-3">
        <FileText className="w-10 h-10 text-[#1A325D] mx-auto" />
        <h1 className="text-3xl font-sans font-black text-[#001c46]">
          Terms of Service & Privacy Policy
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
          GP Academy Noida - Regulatory Disclosures
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl space-y-3 text-xs text-yellow-900">
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-yellow-600" />
          <span>Referral Promotion Terms & Conditions (T&C Apply)</span>
        </div>
        <p className="leading-relaxed">
          Our specialized seasonal promotion running from <strong>June to August</strong> states that parents of existing students are eligible for a 3-month waiver on tuition fees under these conditions: (1) The reference must lead to 3 successful, complete admission onboarding cycles. (2) Zero-admission-fee benefits and kit allocations (complimentary Tie & Belt) apply strictly to successful physical document confirmation during the specific June to August cycle.
        </p>
      </div>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-lg font-sans font-extrabold text-[#001c46] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FFC907]" /> 1. Privacy Principles
          </h3>
          <p>
            GP Academy Noida respects the privacy of our parents and students. Any personal identification record (Aadhaar cards, certificates, phone dials, emails) submitted through our web portal is strictly secured in high-tier local states or internal directories. We strictly prohibit external sharing, marketing, or commercial sales of student databases.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-sans font-extrabold text-[#001c46] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FFC907]" /> 2. Content Disclaimer
          </h3>
          <p>
            All academic guides, news items, and curriculum details published on gpacademy.edu.in reflect standard parameters under CBSE guidelines and UP board provisions. We make every effort to present correct, current criteria, but do not assume liability for manual typo oversights.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-sans font-extrabold text-[#001c46] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FFC907]" /> 3. Governing Location
          </h3>
          <p>
            Any dispute, arbitration, or legal registration claims reside strictly under Noida, Gautam Buddha Nagar, Uttar Pradesh judicial administration.
          </p>
        </section>
      </div>

      <div className="pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 font-mono">
          Last Updated: July 16, 2026. Document ID: GPA-LEGAL-2026
        </p>
      </div>
    </div>
  );
}
