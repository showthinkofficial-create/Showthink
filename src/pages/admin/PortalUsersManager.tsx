import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portalUserService } from '../../services/portalUserService';
import { studentService } from '../../services/studentService';
import { 
  PortalUserWithStudents, 
  CreatePortalUserFormData, 
  PortalUserFilterOptions 
} from '../../types/portalUser';
import { Student, CLASS_OPTIONS } from '../../types/student';
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Mail,
  UserCheck,
  Users,
  RotateCcw,
  Eye,
  EyeOff,
  Link2,
  Unlink,
  Lock,
  Unlock,
  Send,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface PortalUsersManagerProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export default function PortalUsersManager({ currentPath, onNavigate }: PortalUsersManagerProps) {
  const { userProfile, user } = useAuth();

  // State
  const [users, setUsers] = useState<PortalUserWithStudents[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<PortalUserFilterOptions>({
    searchQuery: '',
    accountStatus: 'ALL',
    loginStatus: 'ALL',
    className: '',
    section: '',
  });

  // Modals & Active Selections
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [isToggleLoginConfirmOpen, setIsToggleLoginConfirmOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<PortalUserWithStudents | null>(null);
  const [selectedStudentToUnlink, setSelectedStudentToUnlink] = useState<Student | null>(null);
  const [selectedStudentToLink, setSelectedStudentToLink] = useState<string>('');

  // Create Form State
  const [createFormData, setCreateFormData] = useState<CreatePortalUserFormData>({
    studentUid: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Submitting States
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Authorization Check
  const isSuperAdmin = userProfile?.role === 'SUPER_ADMIN';
  const isAdmin = userProfile?.role === 'ADMIN' || isSuperAdmin;

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Load Data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [usersData, availStudents] = await Promise.all([
        portalUserService.getPortalUsers(),
        portalUserService.getAvailableStudentsForLinking(),
      ]);
      setUsers(usersData);
      setAvailableStudents(availStudents);

      // If a user was selected in detail modal, refresh their data
      if (selectedUser) {
        const updated = usersData.find((u) => u.uid === selectedUser.uid);
        if (updated) setSelectedUser(updated);
      }
    } catch (err: any) {
      console.error('Failed to load portal users:', err);
      setError('Failed to load portal users. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Filtered Portal Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const search = filters.searchQuery.toLowerCase().trim();
      const emailMatches = u.email.toLowerCase().includes(search);
      const nameMatches = u.displayName.toLowerCase().includes(search);
      
      const studentMatches = u.students.some((std) => {
        return (
          std.name.toLowerCase().includes(search) ||
          std.studentId.toLowerCase().includes(search) ||
          std.className.toLowerCase().includes(search) ||
          std.section.toLowerCase().includes(search) ||
          (std.parentName && std.parentName.toLowerCase().includes(search))
        );
      });

      if (search && !emailMatches && !nameMatches && !studentMatches) {
        return false;
      }

      // Account Status Filter
      if (filters.accountStatus !== 'ALL') {
        if (u.status !== filters.accountStatus) return false;
      }

      // Login Status Filter
      if (filters.loginStatus !== 'ALL') {
        const isEnabled = u.loginEnabled;
        if (filters.loginStatus === 'ENABLED' && !isEnabled) return false;
        if (filters.loginStatus === 'DISABLED' && isEnabled) return false;
      }

      // Class Filter
      if (filters.className) {
        const hasClass = u.students.some((std) => std.className === filters.className);
        if (!hasClass) return false;
      }

      // Section Filter
      if (filters.section) {
        const hasSection = u.students.some(
          (std) => std.section.toUpperCase() === filters.section.toUpperCase()
        );
        if (!hasSection) return false;
      }

      return true;
    });
  }, [users, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'ACTIVE' && u.loginEnabled).length;
    const disabled = total - active;
    const totalLinkedStudents = users.reduce((acc, u) => acc + (u.students?.length || 0), 0);
    return { total, active, disabled, totalLinkedStudents };
  }, [users]);

  // Create Portal User Handler
  const handleOpenCreateModal = () => {
    setCreateFormData({
      studentUid: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setCreateFormError(null);
    setShowPassword(false);
    setIsCreateModalOpen(true);
  };

  const handleStudentSelectInCreate = (stdUid: string) => {
    const std = availableStudents.find((s) => s.uid === stdUid);
    setCreateFormData((prev) => ({
      ...prev,
      studentUid: stdUid,
      // Auto-suggest email if student has email or parent info
      email: prev.email || (std?.email ? std.email : (std?.phone ? `parent.${std.phone}@gpacademy.edu.in` : '')),
    }));
    setCreateFormError(null);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateFormData((prev) => ({
      ...prev,
      password: pwd,
      confirmPassword: pwd,
    }));
    setShowPassword(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError(null);

    if (!createFormData.studentUid) {
      setCreateFormError('Please select an active student to link.');
      return;
    }
    if (!createFormData.email.trim()) {
      setCreateFormError('Please enter a valid portal email address.');
      return;
    }
    if (!createFormData.password || createFormData.password.length < 6) {
      setCreateFormError('Initial password must be at least 6 characters.');
      return;
    }
    if (createFormData.password !== createFormData.confirmPassword) {
      setCreateFormError('Passwords do not match.');
      return;
    }

    setIsCreating(true);
    try {
      const creatorUid = user?.uid || userProfile?.uid || 'admin';
      const result = await portalUserService.createPortalUser(createFormData, creatorUid);
      
      setSuccessToast(`Portal user account created successfully for ${result.email}!`);
      setIsCreateModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      console.error('Failed to create portal user:', err);
      setCreateFormError(err.message || 'Failed to create portal user.');
    } finally {
      setIsCreating(false);
    }
  };

  // Link Student Handler
  const handleOpenLinkModal = (userItem: PortalUserWithStudents) => {
    setSelectedUser(userItem);
    setSelectedStudentToLink('');
    setIsLinkModalOpen(true);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedStudentToLink) return;

    setIsActionLoading(true);
    try {
      const adminUid = user?.uid || userProfile?.uid || 'admin';
      await portalUserService.linkStudent(selectedUser.uid, selectedStudentToLink, adminUid);
      setSuccessToast('Student successfully linked to portal account.');
      setIsLinkModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to link student.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Unlink Student Handler
  const handleOpenUnlinkConfirm = (userItem: PortalUserWithStudents, std: Student) => {
    setSelectedUser(userItem);
    setSelectedStudentToUnlink(std);
    setIsUnlinkConfirmOpen(true);
  };

  const handleUnlinkConfirm = async () => {
    if (!selectedUser || !selectedStudentToUnlink) return;

    setIsActionLoading(true);
    try {
      await portalUserService.unlinkStudent(
        selectedUser.uid,
        selectedStudentToUnlink.uid,
        selectedStudentToUnlink.studentId
      );
      setSuccessToast(`Student ${selectedStudentToUnlink.name} unlinked from portal account.`);
      setIsUnlinkConfirmOpen(false);
      setSelectedStudentToUnlink(null);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to unlink student.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle Login Status Handler
  const handleOpenToggleLogin = (userItem: PortalUserWithStudents) => {
    setSelectedUser(userItem);
    setIsToggleLoginConfirmOpen(true);
  };

  const handleToggleLoginConfirm = async () => {
    if (!selectedUser) return;
    const newStatus = !selectedUser.loginEnabled;

    setIsActionLoading(true);
    try {
      await portalUserService.setLoginEnabled(selectedUser.uid, newStatus);
      setSuccessToast(
        `Portal login access has been ${newStatus ? 'ENABLED' : 'DISABLED'} for ${selectedUser.email}.`
      );
      setIsToggleLoginConfirmOpen(false);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update login status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Password Reset Handler
  const handleSendPasswordReset = async (userItem: PortalUserWithStudents) => {
    const confirmSend = window.confirm(
      `Send a secure password reset email to ${userItem.email}?`
    );
    if (!confirmSend) return;

    try {
      await portalUserService.sendPasswordReset(userItem.email);
      setSuccessToast(`Password reset link has been dispatched to ${userItem.email}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to send password reset email.');
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // View Details Modal
  const handleOpenDetailModal = (userItem: PortalUserWithStudents) => {
    setSelectedUser(userItem);
    setIsDetailModalOpen(true);
  };

  // Non-admin guard
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-sans">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#001c46]">Access Restricted</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Portal User Management is strictly restricted to authorized Super Administrators and Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#001c46] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#FFC907] shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#001c46] text-[#FFC907] flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#001c46] tracking-tight">
                Portal User Management
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Manage combined student and parent portal credentials, student links, and access controls.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#001c46]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#001c46] text-[#FFC907] hover:bg-[#002866] text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Portal User</span>
          </button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Portal Accounts
            </span>
            <Users className="w-4 h-4 text-[#001c46]" />
          </div>
          <div className="text-2xl font-black text-[#001c46] mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active Accounts
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {stats.active}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Disabled Accounts
            </span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            {stats.disabled}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Linked Students
            </span>
            <Link2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">
            {stats.totalLinkedStudents}
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by student name, ID, class, or portal email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Account Status Filter */}
          <select
            value={filters.accountStatus}
            onChange={(e) => setFilters({ ...filters, accountStatus: e.target.value as any })}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">Status: ACTIVE</option>
            <option value="DISABLED">Status: DISABLED</option>
          </select>

          {/* Login Status Filter */}
          <select
            value={filters.loginStatus}
            onChange={(e) => setFilters({ ...filters, loginStatus: e.target.value as any })}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="ALL">All Login Status</option>
            <option value="ENABLED">Login: ENABLED</option>
            <option value="DISABLED">Login: DISABLED</option>
          </select>

          {/* Class Filter */}
          <select
            value={filters.className}
            onChange={(e) => setFilters({ ...filters, className: e.target.value })}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>

          {/* Reset Filters */}
          {(filters.searchQuery ||
            filters.accountStatus !== 'ALL' ||
            filters.loginStatus !== 'ALL' ||
            filters.className ||
            filters.section) && (
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  accountStatus: 'ALL',
                  loginStatus: 'ALL',
                  className: '',
                  section: '',
                })
              }
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Card Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Loading Portal Users...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3 p-6">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm text-red-600 font-bold">{error}</p>
            <button
              onClick={() => loadData()}
              className="px-4 py-2 bg-[#001c46] text-white text-xs font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-4 p-6">
            <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#001c46]">No Portal Users Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {users.length === 0
                  ? 'No portal accounts have been created yet. Click "+ Create Portal User" to register credentials for a student.'
                  : 'No portal users match your search and filter criteria.'}
              </p>
            </div>
            {users.length === 0 && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001c46] text-[#FFC907] text-xs font-bold cursor-pointer hover:bg-[#002866]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create First Portal User</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Student Name</th>
                    <th className="py-4 px-4">Student ID</th>
                    <th className="py-4 px-4">Class</th>
                    <th className="py-4 px-4">Section</th>
                    <th className="py-4 px-5">Portal Email</th>
                    <th className="py-4 px-4">Account Status</th>
                    <th className="py-4 px-4">Login Status</th>
                    <th className="py-4 px-4">Created Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredUsers.map((userItem) => {
                    const primaryStd = userItem.primaryStudent;
                    const multiCount = userItem.students.length;
                    const isLoginEnabled = userItem.loginEnabled;

                    return (
                      <tr
                        key={userItem.uid}
                        className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetailModal(userItem)}
                      >
                        {/* Student Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#001c46] font-black flex items-center justify-center text-xs shrink-0">
                              {(primaryStd?.name || userItem.displayName || 'U').charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#001c46] group-hover:text-blue-700 transition-colors">
                                {primaryStd ? primaryStd.name : userItem.displayName}
                              </div>
                              {multiCount > 1 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md mt-0.5">
                                  <Users className="w-2.5 h-2.5" />
                                  +{multiCount - 1} linked
                                </span>
                              )}
                              {multiCount === 0 && (
                                <span className="text-[10px] text-amber-600 font-bold">
                                  No linked student
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-4 px-4 font-mono font-bold text-gray-700">
                          {primaryStd?.studentId || '—'}
                        </td>

                        {/* Class */}
                        <td className="py-4 px-4 font-bold text-gray-800">
                          {primaryStd?.className || '—'}
                        </td>

                        {/* Section */}
                        <td className="py-4 px-4 font-bold text-gray-800">
                          {primaryStd?.section || '—'}
                        </td>

                        {/* Portal Email */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-700">{userItem.email}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyEmail(userItem.email);
                              }}
                              className="p-1 text-gray-400 hover:text-[#001c46] transition-colors rounded-md hover:bg-gray-100"
                              title="Copy Email"
                            >
                              {copiedEmail === userItem.email ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4">
                          {userItem.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Login Status */}
                        <td className="py-4 px-4">
                          {isLoginEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              <Unlock className="w-2.5 h-2.5 text-blue-600" />
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-300">
                              <Lock className="w-2.5 h-2.5 text-gray-500" />
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-gray-500 text-[11px]">
                          {userItem.createdAt
                            ? new Date(userItem.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(userItem)}
                              className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Portal User Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenLinkModal(userItem)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Link Student"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenToggleLogin(userItem)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isLoginEnabled
                                  ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                              }`}
                              title={isLoginEnabled ? 'Disable Portal Login' : 'Enable Portal Login'}
                            >
                              {isLoginEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendPasswordReset(userItem)}
                              className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Send Password Reset Email"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {filteredUsers.map((userItem) => {
                const primaryStd = userItem.primaryStudent;
                const isLoginEnabled = userItem.loginEnabled;

                return (
                  <div
                    key={userItem.uid}
                    onClick={() => handleOpenDetailModal(userItem)}
                    className="p-4 space-y-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-[#001c46] text-sm">
                          {primaryStd ? primaryStd.name : userItem.displayName}
                        </div>
                        <div className="text-[11px] font-mono text-gray-500">
                          ID: {primaryStd?.studentId || 'No ID'} • Class: {primaryStd?.className || '—'} (
                          {primaryStd?.section || '—'})
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {userItem.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800 uppercase">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                      <div className="truncate font-medium">{userItem.email}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isLoginEnabled
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isLoginEnabled ? 'Login ON' : 'Login OFF'}
                      </span>
                    </div>

                    {userItem.students.length > 1 && (
                      <div className="text-[11px] text-indigo-600 font-bold">
                        Linked to {userItem.students.length} students
                      </div>
                    )}

                    <div
                      className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenLinkModal(userItem)}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg"
                      >
                        Link Child
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenToggleLogin(userItem)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          isLoginEnabled
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isLoginEnabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendPasswordReset(userItem)}
                        className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg"
                      >
                        Reset Pwd
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE PORTAL USER MODAL                                                  */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#001c46] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFC907] text-[#001c46] flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Create Portal User</h3>
                  <p className="text-[11px] text-gray-300">
                    Register institutional authentication credentials for an enrolled student.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{createFormError}</span>
                </div>
              )}

              {/* Step 1: Select Student */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  1. Select Enrolled Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.studentUid}
                  onChange={(e) => handleStudentSelectInCreate(e.target.value)}
                  required
                  className="block w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="">-- Choose active unlinked student --</option>
                  {availableStudents.map((std) => (
                    <option key={std.uid} value={std.uid}>
                      {std.name} ({std.studentId}) — {std.className} {std.section}
                    </option>
                  ))}
                </select>
                {availableStudents.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1">
                    Note: All active students currently have portal accounts assigned, or no active students exist.
                  </p>
                )}
              </div>

              {/* Selected Student Preview */}
              {createFormData.studentUid && (
                (() => {
                  const s = availableStudents.find((st) => st.uid === createFormData.studentUid);
                  if (!s) return null;
                  return (
                    <div className="bg-blue-50/70 border border-blue-200/80 p-3 rounded-xl text-xs text-[#001c46] space-y-1">
                      <div className="font-bold flex justify-between">
                        <span>{s.name} ({s.studentId})</span>
                        <span className="text-blue-700 font-semibold">{s.board}</span>
                      </div>
                      <div className="text-[11px] text-gray-600">
                        Class: <span className="font-medium">{s.className}</span> | Section: <span className="font-medium">{s.section}</span> | Parent: <span className="font-medium">{s.parentName}</span>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Step 2: Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  2. Portal Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    placeholder="e.g. parent.student@gpacademy.edu.in"
                    className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  />
                </div>
              </div>

              {/* Step 3: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                    3. Initial Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate Password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={createFormData.password}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="block w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={createFormData.confirmPassword}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, confirmPassword: e.target.value })
                    }
                    placeholder="Re-enter initial password"
                    className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-[#001c46] text-[#FFC907] hover:bg-[#002866] rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Portal Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW DETAILS MODAL                                                        */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#001c46] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFC907] text-[#001c46] flex items-center justify-center font-black">
                  {selectedUser.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black">{selectedUser.displayName}</h3>
                  <p className="text-xs text-gray-300">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Account Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Auth Role</span>
                  <div className="font-mono font-bold text-[#001c46] mt-0.5">{selectedUser.role}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Account Status</span>
                  <div className="font-bold mt-0.5">
                    {selectedUser.status === 'ACTIVE' ? (
                      <span className="text-emerald-700">ACTIVE</span>
                    ) : (
                      <span className="text-red-600">DISABLED</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Login Access</span>
                  <div className="font-bold mt-0.5">
                    {selectedUser.loginEnabled ? (
                      <span className="text-blue-700">ENABLED</span>
                    ) : (
                      <span className="text-gray-600">DISABLED</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Created Date</span>
                  <div className="text-gray-700 mt-0.5">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Firebase Auth UID</span>
                  <div className="font-mono text-[11px] text-gray-600 truncate mt-0.5">
                    {selectedUser.uid}
                  </div>
                </div>
              </div>

              {/* Linked Students Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#001c46] uppercase tracking-wide flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span>Linked Students ({selectedUser.students.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenLinkModal(selectedUser);
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link Another Student</span>
                  </button>
                </div>

                {selectedUser.students.length === 0 ? (
                  <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500">
                    No student profiles linked to this portal user account.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedUser.students.map((std) => (
                      <div
                        key={std.uid}
                        className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:border-blue-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-black text-[#001c46] text-sm flex items-center gap-2">
                            <span>{std.name}</span>
                            <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {std.studentId}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {std.board}
                            </span>
                          </div>
                          <div className="text-gray-600 text-[11px] flex gap-3">
                            <span>Class: <strong className="text-gray-900">{std.className}</strong></span>
                            <span>Section: <strong className="text-gray-900">{std.section}</strong></span>
                            <span>Roll: <strong className="text-gray-900">{std.rollNumber || '—'}</strong></span>
                            <span>Parent: <strong className="text-gray-900">{std.parentName}</strong></span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            handleOpenUnlinkConfirm(selectedUser, std);
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Unlink this student from portal account"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>Unlink</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenToggleLogin(selectedUser);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    selectedUser.loginEnabled
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedUser.loginEnabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{selectedUser.loginEnabled ? 'Disable Portal Login' : 'Enable Portal Login'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendPasswordReset(selectedUser)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Password Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LINK STUDENT MODAL                                                        */}
      {/* ========================================================================= */}
      {isLinkModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#001c46] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#FFC907]" />
                <h3 className="text-base font-black">Link Student to Portal Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-gray-500 font-bold block mb-1">Target Portal Account</span>
                <div className="font-bold text-[#001c46] bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {selectedUser.displayName} ({selectedUser.email})
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#001c46] uppercase tracking-wider">
                  Select Student to Link <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedStudentToLink}
                  onChange={(e) => setSelectedStudentToLink(e.target.value)}
                  className="block w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                >
                  <option value="">-- Choose active unlinked student --</option>
                  {availableStudents.map((std) => (
                    <option key={std.uid} value={std.uid}>
                      {std.name} ({std.studentId}) — {std.className} {std.section}
                    </option>
                  ))}
                </select>
                {availableStudents.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    No unlinked active students available.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !selectedStudentToLink}
                  className="px-5 py-2 bg-[#001c46] text-[#FFC907] hover:bg-[#002866] rounded-xl font-extrabold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  <span>Confirm Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM UNLINK MODAL                                                      */}
      {/* ========================================================================= */}
      {isUnlinkConfirmOpen && selectedUser && selectedStudentToUnlink && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Unlink className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-[#001c46]">
                Confirm Student Unlink
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to unlink <strong>{selectedStudentToUnlink.name}</strong> ({selectedStudentToUnlink.studentId}) from portal user account <strong>{selectedUser.email}</strong>?
              </p>
              <div className="bg-blue-50 text-blue-800 text-[11px] p-3 rounded-xl text-left border border-blue-200">
                <strong>Notice:</strong> This action only removes the login association. The student record, attendance, marks, and fees are completely preserved.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUnlinkConfirmOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnlinkConfirm}
                disabled={isActionLoading}
                className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                <span>Unlink Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM TOGGLE LOGIN MODAL                                                */}
      {/* ========================================================================= */}
      {isToggleLoginConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                selectedUser.loginEnabled
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {selectedUser.loginEnabled ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-[#001c46]">
                {selectedUser.loginEnabled ? 'Disable Portal Login?' : 'Enable Portal Login?'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedUser.loginEnabled
                  ? `Disabling login will prevent ${selectedUser.email} from logging into the portal dashboard immediately.`
                  : `Enabling login will restore portal dashboard access for ${selectedUser.email}.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsToggleLoginConfirmOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleLoginConfirm}
                disabled={isActionLoading}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer text-white ${
                  selectedUser.loginEnabled
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{selectedUser.loginEnabled ? 'Disable Login' : 'Enable Login'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
