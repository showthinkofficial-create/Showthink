import React from 'react';
import { Student } from '../../types/student';
import { ExamResult } from '../../types/result';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Printer,
} from 'lucide-react';
import { printElementById } from '../../lib/printUtils';

interface ParentResultsViewProps {
  student: Student | null;
  results: ExamResult[];
}

export const ParentResultsView: React.FC<ParentResultsViewProps> = ({
  student,
  results,
}) => {
  if (!student) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
        Please select a child to view published academic results.
      </div>
    );
  }

  const isChildDisabled = student.status === 'DISABLED';

  const computeGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A1 (Outstanding)';
    if (percentage >= 80) return 'A2 (Excellent)';
    if (percentage >= 70) return 'B1 (Very Good)';
    if (percentage >= 60) return 'B2 (Good)';
    if (percentage >= 50) return 'C1 (Above Average)';
    if (percentage >= 40) return 'C2 (Average)';
    if (percentage >= 33) return 'D (Pass)';
    return 'E (Needs Improvement)';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Academic Results & Performance</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Student: <span className="font-bold text-gray-800">{student.name}</span> ({student.studentId}) • Class {student.className} - {student.section}
          </p>
        </div>

        <div className="text-xs bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-gray-600 font-semibold self-start sm:self-auto">
          Published Exams: <span className="font-bold text-[#001c46]">{results.length}</span>
        </div>
      </div>

      {/* Disabled Account Notice */}
      {isChildDisabled && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>This student account is currently inactive. Viewing previously published evaluation reports.</span>
        </div>
      )}

      {/* Results Content */}
      {results.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3 shadow-xs">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Published Results Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Exam scores and official report cards will appear here once finalized and published by the Examination Cell.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result) => {
            const isPassed = result.status === 'PASSED';
            const grade = computeGrade(result.percentage);

            return (
              <div
                key={result.id}
                id={`printable-result-${result.id}`}
                className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden"
              >
                {/* Header Strip */}
                <div className="bg-[#001c46] text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC907] bg-white/10 px-2.5 py-0.5 rounded-md">
                        {result.academicSession || 'Session 2026-2027'}
                      </span>
                      <span className="text-xs text-gray-300 font-medium">
                        Board: {result.board || 'CBSE'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {result.examName}
                    </h3>
                  </div>

                  {/* Pass/Fail, Percentage & Print Button */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-300 uppercase font-bold block">
                        Aggregate Score
                      </span>
                      <span className="text-2xl font-black text-[#FFC907]">
                        {result.percentage}%
                      </span>
                    </div>
                    <div
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                        isPassed
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-red-500 text-white shadow-sm'
                      }`}
                    >
                      {result.status}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        printElementById(`printable-result-${result.id}`, {
                          title: `Result_${student.name}_${result.examName}`,
                          landscape: false,
                        })
                      }
                      className="print:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-[#FFC907] hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border border-white/20 active:scale-95"
                      title="Print Report Card"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FFC907]" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Score Table */}
                <div className="p-6 space-y-5">
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3">Subject</th>
                          <th className="px-4 py-3 text-center">Marks Obtained</th>
                          <th className="px-4 py-3 text-center">Maximum Marks</th>
                          <th className="px-4 py-3 text-right">Percentage / Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                        {result.subjects && result.subjects.length > 0 ? (
                          result.subjects.map((sub, sIdx) => {
                            const subPct = sub.maxMarks > 0 ? Math.round((sub.marksObtained / sub.maxMarks) * 100) : 0;
                            return (
                              <tr key={sIdx} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                                  <BookOpen className="w-3.5 h-3.5 text-[#001c46]" />
                                  <span>{sub.subject}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-gray-900">
                                  {sub.marksObtained}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-500">
                                  {sub.maxMarks}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-[#001c46]">
                                  {subPct}%
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                              Subject-wise breakdown not available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {/* Table Footer Total Row */}
                      <tfoot className="bg-gray-50/90 font-black text-gray-900 border-t border-gray-200 text-xs">
                        <tr>
                          <td className="px-4 py-3.5 uppercase text-[10px] text-gray-500 tracking-wider">
                            Grand Total
                          </td>
                          <td className="px-4 py-3.5 text-center text-emerald-700 text-sm">
                            {result.totalObtained}
                          </td>
                          <td className="px-4 py-3.5 text-center text-gray-600">
                            {result.totalMax}
                          </td>
                          <td className="px-4 py-3.5 text-right text-emerald-700 text-sm">
                            {result.percentage}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Official Evaluation Grade
                      </span>
                      <span className="font-black text-[#001c46] text-sm">
                        {grade}
                      </span>
                    </div>

                    {result.remarks && (
                      <div className="bg-amber-50/80 border border-amber-100 px-3.5 py-1.5 rounded-xl text-amber-900 text-xs font-medium max-w-md">
                        <span className="font-bold">Remarks:</span> {result.remarks}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
