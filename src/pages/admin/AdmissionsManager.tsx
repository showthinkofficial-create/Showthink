import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Eye,
  Inbox,
  ArrowLeft,
  Calendar,
  Phone,
  User,
  GraduationCap,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Lock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AdmissionEnquiry,
  AdmissionEnquiryNote,
  AdmissionEnquiryStatus,
  AdmissionFilterOptions,
  ADMISSION_STATUS_CONFIG
} from '../../types/admission';
import { admissionService } from '../../services/admissionService';
import { studentService } from '../../services/studentService';
import { CLASS_OPTIONS } from '../../types/student';

interface AdmissionsManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const PAGE_SIZE = 15;

export default function AdmissionsManager({ currentPath, onNavigate }: AdmissionsManagerProps) {
  const { userProfile } = useAuth();
  const isAdminOrSuperAdmin = userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';
  const isSuperAdmin = userProfile?.role === 'SUPER_ADMIN';

  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search State
  const [filters, setFilters] = useState<AdmissionFilterOptions>({
    searchQuery: '',
    grade: '',
    status: '',
    date: '',
    session: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Detail View State
  const [activeEnquiry, setActiveEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [activeNotes, setActiveNotes] = useState<AdmissionEnquiryNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Status Change State
  const [selectedStatus, setSelectedStatus] = useState<AdmissionEnquiryStatus>('NEW');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [followUpNote, setFollowUpNote] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Modal dialog states
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Parse path: /admin/admissions or /admin/admissions/:id
  const activeEnquiryId = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    const parts = cleanPath.split('/admin/admissions/');
    if (!parts[1]) return null;
    return parts[1];
  }, [currentPath]);

  // Load enquiries
  const loadEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await admissionService.getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load admission enquiries:', err);
      setError('Unable to fetch admission enquiries from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrSuperAdmin) {
      loadEnquiries();
    }
  }, [isAdminOrSuperAdmin]);

  // Load active enquiry detail if URL has an ID
  useEffect(() => {
    if (activeEnquiryId && isAdminOrSuperAdmin) {
      const found = enquiries.find((e) => e.id === activeEnquiryId || e.enquiryId === activeEnquiryId);
      if (found) {
        setActiveEnquiry(found);
        setSelectedStatus(found.status);
        setFollowUpDate(found.followUpDate || '');
        setFollowUpNote(found.followUpNote || '');
      } else {
        // Fetch from Firestore directly in case list is reloading
        admissionService.getEnquiryById(activeEnquiryId).then((data) => {
          if (data) {
            setActiveEnquiry(data);
            setSelectedStatus(data.status);
            setFollowUpDate(data.followUpDate || '');
            setFollowUpNote(data.followUpNote || '');
          }
        }).catch((err) => console.error(err));
      }
    } else {
      setActiveEnquiry(null);
    }
  }, [activeEnquiryId, enquiries, isAdminOrSuperAdmin]);

  // Load notes for active enquiry
  useEffect(() => {
    if (activeEnquiry) {
      setLoadingNotes(true);
      admissionService.getNotes(activeEnquiry.id).then((notesList) => {
        setActiveNotes(notesList);
      }).catch((err) => console.error(err)).finally(() => {
        setLoadingNotes(false);
      });
    } else {
      setActiveNotes([]);
    }
  }, [activeEnquiry]);

  // Filtered & Searched Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      // Real-time search by Enquiry ID, Student Name, Parent Name, Phone
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const idMatch = enq.enquiryId.toLowerCase().includes(q);
        const studentMatch = (enq.studentName || enq.submittedFormData?.studentName || '').toLowerCase().includes(q);
        const parentMatch = (enq.parentName || enq.submittedFormData?.parentName || '').toLowerCase().includes(q);
        const phoneMatch = (enq.phone || enq.submittedFormData?.phone || '').includes(q);
        if (!idMatch && !studentMatch && !parentMatch && !phoneMatch) {
          return false;
        }
      }

      // Grade/Class Filter
      if (filters.grade) {
        const enqGrade = enq.grade || enq.submittedFormData?.grade || '';
        if (enqGrade !== filters.grade) return false;
      }

      // Status Filter
      if (filters.status && enq.status !== filters.status) {
        return false;
      }

      // Date Filter (YYYY-MM-DD)
      if (filters.date) {
        const enqDate = enq.submittedAt ? enq.submittedAt.split('T')[0] : '';
        if (enqDate !== filters.date) return false;
      }

      // Session Filter (e.g. 2026)
      if (filters.session) {
        const enqYear = enq.submittedAt ? new Date(enq.submittedAt).getFullYear().toString() : '';
        if (enqYear !== filters.session) return false;
      }

      return true;
    });
  }, [enquiries, filters]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredEnquiries.length / PAGE_SIZE);
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEnquiries.slice(start, start + PAGE_SIZE);
  }, [filteredEnquiries, currentPage]);

  // Handle Status Update
  const handleUpdateStatus = async () => {
    if (!activeEnquiry) return;
    setIsUpdatingStatus(true);
    try {
      await admissionService.updateStatus(activeEnquiry.id, selectedStatus, {
        followUpDate: selectedStatus === 'FOLLOW_UP' ? followUpDate : undefined,
        followUpNote: selectedStatus === 'FOLLOW_UP' ? followUpNote : undefined,
      });
      await loadEnquiries();
      const updated = await admissionService.getEnquiryById(activeEnquiry.id);
      if (updated) setActiveEnquiry(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Add Internal Admin Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEnquiry || !newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      const createdByName = userProfile?.displayName || userProfile?.email || 'Admin';
      const addedNote = await admissionService.addNote(activeEnquiry.id, newNoteText.trim(), createdByName);
      setActiveNotes((prev) => [addedNote, ...prev]);
      setNewNoteText('');
    } catch (err) {
      console.error('Failed to add note:', err);
      alert('Failed to save internal note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle Convert to Student
  const handleConfirmConvert = () => {
    setShowConvertModal(false);
    if (!activeEnquiry) return;

    // Store enquiry prefill info in sessionStorage or pass state so StudentForm can prefill!
    const prefillData = {
      fromEnquiryId: activeEnquiry.id,
      enquiryCode: activeEnquiry.enquiryId,
      name: activeEnquiry.studentName || activeEnquiry.submittedFormData?.studentName || '',
      parentName: activeEnquiry.parentName || activeEnquiry.submittedFormData?.parentName || '',
      phone: activeEnquiry.phone || activeEnquiry.submittedFormData?.phone || '',
      className: activeEnquiry.grade || activeEnquiry.submittedFormData?.grade || 'Class 1',
      board: activeEnquiry.board || activeEnquiry.submittedFormData?.board || 'CBSE',
      previousSchool: activeEnquiry.previousSchool || activeEnquiry.submittedFormData?.previousSchool || '',
    };
    sessionStorage.setItem('gp_convert_enquiry', JSON.stringify(prefillData));

    // Navigate to student creation view
    onNavigate('/admin/students/add');
  };

  // Handle Permanent Delete (SUPER_ADMIN only)
  const handleConfirmDelete = async () => {
    if (!activeEnquiry) return;
    setIsDeleting(true);
    try {
      await admissionService.deleteEnquiry(activeEnquiry.id);
      setShowDeleteModal(false);
      await loadEnquiries();
      onNavigate('/admin/admissions');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      alert('Failed to delete enquiry record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Role Access Restriction Guard
  if (!isAdminOrSuperAdmin) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-4 max-w-md mx-auto font-sans">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-[#001c46]">Access Restricted</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Admission enquiry records are accessible strictly by Authorized Administrators only. Faculty teachers and students are restricted.
        </p>
        <button
          onClick={() => onNavigate('/admin')}
          className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // RENDER DETAIL VIEW (/admin/admissions/:id)
  if (activeEnquiryId) {
    if (loading) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 font-sans">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading admission enquiry details...</p>
        </div>
      );
    }

    if (!activeEnquiry) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-4 font-sans max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-black text-[#001c46]">Enquiry Record Not Found</h3>
          <p className="text-xs text-gray-500">The requested admission enquiry ID does not exist or was removed.</p>
          <button
            onClick={() => onNavigate('/admin/admissions')}
            className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold"
          >
            Back to All Enquiries
          </button>
        </div>
      );
    }

    const statusConfig = ADMISSION_STATUS_CONFIG[activeEnquiry.status] || ADMISSION_STATUS_CONFIG.NEW;

    return (
      <div className="space-y-6 font-sans max-w-5xl mx-auto">
        {/* Top Navigation & Status Banner */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => onNavigate('/admin/admissions')}
              className="p-2 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Back to All Enquiries"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#001c46] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {activeEnquiry.enquiryId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#001c46] tracking-tight mt-1">
                {activeEnquiry.studentName || activeEnquiry.submittedFormData?.studentName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Convert to Student Action Button */}
            {activeEnquiry.convertedStudentId ? (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1.5 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Already converted to student.</span>
                <button
                  onClick={() => onNavigate('/admin/students')}
                  className="ml-2 underline text-purple-800 hover:text-purple-950 font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Students</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConvertModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#FFC907]" />
                <span>Convert to Student</span>
              </button>
            )}

            {/* Close Enquiry Button */}
            {activeEnquiry.status !== 'CLOSED' && (
              <button
                onClick={() => {
                  setSelectedStatus('CLOSED');
                  admissionService.updateStatus(activeEnquiry.id, 'CLOSED').then(() => {
                    loadEnquiries();
                  });
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Enquiry
              </button>
            )}

            {/* Delete Button (SUPER_ADMIN only) */}
            {isSuperAdmin && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Permanently Delete Enquiry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Submitted Enquiry Information (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Submitted Form Data Details Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FFC907]" /> Submitted Application Information
                </h3>
                <span className="text-[11px] font-medium text-gray-400">
                  Submitted: {new Date(activeEnquiry.submittedAt || activeEnquiry.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                
                {/* Student Name */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Student Full Name
                  </span>
                  <span className="text-sm font-extrabold text-[#001c46] block mt-0.5">
                    {activeEnquiry.studentName || activeEnquiry.submittedFormData?.studentName || '—'}
                  </span>
                </div>

                {/* Parent / Guardian Name */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Parent / Guardian Name
                  </span>
                  <span className="text-sm font-extrabold text-[#001c46] block mt-0.5">
                    {activeEnquiry.parentName || activeEnquiry.submittedFormData?.parentName || '—'}
                  </span>
                </div>

                {/* Contact Phone */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600" /> Contact Mobile Number
                  </span>
                  <a
                    href={`tel:${activeEnquiry.phone || activeEnquiry.submittedFormData?.phone}`}
                    className="text-sm font-mono font-black text-blue-900 hover:underline block mt-0.5"
                  >
                    +91 {activeEnquiry.phone || activeEnquiry.submittedFormData?.phone || '—'}
                  </a>
                </div>

                {/* Requested Grade / Class */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-amber-600" /> Requested Grade Level
                  </span>
                  <span className="text-sm font-extrabold text-[#001c46] block mt-0.5">
                    {activeEnquiry.grade || activeEnquiry.submittedFormData?.grade || '—'}
                  </span>
                </div>

                {/* Preferred Board */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Preferred Academic Board
                  </span>
                  <span className="text-sm font-extrabold text-[#001c46] block mt-0.5">
                    {activeEnquiry.board || activeEnquiry.submittedFormData?.board || 'CBSE'}
                  </span>
                </div>

                {/* Student Age */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Student's Age
                  </span>
                  <span className="text-sm font-extrabold text-[#001c46] block mt-0.5">
                    {(activeEnquiry.studentAge || activeEnquiry.submittedFormData?.studentAge)
                      ? `${activeEnquiry.studentAge || activeEnquiry.submittedFormData?.studentAge} Years`
                      : '—'}
                  </span>
                </div>

                {/* Previous School */}
                <div className="sm:col-span-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Previous School
                  </span>
                  <span className="text-xs font-semibold text-gray-800 block mt-0.5">
                    {activeEnquiry.previousSchool || activeEnquiry.submittedFormData?.previousSchool || 'Not Specified / Fresh Entry'}
                  </span>
                </div>

                {/* Additional Remarks */}
                <div className="sm:col-span-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Additional Remarks / Parent Notes
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed block mt-1 italic">
                    "{activeEnquiry.remarks || activeEnquiry.submittedFormData?.remarks || 'No specific remarks provided.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Admin Notes Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#FFC907]" /> Internal Admin Notes
                  </h3>
                  <p className="text-[11px] text-gray-400">Private internal remarks (not visible on public website)</p>
                </div>
                <span className="text-xs font-bold text-[#001c46] bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {activeNotes.length} Notes
                </span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={2}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Parent requested callback tomorrow at 4 PM..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteText.trim()}
                    className="px-4 py-2 bg-[#001c46] hover:bg-[#1a325d] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isAddingNote ? 'Saving...' : 'Add Private Note'}
                  </button>
                </div>
              </form>

              {/* Notes History Feed */}
              {loadingNotes ? (
                <p className="text-xs text-gray-400 italic py-2">Loading notes log...</p>
              ) : activeNotes.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2 text-center bg-gray-50 rounded-2xl">
                  No internal notes added yet. Use the form above to add private call logs or counselor notes.
                </p>
              ) : (
                <div className="space-y-3 pt-2">
                  {activeNotes.map((nt) => (
                    <div key={nt.id} className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#001c46]">{nt.createdBy}</span>
                        <span className="text-gray-400 font-medium">
                          {new Date(nt.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-800 leading-relaxed font-medium">{nt.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Status & Follow-up Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Status Management Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFC907]" /> Manage Enquiry Status
                </h3>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Change Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as AdmissionEnquiryStatus)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
                  >
                    <option value="NEW">NEW (Fresh Enquiry)</option>
                    <option value="CONTACTED">CONTACTED (Parent Called)</option>
                    <option value="FOLLOW_UP">FOLLOW_UP (Scheduled Callback)</option>
                    <option value="ADMISSION_CONFIRMED">ADMISSION_CONFIRMED (Joined)</option>
                    <option value="NOT_INTERESTED">NOT_INTERESTED (Closed/Declined)</option>
                    <option value="CLOSED">CLOSED (Archived / Completed)</option>
                  </select>
                </div>

                {/* Follow-Up Fields (if status == FOLLOW_UP) */}
                {selectedStatus === 'FOLLOW_UP' && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                    <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">
                      Follow-Up Details
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">
                        Scheduled Follow-Up Date
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">
                        Follow-Up Note
                      </label>
                      <textarea
                        rows={2}
                        value={followUpNote}
                        onChange={(e) => setFollowUpNote(e.target.value)}
                        placeholder="e.g. Call parent after 5 PM regarding document verification..."
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="w-full py-2.5 bg-[#001c46] hover:bg-[#1a325d] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingStatus ? 'Updating Status...' : 'Save Status Update'}
                </button>
              </div>
            </div>

            {/* Current Follow-up Banner if recorded */}
            {activeEnquiry.status === 'FOLLOW_UP' && activeEnquiry.followUpDate && (
              <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest bg-amber-200/80 px-2 py-0.5 rounded inline-block">
                  Active Follow-Up Scheduled
                </span>
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-950">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>Date: {activeEnquiry.followUpDate}</span>
                </div>
                {activeEnquiry.followUpNote && (
                  <p className="text-xs text-amber-900 leading-relaxed font-medium pt-1 border-t border-amber-200/60">
                    "{activeEnquiry.followUpNote}"
                  </p>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Modal: Confirm Convert to Student */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-gray-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-[#001c46]">
                  Convert to Student Record?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Convert this admission enquiry for <strong>{activeEnquiry.studentName}</strong> into an official student record?
                </p>
                <div className="p-3 bg-blue-50 text-blue-900 text-left rounded-2xl text-[11px] font-medium space-y-1">
                  <p className="font-bold">Next Steps:</p>
                  <p>• Opens student creation form with pre-filled name, parent contact, and requested class.</p>
                  <p>• Review and complete mandatory student details before saving.</p>
                  <p>• Enquiry status will automatically update to <strong>ADMISSION_CONFIRMED</strong> upon saving.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConvert}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Proceed to Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete (SUPER_ADMIN) */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-gray-100">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-[#001c46]">
                  Permanently Delete Enquiry?
                </h3>
                <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                  Are you sure you want to permanently delete enquiry record <strong>{activeEnquiry.enquiryId}</strong> ({activeEnquiry.studentName})? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // RENDER LIST DIRECTORY VIEW (/admin/admissions)
  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#001c46] text-[#FFC907] rounded-2xl shadow-2xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#001c46] tracking-tight">Admission Applications</h2>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Review and process public admission enquiries from website visitors.
            </p>
          </div>
        </div>

        <button
          onClick={loadEnquiries}
          className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#001c46] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadEnquiries}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-[11px] font-extrabold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filters Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Real-time Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Enquiry ID, Student Name, Parent Name, Phone..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            />
          </div>

          {/* Class Filter */}
          <div className="md:col-span-2">
            <select
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="FOLLOW_UP">FOLLOW UP</option>
              <option value="ADMISSION_CONFIRMED">CONFIRMED</option>
              <option value="NOT_INTERESTED">NOT INTERESTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  grade: '',
                  status: '',
                  date: '',
                  session: '',
                })
              }
              className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Reset
            </button>
          </div>

        </div>
      </div>

      {/* Directory Table / Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading admission enquiries from Firestore...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#001c46]">No enquiries found.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {enquiries.length === 0
                ? 'When parents submit online admission forms on the GP Academy website, they will automatically appear here.'
                : 'No admission enquiry records match your search and filter settings.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-gray-50 text-[#001c46] uppercase font-extrabold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Enquiry ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Parent Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {paginatedEnquiries.map((enq) => {
                  const cfg = ADMISSION_STATUS_CONFIG[enq.status] || ADMISSION_STATUS_CONFIG.NEW;
                  const dateStr = enq.submittedAt
                    ? new Date(enq.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '—';

                  return (
                    <tr key={enq.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-[#001c46]">
                        {enq.enquiryId}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#001c46]">
                        {enq.studentName || enq.submittedFormData?.studentName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {enq.grade || enq.submittedFormData?.grade}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {enq.parentName || enq.submittedFormData?.parentName}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-800">
                        +91 {enq.phone || enq.submittedFormData?.phone}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onNavigate(`/admin/admissions/${enq.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#001c46] rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
            {paginatedEnquiries.map((enq) => {
              const cfg = ADMISSION_STATUS_CONFIG[enq.status] || ADMISSION_STATUS_CONFIG.NEW;
              const dateStr = enq.submittedAt
                ? new Date(enq.submittedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : '—';

              return (
                <div
                  key={enq.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 font-sans"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-[#001c46] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {enq.enquiryId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-base font-black text-[#001c46]">
                      {enq.studentName || enq.submittedFormData?.studentName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Grade: <strong className="text-gray-800">{enq.grade || enq.submittedFormData?.grade}</strong>
                    </p>
                  </div>

                  <div className="text-xs space-y-1 pt-2 border-t border-gray-100 text-gray-600">
                    <p>Parent: <strong className="text-gray-900">{enq.parentName || enq.submittedFormData?.parentName}</strong></p>
                    <p>Phone: <strong className="text-gray-900 font-mono">+91 {enq.phone || enq.submittedFormData?.phone}</strong></p>
                    <p>Submitted: <span className="text-gray-500">{dateStr}</span></p>
                  </div>

                  <button
                    onClick={() => onNavigate(`/admin/admissions/${enq.id}`)}
                    className="w-full py-2 bg-[#001c46] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FFC907]" />
                    <span>View Enquiry</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between text-xs font-sans">
              <span className="text-gray-500 font-medium">
                Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredEnquiries.length} records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
