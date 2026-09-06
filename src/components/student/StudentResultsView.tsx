import React, { useState } from 'react';
import {
  Award,
  FileText,
  Printer,
  X,
  CheckCircle,
  TrendingUp,
  XCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { ExamResult } from '../../types/result';
import Logo from '../Logo';
import { printElementById } from '../../lib/printUtils';

interface StudentResultsViewProps {
  results: ExamResult[];
}

export const StudentResultsView: React.FC<StudentResultsViewProps> = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  // Only show PUBLISHED results
  const publishedResults = results.filter((r) => r.status === 'PUBLISHED');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#001c46]">
            <Award className="w-6 h-6 text-[#FFC907]" />
            <h1 className="text-xl font-black">Academic Examination Results</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Official published exam marksheets and performance evaluations.
          </p>
        </div>

        <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black uppercase">
          {publishedResults.length} Published Marksheets
        </div>
      </div>

      {/* Results List */}
      {publishedResults.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800">No Published Results Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Your examination results will appear here as soon as they are finalized and published by GP Academy Examination Department.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publishedResults.map((result) => {
            const isPassed = result.resultStatus === 'PASSED';
            return (
              <div
                key={result.id}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5 flex flex-col justify-between hover:border-[#001c46] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 bg-[#001c46] text-[#FFC907] text-[10px] font-black rounded-md uppercase tracking-wider">
                        {result.academicSession || '2026-2027'}
                      </span>
                      <h3 className="font-black text-lg text-gray-900 mt-1">{result.examName}</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {result.className} ({result.section}) | Board: {result.board || 'CBSE'}
                      </p>
                    </div>

                    <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase text-center ${
                      isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.resultStatus}
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Marks</span>
                      <span className="font-black text-gray-900 text-sm">{result.totalMarksObtained} / {result.totalMaxMarks}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Percentage</span>
                      <span className="font-black text-[#001c46] text-sm">{result.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Grade</span>
                      <span className="font-black text-purple-700 text-sm">{result.grade || '—'}</span>
                    </div>
                  </div>

                  {/* Short Subjects Preview */}
                  <div className="text-xs space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Subject Breakdown</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {result.subjects.slice(0, 4).map((sub, idx) => (
                        <div key={idx} className="flex justify-between bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                          <span className="text-gray-600 font-medium truncate">{sub.subjectName}</span>
                          <span className="font-bold text-gray-900">{sub.marksObtained}/{sub.maxMarks}</span>
                        </div>
                      ))}
                    </div>
                    {result.subjects.length > 4 && (
                      <span className="text-[10px] text-gray-400 italic block">
                        +{result.subjects.length - 4} more subjects
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedResult(result)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#001c46] hover:bg-blue-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#FFC907]" />
                  <span>View Full Official Marksheet</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Marksheet Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl my-8 animate-scaleIn">
            <button
              onClick={() => setSelectedResult(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Marksheet Container */}
            <div id="printable-marksheet" className="space-y-6 border-4 border-[#001c46] p-6 sm:p-8 rounded-2xl bg-white relative">
              {/* Marksheet Header */}
              <div className="text-center space-y-2 border-b-2 border-gray-200 pb-6">
                <div className="flex items-center justify-center gap-3">
                  <Logo size={48} />
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-[#001c46] tracking-tight">GP ACADEMY</h2>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Official Marksheet & Academic Record</p>
                  </div>
                </div>
                <div className="pt-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {selectedResult.examName} — {selectedResult.academicSession || '2026-2027'}
                </div>
              </div>

              {/* Student Metadata Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase block text-[10px]">Student Name</span>
                  <span className="font-black text-gray-900">{selectedResult.studentName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase block text-[10px]">Student ID / Roll</span>
                  <span className="font-black text-gray-900">{selectedResult.studentId} / {selectedResult.rollNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase block text-[10px]">Class & Section</span>
                  <span className="font-black text-gray-900">{selectedResult.className} — {selectedResult.section}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase block text-[10px]">Board</span>
                  <span className="font-black text-gray-900">{selectedResult.board || 'CBSE'}</span>
                </div>
              </div>

              {/* Subject Marks Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#001c46] text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3 text-center">Max Marks</th>
                      <th className="px-4 py-3 text-center">Marks Obtained</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                    {selectedResult.subjects.map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{s.subjectName}</td>
                        <td className="px-4 py-3 text-center font-semibold">{s.maxMarks}</td>
                        <td className="px-4 py-3 text-center font-black text-gray-900">{s.marksObtained}</td>
                        <td className="px-4 py-3 text-center font-bold text-purple-700">{s.grade || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 uppercase font-black text-[#001c46]">Grand Total</td>
                      <td className="px-4 py-3 text-center font-black">{selectedResult.totalMaxMarks}</td>
                      <td className="px-4 py-3 text-center font-black text-emerald-700 text-sm">{selectedResult.totalMarksObtained}</td>
                      <td className="px-4 py-3 text-center font-black text-purple-700">{selectedResult.grade || '—'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Overall Summary Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs">
                <div>
                  <span className="text-gray-500 font-medium block">Overall Percentage</span>
                  <span className="text-xl font-black text-[#001c46]">{selectedResult.percentage}%</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Final Grade</span>
                  <span className="text-xl font-black text-purple-700">{selectedResult.grade || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Result Status</span>
                  <span className={`text-lg font-black uppercase ${
                    selectedResult.resultStatus === 'PASSED' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {selectedResult.resultStatus}
                  </span>
                </div>
              </div>

              {/* Remarks & Signatures */}
              {selectedResult.remarks && (
                <div className="p-3 bg-gray-50 rounded-xl text-xs border border-gray-200">
                  <span className="font-bold text-gray-700 block">Teacher Remarks:</span>
                  <p className="text-gray-600 italic mt-0.5">{selectedResult.remarks}</p>
                </div>
              )}

              <div className="flex justify-between items-end pt-8 text-xs font-bold text-gray-500">
                <div className="text-center">
                  <div className="border-b border-gray-400 w-32 mb-1" />
                  <span>Class Teacher</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-emerald-600 justify-center mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px]">Verified Digital Copy</span>
                  </div>
                  <span>Principal / Controller of Exams</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  printElementById('printable-marksheet', {
                    title: `Marksheet_${selectedResult.studentName}_${selectedResult.examName}`,
                    landscape: false,
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#001c46] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-[#FFC907]" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
