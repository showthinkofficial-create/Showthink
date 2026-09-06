import React, { useState } from 'react';
import { CreditCard, Clock, X, ShieldCheck, Building, Sparkles } from 'lucide-react';
import { SCHOOL_DETAILS } from '../../data/content';

interface PaymentGatewayButtonProps {
  amount?: number;
  studentName?: string;
  className?: string;
}

export default function PaymentGatewayButton({
  amount,
  studentName,
  className = '',
}: PaymentGatewayButtonProps) {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const handleClick = () => {
    setIsOpenModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`px-4 py-2.5 bg-[#001c46] hover:bg-[#001535] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${className}`}
      >
        <CreditCard className="w-4 h-4 text-[#FFC907]" />
        <span>Pay Online (Coming Soon)</span>
      </button>

      {/* COMING SOON MODAL */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001c46]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center space-y-5 relative">
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-amber-100 text-amber-600">
              <CreditCard className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Integration • Coming Soon</span>
              </div>
              <h3 className="text-xl font-black text-[#001c46] tracking-tight">
                Online Fee Payment Coming Soon
              </h3>
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed pt-1">
                Razorpay online payment gateway integration is currently on hold and will be enabled soon. Please contact GP Academy Accounts Office for fee clearance via Cash, Cheque, or Direct Bank Transfer.
              </p>
            </div>

            {studentName && amount !== undefined && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs font-bold text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student:</span>
                  <span className="text-[#001c46] font-extrabold">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Amount:</span>
                  <span className="text-emerald-700 font-extrabold">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <Building className="w-3.5 h-3.5 text-[#001c46]" />
                <span>Accounts Office Contact</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Phone: <strong className="text-gray-700">{SCHOOL_DETAILS.phone}</strong> • Hours: 8:00 AM - 3:00 PM
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="w-full py-3 bg-[#001c46] hover:bg-[#001535] text-[#FFC907] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Understood & Close
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>GP Academy Secure Portal • Razorpay Pending</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

