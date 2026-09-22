import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StudentFeePayment } from '../../types/fees';
import { Student } from '../../types/student';
import Logo from '../Logo';
import { printElementById } from '../../lib/printUtils';

interface FeeReceiptModalProps {
  payment: StudentFeePayment;
  student: Student;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  payment,
  student,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-8 space-y-4 sm:space-y-6 relative shadow-2xl my-auto max-h-[95vh] overflow-y-auto animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Receipt Frame */}
        <div id="printable-receipt" className="border-2 sm:border-4 border-[#001c46] p-4 sm:p-8 rounded-2xl bg-white space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#001c46]">GP ACADEMY</h2>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Fee Payment Receipt</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Receipt No.</span>
              <span className="font-black text-[#001c46] text-sm break-all">{payment.receiptNumber}</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Student Name</span>
              <span className="font-black text-gray-900">{student.name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Student ID</span>
              <span className="font-black text-gray-900">{student.studentId}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Class & Section</span>
              <span className="font-black text-gray-900">{student.className} — {student.section}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Payment Date</span>
              <span className="font-black text-gray-900">{payment.paymentDate}</span>
            </div>
          </div>

          {/* Payment Detail Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs min-w-[320px]">
              <thead className="bg-[#001c46] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-3.5 sm:px-4 py-2.5">Fee Category</th>
                  <th className="px-3.5 sm:px-4 py-2.5">Payment Mode</th>
                  <th className="px-3.5 sm:px-4 py-2.5 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                <tr>
                  <td className="px-3.5 sm:px-4 py-3 font-bold text-gray-900">{payment.feeType}</td>
                  <td className="px-3.5 sm:px-4 py-3 text-gray-600">{payment.paymentMode}</td>
                  <td className="px-3.5 sm:px-4 py-3 text-right font-black text-emerald-700 text-sm">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reference & Remarks */}
          {payment.referenceNumber && (
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 break-words">
              <span className="font-bold text-gray-800">Reference / Transaction ID:</span> {payment.referenceNumber}
            </div>
          )}

          {/* Footer Signature */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Paid Record</span>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 w-28 mb-1" />
              <span>Accounts Office</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-2 flex-wrap">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() =>
              printElementById('printable-receipt', {
                title: `Fee_Receipt_${payment.receiptNumber || 'GP_Academy'}`,
                landscape: false,
              })
            }
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#001c46] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-[#FFC907]" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
