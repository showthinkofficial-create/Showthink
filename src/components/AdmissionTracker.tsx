import React, { useState, useEffect } from 'react';
import { AdmissionEnquiry } from '../types';
import { Search, Eye, Edit2, Trash2, CheckCircle, Calendar, Sparkles } from 'lucide-react';

export default function AdmissionTracker() {
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState<AdmissionEnquiry[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit fields state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGrade, setEditGrade] = useState('');

  // Load enquiries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gp_academy_enquiries');
    if (saved) {
      try {
        setEnquiries(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading enquiries', e);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) {
      setSearchResults(null);
      return;
    }
    const filtered = enquiries.filter(
      (enq) => enq.phone.includes(searchPhone.trim()) || enq.parentName.toLowerCase().includes(searchPhone.trim().toLowerCase())
    );
    setSearchResults(filtered);
  };

  const deleteEnquiry = (id: string) => {
    if (window.confirm('Are you sure you want to withdraw this admission enquiry?')) {
      const updated = enquiries.filter((enq) => enq.id !== id);
      setEnquiries(updated);
      localStorage.setItem('gp_academy_enquiries', JSON.stringify(updated));
      if (searchResults) {
        setSearchResults(searchResults.filter((enq) => enq.id !== id));
      }
    }
  };

  const startEditing = (enq: AdmissionEnquiry) => {
    setEditingId(enq.id);
    setEditName(enq.studentName);
    setEditPhone(enq.phone);
    setEditGrade(enq.admissionClass || (enq as any).grade || '');
  };

  const saveEdit = (id: string) => {
    if (!editName.trim() || !editPhone.trim()) {
      alert('Please fill out the required fields.');
      return;
    }
    const updated = enquiries.map((enq) => {
      if (enq.id === id) {
        return {
          ...enq,
          studentName: editName,
          phone: editPhone,
          admissionClass: editGrade,
          grade: editGrade,
        };
      }
      return enq;
    });

    setEnquiries(updated);
    localStorage.setItem('gp_academy_enquiries', JSON.stringify(updated));
    setEditingId(null);

    if (searchResults) {
      setSearchResults(
        searchResults.map((enq) => {
          if (enq.id === id) {
            return {
              ...enq,
              studentName: editName,
              phone: editPhone,
              admissionClass: editGrade,
              grade: editGrade,
            };
          }
          return enq;
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 md:p-8 max-w-4xl mx-auto my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#FFC907]" /> Dynamic Portal
          </span>
          <h3 className="text-2xl font-sans font-extrabold text-[#001c46]">
            Track Your Admission Enquiry
          </h3>
          <p className="text-sm text-gray-500">
            Search, modify, or view the live status of submitted admission applications.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block font-mono">Database Source</span>
          <span className="px-2.5 py-1 rounded bg-green-50 text-green-700 font-mono text-[11px] font-bold inline-block border border-green-200">
            Client-Side Storage Active
          </span>
        </div>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter Parent Name or Mobile Number..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001c46] transition-all text-sm font-semibold"
          />
        </div>
        <button
          type="submit"
          className="bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
        >
          Track Status
        </button>
      </form>

      {/* Results Section */}
      {searchResults !== null ? (
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">
            Found {searchResults.length} Application(s)
          </h4>
          {searchResults.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 font-semibold">
                No submissions found matching that criteria. Please double check the phone number or name.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((enq) => (
                <div
                  key={enq.id}
                  className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* Status Indicator pill */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        enq.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : enq.status === 'Scheduled for Interview'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'Reviewing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>

                  {editingId === enq.id ? (
                    /* Edit Mode Form */
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Student Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">
                            Grade
                          </label>
                          <input
                            type="text"
                            value={editGrade}
                            onChange={(e) => setEditGrade(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(enq.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#001c46] text-white hover:bg-[#1a325d] rounded-lg transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal View */
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                          Application ID: {enq.id}
                        </span>
                        <h5 className="font-sans font-extrabold text-gray-800 text-base">
                          {enq.studentName}
                        </h5>
                        <p className="text-xs text-gray-500">
                          Parent: <strong className="text-gray-700">{enq.parentName}</strong> | Applied for: <strong className="text-gray-700">{enq.grade} ({enq.board})</strong>
                          {enq.studentAge && (
                            <> | Student's Age: <strong className="text-gray-700">{enq.studentAge} Yrs</strong></>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied: {new Date(enq.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                          Phone: {enq.phone}
                        </span>
                        
                        {/* Control actions */}
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => startEditing(enq)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                            title="Edit Details"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => deleteEnquiry(enq.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                            title="Withdraw Application"
                          >
                            <Trash2 className="w-4 h-4" /> Withdraw
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty / CTA State */
        <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
            Have you already submitted an admission or counselling form? Type in your phone number above to see submission timeline updates and secure your tie and belt items!
          </p>
        </div>
      )}
    </div>
  );
}
