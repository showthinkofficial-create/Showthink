import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import Logo from '../Logo';
import { PaymentRecord } from '../../types/fees';
import { printElementById } from '../../lib/printUtils';

interface PrintableReceiptModalProps {
  payment: PaymentRecord;
  onClose: () => void;
}

export default function PrintableReceiptModal({ payment, onClose }: PrintableReceiptModalProps) {
  const handlePrint = () => {
    printElementById('printable-receipt', {
      title: `Fee_Receipt_${payment.receiptNumber || 'GP_Academy'}`,
      landscape: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001c46]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative overflow-hidden font-sans space-y-6">
        {/* Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-[#001c46]">Official Fee Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#001c46] hover:bg-[#001535] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFC907]" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div id="printable-receipt" className="p-6 bg-white border-2 border-gray-200 rounded-2xl space-y-6">
          {/* School Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <Logo size={48} className="shrink-0" />
              <div>
                <h1 className="text-xl font-black text-[#001c46] tracking-wide">GP ACADEMY</h1>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Excellence in Education • Official Fee Voucher
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                PAID & VERIFIED
              </span>
              <p className="text-xs font-mono font-extrabold text-[#001c46] mt-1.5">
                {payment.receiptNumber}
              </p>
            </div>
          </div>

          {/* Student & Payment Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Student Details
              </span>
              <p className="text-sm font-black text-[#001c46]">{payment.studentName || '—'}</p>
              <p className="text-gray-600">ID: {payment.studentId}</p>
              {payment.className && (
                <p className="text-gray-600">
                  Class: {payment.className} ({payment.section || 'A'})
                </p>
              )}
            </div>

            <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Transaction Meta
              </span>
              <p className="text-gray-700">Date: {payment.paymentDate}</p>
              <p className="text-gray-700">Mode: {payment.paymentMode}</p>
              <p className="text-gray-700">Ref: {payment.referenceNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Description / Fee Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 font-bold">
                  <td className="py-3 px-3 text-[#001c46]">{payment.feeType}</td>
                  <td className="py-3 px-3 text-right font-black text-emerald-800">
                    ₹{Number(payment.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-black text-xs text-[#001c46]">
                  <td className="py-3 px-3">TOTAL PAID AMOUNT</td>
                  <td className="py-3 px-3 text-right text-sm text-emerald-700">
                    ₹{Number(payment.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Remarks & Authorization */}
          <div className="pt-2 flex items-end justify-between border-t border-gray-200 text-[11px]">
            <div className="space-y-1 text-gray-500 font-bold max-w-[240px]">
              {payment.remarks && <p>Remarks: {payment.remarks}</p>}
              <p>Recorded By: {payment.recordedBy || 'Admin'}</p>
            </div>
            <div className="text-right">
              <div className="w-28 h-8 border-b-2 border-gray-400 mb-1"></div>
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">
                Authorized Signatory
              </span>
            </div>
          </div>

          <div className="text-center pt-2 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest border-t border-gray-100 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Computer Generated Receipt • GP Academy Accounts Office</span>
          </div>
        </div>

        {/* Action Close Footer (Hidden on print) */}
        <div className="flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
