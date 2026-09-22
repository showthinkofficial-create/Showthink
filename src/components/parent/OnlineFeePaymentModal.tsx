import React from 'react';
import {
  X,
  CreditCard,
  Phone,
  Mail,
  Building,
  ShieldAlert,
  Clock,
  Sparkles,
  Receipt,
  Banknote,
  CalendarCheck
} from 'lucide-react';
import { SCHOOL_DETAILS } from '../../data/content';
import { Student } from '../../types/student';

interface OnlineFeePaymentModalProps {
  student: Student;
  pendingAmount: number;
  isOpen: boolean;
  onClose: () => void;
  feeId?: string;
  onPaymentSuccess?: () => void;
}

export const OnlineFeePaymentModal: React.FC<OnlineFeePaymentModalProps> = ({
  student,
  pendingAmount,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-8 space-y-4 sm:space-y-6 relative shadow-2xl animate-scaleIn border border-gray-100 my-4 sm:my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-xs">
            <CreditCard className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Coming Soon • Under Deployment</span>
            </div>
            <h3 className="text-xl font-black text-[#001c46]">
              Online Fee Payment
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            Student: <span className="font-bold text-gray-800">{student.name}</span> ({student.studentId}) • {student.className} - {student.section}
          </p>
        </div>

        {/* Pending Dues Banner */}
        <div className="bg-gradient-to-br from-[#001c46] to-[#0a3366] text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">
              Current Outstanding Dues
            </span>
            <span className="text-2xl font-black text-[#FFC907]">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-white">
              Session 2026-2027
            </span>
          </div>
        </div>

        {/* Coming Soon Notice Card */}
        <div className="bg-amber-50/90 border border-amber-200 p-4.5 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Razorpay Payment Gateway Coming Soon</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            Direct online fee payments via UPI, Credit/Debit Cards, and Net Banking are currently in preparation. Our accounts team is deploying secure payment gateway integration.
          </p>
        </div>

        {/* Offline & Counter Payment Options */}
        <div className="bg-gray-50 p-4.5 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#001c46] uppercase tracking-wider">
            <Building className="w-4 h-4 text-[#001c46]" />
            <span>Payment Modes Available At School</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-2.5">
              <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-800 block">Cash at Counter</span>
                <span className="text-[11px] text-gray-500">School accounts window</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-2.5">
              <Receipt className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-800 block">Cheque / DD</span>
                <span className="text-[11px] text-gray-500">In favour of "GP Academy"</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-[#001c46]" />
              <span>Office Hours: <strong className="text-gray-800">Mon - Sat (8:00 AM - 3:00 PM)</strong></span>
            </div>
          </div>
        </div>

        {/* Helpline Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600">
          <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block">Accounts Helpline</span>
              <span className="font-bold text-gray-800">{SCHOOL_DETAILS.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block">Office Email</span>
              <span className="font-bold text-gray-800 truncate block max-w-[140px]">
                {SCHOOL_DETAILS.email}
              </span>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
          <ShieldAlert className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>GP Academy will never ask for your banking passwords or OTPs.</span>
        </div>

        {/* Close Button */}
        <div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};


