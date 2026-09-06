import React, { useState } from 'react';
import { Student } from '../../types/student';
import { StudentFeeDetail, StudentFeePayment } from '../../types/fees';
import { FeeReceiptModal } from '../student/FeeReceiptModal';
import { OnlineFeePaymentModal } from './OnlineFeePaymentModal';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Printer,
  Download,
  AlertTriangle,
  ShieldCheck,
  Building,
  HelpCircle,
  FileText,
  DollarSign,
} from 'lucide-react';

interface ParentFeesViewProps {
  student: Student | null;
  feeDetail: StudentFeeDetail | null;
  payments: StudentFeePayment[];
}

export const ParentFeesView: React.FC<ParentFeesViewProps> = ({
  student,
  feeDetail,
  payments,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<StudentFeePayment | null>(null);
  const [isPayFeeModalOpen, setIsPayFeeModalOpen] = useState<boolean>(false);

  if (!student) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
        Please select a child to view fee records.
      </div>
    );
  }

  const isChildDisabled = student.status === 'DISABLED';

  const totalFee = feeDetail?.totalFee || 0;
  const paidAmount = feeDetail?.paidAmount || 0;
  const pendingAmount = feeDetail?.pendingAmount || 0;
  const status = feeDetail?.status || (pendingAmount === 0 && totalFee > 0 ? 'PAID' : pendingAmount > 0 ? 'PENDING' : 'PAID');

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Dues Cleared</span>
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Partially Paid</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-black uppercase tracking-wider border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Payment Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Fee Ledger & Receipts</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Student: <span className="font-bold text-gray-800">{student.name}</span> ({student.studentId}) • Class {student.className} - {student.section}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPayFeeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFC907] hover:bg-[#e6b400] text-[#001c46] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4 text-[#001c46]" />
          <span>Pay Online (Coming Soon)</span>
        </button>
      </div>

      {/* Disabled Account Notice */}
      {isChildDisabled && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>This student account is currently inactive. Viewing archived fee ledgers and issued payment receipts.</span>
        </div>
      )}

      {/* Fee Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Fee */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Total Academic Fee
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#001c46]">
            ₹{totalFee.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Academic Session 2026-2027
          </p>
        </div>

        {/* Paid Amount */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
            Amount Paid
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            ₹{paidAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-800 font-medium">
            Verified across {payments.length} transaction(s)
          </p>
        </div>

        {/* Pending Amount */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
            Pending Dues
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            ₹{pendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="pt-1">
            {getStatusBadge(status)}
          </div>
        </div>
      </div>

      {/* Verified Payment Receipts Table */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-[#001c46]" />
            <div>
              <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
                Verified Payment Receipts
              </h3>
              <p className="text-xs text-gray-400">
                Official computerized fee payment receipts for your child
              </p>
            </div>
          </div>

          <span className="text-xs bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-bold text-gray-700">
            Total Receipts: {payments.length}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-gray-300" />
            <p className="font-medium">No fee payment receipts recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#001c46] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Receipt Number</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Fee Type</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3">Reference / Txn ID</th>
                  <th className="px-4 py-3 text-center">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {payments.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {p.receiptNumber}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {p.paymentDate}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#001c46]">
                      {p.feeType}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-700 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[11px]">
                        {p.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-[11px] font-mono">
                      {p.referenceNumber || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#FFC907]" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <FeeReceiptModal
          payment={selectedReceipt}
          student={student}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Online Fee Payment Modal (Coming Soon) */}
      <OnlineFeePaymentModal
        student={student}
        pendingAmount={pendingAmount}
        isOpen={isPayFeeModalOpen}
        onClose={() => setIsPayFeeModalOpen(false)}
      />
    </div>
  );
};
