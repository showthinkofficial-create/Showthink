import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  AlertCircle,
  FileText,
  PhoneCall,
  Info,
  X,
  Building2
} from 'lucide-react';
import { StudentFeeDetail, StudentFeePayment } from '../../types/fees';
import { Student } from '../../types/student';
import { FeeReceiptModal } from './FeeReceiptModal';

interface StudentFeesViewProps {
  feeDetail: StudentFeeDetail | null;
  payments: StudentFeePayment[];
  student: Student;
}

export const StudentFeesView: React.FC<StudentFeesViewProps> = ({
  feeDetail,
  payments,
  student,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<StudentFeePayment | null>(null);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);

  const totalFee = feeDetail?.totalFee || 0;
  const paidFee = feeDetail?.paidAmount || 0;
  const pendingFee = feeDetail?.pendingAmount || 0;
  const feeStatus = feeDetail?.status || (pendingFee === 0 ? 'PAID' : 'PENDING');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#001c46]">
            <CreditCard className="w-6 h-6 text-[#FFC907]" />
            <h1 className="text-xl font-black">Fee Overview & Payment Receipts</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Academic fee ledger, balance statements, and verified digital receipts.
          </p>
        </div>

        {/* Pay Fee Button */}
        <button
          onClick={() => setShowPayModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 w-full sm:w-auto shrink-0"
        >
          <CreditCard className="w-4 h-4 text-[#FFC907]" />
          <span>Pay Fee Online</span>
        </button>
      </div>

      {/* Primary Financial Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Fee */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Fee</span>
          <div className="text-2xl font-black text-gray-900">₹{totalFee.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-gray-500">Session 2026–2027</span>
        </div>

        {/* Paid Amount */}
        <div className="bg-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1 text-emerald-950">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Paid Amount</span>
          <div className="text-2xl font-black text-emerald-800">₹{paidFee.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Verified Receipts</span>
        </div>

        {/* Pending Amount */}
        <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1 text-amber-950">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Amount</span>
          <div className="text-2xl font-black text-amber-800">₹{pendingFee.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-amber-700 font-medium">Due Balance</span>
        </div>

        {/* Fee Status */}
        <div className="bg-[#001c46] text-white p-4 sm:p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#FFC907] uppercase">Fee Status</span>
          <div className="text-xl font-black uppercase text-white mt-1">{feeStatus}</div>
          <span className="text-[11px] text-blue-200">Account Status</span>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#001c46]" />
            <h2 className="font-black text-base text-gray-900">Payment History & Ledger</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {payments.length} Transaction Records
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-gray-300" />
            <p>No fee payment records found in account ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-[#001c46] text-white font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Receipt No.</th>
                  <th className="px-4 py-3">Fee Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-black text-[#001c46]">{p.receiptNumber}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.feeType}</td>
                    <td className="px-4 py-3 text-gray-600">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-gray-600">{p.paymentMode}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-700">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#001c46] hover:underline bg-blue-50 px-2.5 py-1 rounded-lg"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Fee Receipt Modal */}
      {selectedPayment && (
        <FeeReceiptModal
          payment={selectedPayment}
          student={student}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {/* Pay Fee Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Online Fee Payment</h3>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-2">
              <p className="font-bold text-sm">Online Fee Payment Coming Soon.</p>
              <p className="text-amber-800 leading-relaxed">
                Please contact GP Academy administration for payment assistance or visit the accounts desk.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <PhoneCall className="w-4 h-4 text-[#001c46]" />
                <span>Administration & Accounts Contact:</span>
              </div>
              <div className="text-gray-600 pl-6 space-y-0.5">
                <p>Phone: <span className="font-bold text-gray-900">+91 9818776563</span></p>
                <p>Email: <span className="font-bold text-gray-900">accounts@gpacademy.in</span></p>
                <p>Office Hours: Mon–Sat, 8:00 AM – 3:30 PM</p>
              </div>
            </div>

            <button
              onClick={() => setShowPayModal(false)}
              className="w-full bg-[#001c46] hover:bg-blue-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
