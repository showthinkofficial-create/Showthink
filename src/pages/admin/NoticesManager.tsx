import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  Paperclip,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  ArrowLeft,
  X,
  Upload,
  Calendar,
  Users,
  Building2,
  Lock,
  Download,
  AlertCircle,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Notice,
  NoticeFormData,
  NoticeFilterOptions,
  NoticeStatus,
  NoticePriority,
  TargetAudience,
  NOTICE_TYPE_PRESETS,
  TARGET_AUDIENCE_OPTIONS,
  PRIORITY_OPTIONS,
} from '../../types/notice';
import { noticeService } from '../../services/noticeService';

interface NoticesManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
];

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

export default function NoticesManager({ currentPath, onNavigate }: NoticesManagerProps) {
  const { userProfile } = useAuth();

  // Role validation: only SUPER_ADMIN and ADMIN
  const isAdminOrSuperAdmin = userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';

  // State
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<NoticeFilterOptions>({
    searchQuery: '',
    type: 'ALL',
    targetAudience: 'ALL',
    priority: 'ALL',
    status: 'ALL',
    date: '',
  });

  // Active Notice (for View or Edit)
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  // Modal / Confirm dialog states
  const [confirmPublishNotice, setConfirmPublishNotice] = useState<Notice | null>(null);
  const [confirmDeleteNotice, setConfirmDeleteNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    description: '',
    type: 'General Announcement',
    targetAudience: 'ALL_STUDENTS',
    targetClass: '',
    targetSection: '',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    priority: 'NORMAL',
    status: 'DRAFT',
    attachmentUrl: '',
    attachmentName: '',
    attachmentType: '',
  });
  const [customTypeInput, setCustomTypeInput] = useState<string>('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Routing View Mode
  const viewMode = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    if (cleanPath === '/admin/notices') return 'list';
    if (cleanPath === '/admin/notices/add') return 'add';
    if (cleanPath.endsWith('/edit')) return 'edit';
    return 'view';
  }, [currentPath]);

  // Extract notice ID from path
  const activeNoticeId = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    const parts = cleanPath.split('/admin/notices/');
    if (!parts[1]) return null;
    const subParts = parts[1].split('/');
    if (subParts[0] === 'add') return null;
    return subParts[0] || null;
  }, [currentPath]);

  // Load notices
  const loadNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticeService.getNotices(filters);
      setNotices(data);
    } catch (err: any) {
      console.error('Failed to load notices:', err);
      setError('Failed to fetch notices. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrSuperAdmin) {
      loadNotices();
    }
  }, [filters, isAdminOrSuperAdmin]);

  // Load active notice when viewing or editing
  useEffect(() => {
    if (activeNoticeId && (viewMode === 'view' || viewMode === 'edit')) {
      const fetchNotice = async () => {
        setLoading(true);
        const notice = await noticeService.getNoticeById(activeNoticeId);
        if (notice) {
          setActiveNotice(notice);
          if (viewMode === 'edit') {
            setFormData({
              title: notice.title,
              description: notice.description,
              type: notice.type,
              targetAudience: notice.targetAudience,
              targetClass: notice.targetClass || '',
              targetSection: notice.targetSection || '',
              publishDate: notice.publishDate,
              expiryDate: notice.expiryDate || '',
              priority: notice.priority,
              status: notice.status,
              attachmentUrl: notice.attachmentUrl || '',
              attachmentName: notice.attachmentName || '',
              attachmentType: notice.attachmentType || '',
            });
            if (!NOTICE_TYPE_PRESETS.includes(notice.type as any)) {
              setCustomTypeInput(notice.type);
            } else {
              setCustomTypeInput('');
            }
          }
        } else {
          setError('Notice not found.');
        }
        setLoading(false);
      };
      fetchNotice();
    } else if (viewMode === 'add') {
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'General Announcement',
        targetAudience: 'ALL_STUDENTS',
        targetClass: '',
        targetSection: '',
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        priority: 'NORMAL',
        status: 'DRAFT',
        attachmentUrl: '',
        attachmentName: '',
        attachmentType: '',
      });
      setCustomTypeInput('');
      setAttachmentFile(null);
      setAttachmentError(null);
    }
  }, [activeNoticeId, viewMode]);

  // Handle Attachment File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAttachmentError('File size exceeds 10MB limit.');
      return;
    }

    // Validate type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isDoc = fileExt === 'doc' || fileExt === 'docx' || fileExt === 'pdf' || fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg';

    if (!allowedTypes.includes(file.type) && !isDoc) {
      setAttachmentError('Invalid file type. Only PDF, Images (PNG/JPG), and Word documents are permitted.');
      return;
    }

    setAttachmentFile(file);

    // Convert file to base64 data URL for persistence
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      let attType = 'doc';
      if (file.type.startsWith('image/')) attType = 'image';
      else if (file.type.includes('pdf') || fileExt === 'pdf') attType = 'pdf';

      setFormData((prev) => ({
        ...prev,
        attachmentUrl: result,
        attachmentName: file.name,
        attachmentType: attType,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setFormData((prev) => ({
      ...prev,
      attachmentUrl: '',
      attachmentName: '',
      attachmentType: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submission (Add or Edit)
  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.title.trim()) {
      setError('Notice title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Notice description is required.');
      return;
    }

    const finalType = formData.type === 'Other' ? (customTypeInput.trim() || 'Other') : formData.type;
    if (!finalType) {
      setError('Please specify the Notice Type.');
      return;
    }

    if (formData.targetAudience === 'SPECIFIC_CLASS' && !formData.targetClass) {
      setError('Please select a target class.');
      return;
    }

    if (formData.targetAudience === 'SPECIFIC_SECTION' && (!formData.targetClass || !formData.targetSection)) {
      setError('Please select both target class and target section.');
      return;
    }

    if (!formData.publishDate) {
      setError('Publish date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NoticeFormData = {
        ...formData,
        type: finalType,
      };

      if (viewMode === 'add') {
        const created = await noticeService.createNotice(payload);
        setSuccessMsg(`Notice "${created.title}" created successfully.`);
      } else if (viewMode === 'edit' && activeNoticeId) {
        await noticeService.updateNotice(activeNoticeId, payload);
        setSuccessMsg(`Notice updated successfully.`);
      }

      await loadNotices();
      setTimeout(() => setSuccessMsg(null), 4000);
      onNavigate('/admin/notices');
    } catch (err: any) {
      console.error('Failed to save notice:', err);
      setError('Failed to save notice: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish Notice Handler
  const handleConfirmPublish = async () => {
    if (!confirmPublishNotice) return;
    setIsSubmitting(true);
    try {
      await noticeService.updateNoticeStatus(confirmPublishNotice.id, 'PUBLISHED');
      setSuccessMsg(`Notice "${confirmPublishNotice.title}" has been published.`);
      setConfirmPublishNotice(null);
      await loadNotices();
      if (activeNoticeId === confirmPublishNotice.id) {
        setActiveNotice((prev) => prev ? { ...prev, status: 'PUBLISHED' } : null);
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError('Failed to publish notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Archive Notice Handler
  const handleArchiveNotice = async (notice: Notice) => {
    setIsSubmitting(true);
    try {
      await noticeService.updateNoticeStatus(notice.id, 'ARCHIVED');
      setSuccessMsg(`Notice "${notice.title}" archived.`);
      await loadNotices();
      if (activeNoticeId === notice.id) {
        setActiveNotice((prev) => prev ? { ...prev, status: 'ARCHIVED' } : null);
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError('Failed to archive notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Notice Handler
  const handleConfirmDelete = async () => {
    if (!confirmDeleteNotice) return;
    setIsSubmitting(true);
    try {
      await noticeService.deleteNotice(confirmDeleteNotice.id);
      setSuccessMsg(`Notice deleted.`);
      setConfirmDeleteNotice(null);
      await loadNotices();
      setTimeout(() => setSuccessMsg(null), 4000);
      if (viewMode !== 'list') {
        onNavigate('/admin/notices');
      }
    } catch (err: any) {
      setError('Failed to delete notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Target audience badge label formatter
  const getAudienceLabel = (notice: Notice) => {
    switch (notice.targetAudience) {
      case 'ALL_STUDENTS': return 'All Students & Teachers';
      case 'STUDENTS': return 'Students Only';
      case 'TEACHERS': return 'Teachers Only';
      case 'SPECIFIC_CLASS': return `Class: ${notice.targetClass || 'Selected'}`;
      case 'SPECIFIC_SECTION': return `Class: ${notice.targetClass || ''} - Sec ${notice.targetSection || ''}`;
      default: return 'All';
    }
  };

  // If user is neither SUPER_ADMIN nor ADMIN
  if (!isAdminOrSuperAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12 shadow-sm font-sans">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-red-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-red-700 leading-relaxed mb-6">
          Notice Board management is restricted to Administrators and Super Administrators. Teachers and Students do not have permission to access <code className="bg-red-100 px-2 py-0.5 rounded font-mono">/admin/notices</code>.
        </p>
        <button
          onClick={() => onNavigate('/admin')}
          className="inline-flex items-center gap-2 bg-[#001c46] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#002866] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Error Notification */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW MODE 1: LIST / DIRECTORY (/admin/notices) */}
      {viewMode === 'list' && (
        <>
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div>
              <h1 className="text-xl font-black text-[#001c46] tracking-tight flex items-center gap-2.5">
                <Megaphone className="w-6 h-6 text-[#FFC907] shrink-0" />
                Notice Board Management
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Publish school announcements, holiday alerts, exam updates, and institutional notifications.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/notices/add')}
              className="inline-flex items-center justify-center gap-2 bg-[#001c46] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#002866] transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Notice
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or type..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                />
              </div>

              {/* Notice Type Filter */}
              <div className="md:col-span-2">
                <select
                  value={filters.type || 'ALL'}
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="ALL">All Notice Types</option>
                  {NOTICE_TYPE_PRESETS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Audience Filter */}
              <div className="md:col-span-2">
                <select
                  value={filters.targetAudience || 'ALL'}
                  onChange={(e) => setFilters((f) => ({ ...f, targetAudience: e.target.value }))}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="ALL">All Audiences</option>
                  {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="md:col-span-2">
                <select
                  value={filters.priority || 'ALL'}
                  onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={filters.status || 'ALL'}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filters.searchQuery || filters.type !== 'ALL' || filters.targetAudience !== 'ALL' || filters.priority !== 'ALL' || filters.status !== 'ALL' || filters.date) && (
              <div className="flex justify-end">
                <button
                  onClick={() => setFilters({ searchQuery: '', type: 'ALL', targetAudience: 'ALL', priority: 'ALL', status: 'ALL', date: '' })}
                  className="text-xs font-semibold text-gray-500 hover:text-[#001c46] flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#001c46]" />
              <p className="text-xs font-semibold">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            /* Empty States */
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-[#FFC907]" />
              </div>
              {filters.searchQuery || filters.type !== 'ALL' || filters.targetAudience !== 'ALL' || filters.priority !== 'ALL' || filters.status !== 'ALL' ? (
                <>
                  <h3 className="text-base font-bold text-gray-800">No notices found</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    No announcements match your search or filter parameters.
                  </p>
                  <button
                    onClick={() => setFilters({ searchQuery: '', type: 'ALL', targetAudience: 'ALL', priority: 'ALL', status: 'ALL', date: '' })}
                    className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold text-gray-800">No notices created yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Create institutional announcements to inform students, teachers, or specific classes.
                  </p>
                  <button
                    onClick={() => onNavigate('/admin/notices/add')}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#001c46] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#002866] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Notice
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Notice Title</th>
                        <th className="py-3.5 px-3">Type</th>
                        <th className="py-3.5 px-3">Target Audience</th>
                        <th className="py-3.5 px-3">Publish Date</th>
                        <th className="py-3.5 px-3">Priority</th>
                        <th className="py-3.5 px-3">Status</th>
                        <th className="py-3.5 px-3">Created By</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {notices.map((notice) => {
                        const isExpired = noticeService.isNoticeExpired(notice.expiryDate);
                        return (
                          <tr key={notice.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Title */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-bold text-gray-900 line-clamp-1 flex items-center gap-2">
                                {notice.title}
                                {notice.attachmentUrl && (
                                  <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" title="Has attachment" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{notice.description}</p>
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-3">
                              <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                                {notice.type}
                              </span>
                            </td>

                            {/* Audience */}
                            <td className="py-3.5 px-3 font-medium text-gray-700">
                              <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-[11px]">
                                <Users className="w-3 h-3 text-gray-400 shrink-0" />
                                {getAudienceLabel(notice)}
                              </span>
                            </td>

                            {/* Published Date */}
                            <td className="py-3.5 px-3 text-gray-600 font-medium whitespace-nowrap">
                              <div>{notice.publishDate}</div>
                              {isExpired && (
                                <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5">
                                  Expired
                                </span>
                              )}
                            </td>

                            {/* Priority */}
                            <td className="py-3.5 px-3">
                              {notice.priority === 'URGENT' ? (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  URGENT
                                </span>
                              ) : notice.priority === 'IMPORTANT' ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  IMPORTANT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  NORMAL
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              {notice.status === 'PUBLISHED' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  PUBLISHED
                                </span>
                              ) : notice.status === 'ARCHIVED' ? (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  <Archive className="w-3 h-3 text-gray-400" />
                                  ARCHIVED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  DRAFT
                                </span>
                              )}
                            </td>

                            {/* Created By */}
                            <td className="py-3.5 px-3 text-gray-500 font-medium text-[11px] whitespace-nowrap">
                              {notice.createdBy || 'Admin'}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {/* View */}
                                <button
                                  onClick={() => onNavigate(`/admin/notices/${notice.id}`)}
                                  className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors"
                                  title="View Notice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => onNavigate(`/admin/notices/${notice.id}/edit`)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Notice"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Publish (if Draft or Archived) */}
                                {notice.status !== 'PUBLISHED' && (
                                  <button
                                    onClick={() => setConfirmPublishNotice(notice)}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Publish Notice"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Archive (if Published) */}
                                {notice.status === 'PUBLISHED' && (
                                  <button
                                    onClick={() => handleArchiveNotice(notice)}
                                    className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Archive Notice"
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Delete */}
                                <button
                                  onClick={() => setConfirmDeleteNotice(notice)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Notice"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE NOTICE CARDS */}
              <div className="md:hidden space-y-3">
                {notices.map((notice) => {
                  const isExpired = noticeService.isNoticeExpired(notice.expiryDate);
                  return (
                    <div key={notice.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] mb-1">
                            {notice.type}
                          </span>
                          <h3 className="font-bold text-gray-900 text-sm leading-snug">{notice.title}</h3>
                        </div>

                        {/* Priority Badge */}
                        {notice.priority === 'URGENT' ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            URGENT
                          </span>
                        ) : notice.priority === 'IMPORTANT' ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            IMPORTANT
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                            NORMAL
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2">{notice.description}</p>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 font-medium">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          <Users className="w-3 h-3 text-gray-400" />
                          {getAudienceLabel(notice)}
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {notice.publishDate}
                        </div>
                        {isExpired && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Expired
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          notice.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                          notice.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {notice.status}
                        </span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">By {notice.createdBy}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onNavigate(`/admin/notices/${notice.id}`)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate(`/admin/notices/${notice.id}/edit`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {notice.status !== 'PUBLISHED' && (
                            <button
                              onClick={() => setConfirmPublishNotice(notice)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {notice.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleArchiveNotice(notice)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteNotice(notice)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* VIEW MODE 2: CREATE NOTICE (/admin/notices/add) OR EDIT NOTICE (/admin/notices/:id/edit) */}
      {(viewMode === 'add' || viewMode === 'edit') && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/admin/notices')}
                className="p-2 text-gray-400 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-black text-[#001c46]">
                  {viewMode === 'add' ? 'Create New Notice' : 'Edit Notice'}
                </h1>
                <p className="text-xs text-gray-500">
                  {viewMode === 'add' ? 'Publish a new announcement to students, faculty, or targeted classes.' : 'Update notice specifications and targeting details.'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitNotice} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026 Registration"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notice Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  {NOTICE_TYPE_PRESETS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {formData.type === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify custom notice type..."
                    value={customTypeInput}
                    onChange={(e) => setCustomTypeInput(e.target.value)}
                    className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  />
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData((f) => ({ ...f, priority: p.value }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.priority === p.value
                          ? `${p.badgeColor} ring-2 ring-offset-1 ring-[#001c46]`
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData((f) => ({ ...f, targetAudience: e.target.value as TargetAudience }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Class / Section Conditional Controls */}
              {formData.targetAudience === 'SPECIFIC_CLASS' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Target Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.targetClass || ''}
                    onChange={(e) => setFormData((f) => ({ ...f, targetClass: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  >
                    <option value="">-- Choose Class --</option>
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.targetAudience === 'SPECIFIC_SECTION' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Target Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.targetClass || ''}
                      onChange={(e) => setFormData((f) => ({ ...f, targetClass: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                    >
                      <option value="">-- Choose Class --</option>
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Target Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.targetSection || ''}
                      onChange={(e) => setFormData((f) => ({ ...f, targetSection: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                    >
                      <option value="">-- Choose Section --</option>
                      {SECTION_OPTIONS.map((s) => (
                        <option key={s} value={s}>Section {s}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Publish Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Publish Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.publishDate}
                  onChange={(e) => setFormData((f) => ({ ...f, publishDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                />
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expiry Date <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                />
              </div>

              {/* Status Selection (Edit Mode) */}
              {viewMode === 'edit' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={formData.status || 'DRAFT'}
                    onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value as NoticeStatus }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notice Description / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Provide detailed information regarding this announcement..."
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001c46] leading-relaxed"
                />
              </div>

              {/* Attachment File Uploader */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Attachment <span className="text-gray-400 font-normal">(Optional PDF, PNG, JPG, DOC)</span>
                </label>

                {formData.attachmentName ? (
                  <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-[#001c46] rounded-lg">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{formData.attachmentName}</p>
                        <p className="text-[11px] text-gray-500 uppercase">{formData.attachmentType || 'Document'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center bg-gray-50/50 hover:bg-white transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="notice-file-input"
                    />
                    <label htmlFor="notice-file-input" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-7 h-7 text-gray-400 mb-1.5" />
                      <span className="text-xs font-bold text-[#001c46]">Click to upload attachment</span>
                      <span className="text-[11px] text-gray-400 mt-0.5">Maximum file size: 10MB</span>
                    </label>
                  </div>
                )}
                {attachmentError && (
                  <p className="text-xs text-red-600 font-medium mt-1">{attachmentError}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/admin/notices')}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#001c46] rounded-xl shadow-md hover:bg-[#002866] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {viewMode === 'add' ? 'Save & Create Notice' : 'Update Notice'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW MODE 3: SINGLE NOTICE DETAIL VIEW (/admin/notices/:id) */}
      {viewMode === 'view' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#001c46] mb-2" />
              <p className="text-xs font-medium text-gray-500">Loading notice details...</p>
            </div>
          ) : !activeNotice ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-4">
              <p className="text-sm font-bold text-gray-700">Notice not found.</p>
              <button
                onClick={() => onNavigate('/admin/notices')}
                className="px-4 py-2 bg-[#001c46] text-white text-xs font-bold rounded-xl"
              >
                Return to Notice Directory
              </button>
            </div>
          ) : (
            <>
              {/* Back & Actions Navigation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <button
                  onClick={() => onNavigate('/admin/notices')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#001c46] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Directory
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate(`/admin/notices/${activeNotice.id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  {activeNotice.status !== 'PUBLISHED' && (
                    <button
                      onClick={() => setConfirmPublishNotice(activeNotice)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Publish
                    </button>
                  )}

                  {activeNotice.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleArchiveNotice(activeNotice)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}

                  <button
                    onClick={() => setConfirmDeleteNotice(activeNotice)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Main Detail Card */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                {/* Title & Priority Header */}
                <div className="space-y-3 border-b border-gray-100 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-block bg-[#001c46]/5 text-[#001c46] font-extrabold px-3 py-1 rounded-lg text-xs tracking-wide">
                      {activeNotice.type}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Priority */}
                      {activeNotice.priority === 'URGENT' ? (
                        <span className="bg-red-100 text-red-800 border border-red-200 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                          URGENT
                        </span>
                      ) : activeNotice.priority === 'IMPORTANT' ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1 rounded-full">
                          IMPORTANT
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                          NORMAL
                        </span>
                      )}

                      {/* Status */}
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        activeNotice.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                        activeNotice.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {activeNotice.status}
                      </span>
                    </div>
                  </div>

                  <h1 className="text-2xl font-black text-[#001c46] leading-tight">
                    {activeNotice.title}
                  </h1>
                </div>

                {/* Notice Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200/60 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Target Audience</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{getAudienceLabel(activeNotice)}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Published Date</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{activeNotice.publishDate}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Expiry Date</span>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="font-bold text-gray-900">{activeNotice.expiryDate || 'N/A'}</span>
                      {noticeService.isNoticeExpired(activeNotice.expiryDate) && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          EXPIRED
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block uppercase text-[10px]">Issued By</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">{activeNotice.createdBy || 'Admin'}</span>
                  </div>
                </div>

                {/* Description Text Content */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Announcement Content</h3>
                  <div className="text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-wrap bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    {activeNotice.description}
                  </div>
                </div>

                {/* Attachment Link */}
                {activeNotice.attachmentUrl && (
                  <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-[#001c46] rounded-lg">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{activeNotice.attachmentName || 'Attachment File'}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{activeNotice.attachmentType || 'File'}</p>
                      </div>
                    </div>
                    <a
                      href={activeNotice.attachmentUrl}
                      download={activeNotice.attachmentName || 'notice_attachment'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#002866] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* CONFIRM PUBLISH MODAL DIALOG */}
      {confirmPublishNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Publish Notice?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to publish <strong className="text-gray-800">"{confirmPublishNotice.title}"</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200 leading-relaxed">
              Once published, this notice will become visible to the selected audience ({getAudienceLabel(confirmPublishNotice)}).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmPublishNotice(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-xs hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Yes, Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL DIALOG */}
      {confirmDeleteNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Notice?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to delete <strong className="text-gray-800">"{confirmDeleteNotice.title}"</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 leading-relaxed">
              Notice deletion is permanent. If this is an important record, consider archiving it instead.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteNotice(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 rounded-xl shadow-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
