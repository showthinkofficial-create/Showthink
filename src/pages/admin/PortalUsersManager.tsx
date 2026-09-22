import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portalUserService } from '../../services/portalUserService';
import { 
  UnifiedPortalUser, 
  PortalUserType, 
  CreateTeacherPortalUserFormData, 
  CreateParentStudentPortalUserFormData 
} from '../../types/portalUser';
import { Student, CLASS_OPTIONS } from '../../types/student';
import { SUBJECT_OPTIONS, SECTION_OPTIONS } from '../../types/teacher';
import {
  KeyRound,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  UserCheck,
  Users,
  RotateCcw,
  Eye,
  Link2,
  Lock,
  Unlock,
  Send,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
  Edit3,
  Phone,
  Shield,
  BookOpen,
  Calendar,
  ExternalLink,
  Info
} from 'lucide-react';

interface PortalUsersManagerProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export default function PortalUsersManager({ currentPath, onNavigate }: PortalUsersManagerProps) {
  const { userProfile, user } = useAuth();

  // State
  const [users, setUsers] = useState<UnifiedPortalUser[]>([]);
  const [allActiveStudents, setAllActiveStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | 'TEACHER' | 'PARENT_STUDENT'>('ALL');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);

  // Selected User for actions
  const [selectedUser, setSelectedUser] = useState<UnifiedPortalUser | null>(null);

  // Add User Form State
  const [selectedUserType, setSelectedUserType] = useState<PortalUserType>('TEACHER');
  
  // Teacher Form Data
  const [teacherFormData, setTeacherFormData] = useState<CreateTeacherPortalUserFormData>({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    teacherId: '',
    subjects: ['Mathematics'],
    assignedClasses: ['Class 9', 'Class 10'],
    assignedSections: ['A'],
    qualification: '',
    status: 'ACTIVE',
  });

  // Parent/Student Form Data
  const [parentFormData, setParentFormData] = useState<CreateParentStudentPortalUserFormData>({
    studentUid: '',
    studentId: '',
    email: '',
    phone: '',
    name: '',
    status: 'ACTIVE',
  });

  // Edit User State
  const [editTeacherData, setEditTeacherData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    teacherId: '',
    subjects: [] as string[],
    assignedClasses: [] as string[],
    assignedSections: [] as string[],
    qualification: '',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  });

  const [editParentData, setEditParentData] = useState({
    name: '',
    phone: '',
    studentUid: '',
    studentId: '',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Authorization Check
  const isSuperAdmin = userProfile?.role === 'SUPER_ADMIN';
  const isAdmin = userProfile?.role === 'ADMIN' || isSuperAdmin;

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Load Data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [unifiedUsers, activeStudents] = await Promise.all([
        portalUserService.getUnifiedPortalUsers(),
        portalUserService.getAllActiveStudents(),
      ]);
      setUsers(unifiedUsers);
      setAllActiveStudents(activeStudents);

      if (selectedUser) {
        const updated = unifiedUsers.find((u) => u.uid === selectedUser.uid);
        if (updated) setSelectedUser(updated);
      }
    } catch (err: any) {
      console.error('Failed to load portal users:', err);
      setError('Failed to load portal users. Please check your connection and retry.');
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

  // Generate next teacher ID on opening add modal
  const handleOpenAddModal = async () => {
    setFormError(null);
    setSelectedUserType('TEACHER');
    
    // Auto-fetch next teacher ID
    try {
      const nextId = await portalUserService.generateNextTeacherId();
      setTeacherFormData({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        teacherId: nextId,
        subjects: ['Mathematics'],
        assignedClasses: ['Class 9', 'Class 10'],
        assignedSections: ['A'],
        qualification: 'B.Ed, M.Sc',
        status: 'ACTIVE',
      });
    } catch {
      setTeacherFormData({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        teacherId: `GP-T-${new Date().getFullYear()}-001`,
        subjects: ['Mathematics'],
        assignedClasses: ['Class 9'],
        assignedSections: ['A'],
        qualification: '',
        status: 'ACTIVE',
      });
    }

    setParentFormData({
      studentUid: '',
      studentId: '',
      email: '',
      phone: '',
      name: '',
      status: 'ACTIVE',
    });

    setIsAddModalOpen(true);
  };

  // Student selection in Parent/Student form
  const handleStudentSelectInAdd = (studentUid: string) => {
    const std = allActiveStudents.find((s) => s.uid === studentUid);
    if (std) {
      setParentFormData((prev) => ({
        ...prev,
        studentUid: std.uid,
        studentId: std.studentId,
        name: prev.name || std.parentName || `Parent of ${std.name}`,
        email: prev.email || (std.email ? std.email : (std.phone ? `parent.${std.phone}@gpacademy.in` : '')),
        phone: prev.phone || std.phone || '',
      }));
    } else {
      setParentFormData((prev) => ({
        ...prev,
        studentUid: '',
        studentId: '',
      }));
    }
  };

  // Submit Add Portal User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const actorUid = user?.uid || userProfile?.uid || 'admin';
      const actorEmail = user?.email || userProfile?.email || 'admin@gpacademy.in';

      if (selectedUserType === 'TEACHER') {
        if (!teacherFormData.name.trim()) throw new Error('Teacher name is required.');
        if (!teacherFormData.email.trim()) throw new Error('Teacher email is required.');
        if (!teacherFormData.phone.trim()) throw new Error('Phone number is required.');
        if (teacherFormData.subjects.length === 0) throw new Error('Assign at least one subject.');
        if (teacherFormData.assignedClasses.length === 0) throw new Error('Assign at least one class.');

        const result = await portalUserService.createTeacherPortalUser(teacherFormData, actorUid, actorEmail);
        setSuccessToast(`Teacher account created for ${result.email}! Password setup instructions dispatched.`);
      } else {
        if (!parentFormData.studentUid) throw new Error('Please select an enrolled student to link.');
        if (!parentFormData.email.trim()) throw new Error('Valid email address is required.');
        if (!parentFormData.name.trim()) throw new Error('Parent / Guardian name is required.');

        const result = await portalUserService.createParentStudentPortalUser(parentFormData, actorUid, actorEmail);
        setSuccessToast(`Parent/Student account created for ${result.email}! Password setup email dispatched.`);
      }

      setIsAddModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      console.error('Error creating portal user:', err);
      setFormError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (u: UnifiedPortalUser) => {
    setSelectedUser(u);
    setFormError(null);

    if (u.userType === 'TEACHER') {
      setEditTeacherData({
        name: u.displayName || '',
        phone: u.phone || '',
        alternatePhone: u.alternatePhone || '',
        teacherId: u.teacherId || '',
        subjects: u.subjects || [],
        assignedClasses: u.assignedClasses || [],
        assignedSections: u.assignedSections || [],
        qualification: u.qualification || '',
        status: u.status || 'ACTIVE',
      });
    } else {
      const linkedUid = u.students[0]?.uid || (u.linkedStudents && u.linkedStudents[0]) || '';
      const linkedId = u.students[0]?.studentId || (u.linkedStudentIds && u.linkedStudentIds[0]) || '';
      setEditParentData({
        name: u.displayName || '',
        phone: u.phone || '',
        studentUid: linkedUid,
        studentId: linkedId,
        status: u.status || 'ACTIVE',
      });
    }

    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const actorUid = user?.uid || userProfile?.uid || 'admin';
      const actorEmail = user?.email || userProfile?.email || 'admin@gpacademy.in';

      if (selectedUser.userType === 'TEACHER') {
        if (!editTeacherData.name.trim()) throw new Error('Teacher name is required.');
        if (!editTeacherData.phone.trim()) throw new Error('Phone number is required.');
        if (editTeacherData.subjects.length === 0) throw new Error('Select at least one subject.');
        if (editTeacherData.assignedClasses.length === 0) throw new Error('Select at least one class.');

        await portalUserService.updateTeacherAssignments(
          {
            uid: selectedUser.uid,
            teacherId: editTeacherData.teacherId,
            name: editTeacherData.name,
            phone: editTeacherData.phone,
            alternatePhone: editTeacherData.alternatePhone,
            subjects: editTeacherData.subjects,
            assignedClasses: editTeacherData.assignedClasses,
            assignedSections: editTeacherData.assignedSections,
            qualification: editTeacherData.qualification,
            status: editTeacherData.status,
          },
          actorUid,
          actorEmail
        );

        setSuccessToast(`Faculty profile and assignments updated for ${selectedUser.displayName}.`);
      } else {
        if (!editParentData.name.trim()) throw new Error('Parent/Guardian name is required.');
        if (!editParentData.studentUid) throw new Error('Linked student is required.');

        await portalUserService.updateParentStudent(
          {
            uid: selectedUser.uid,
            name: editParentData.name,
            phone: editParentData.phone,
            studentUid: editParentData.studentUid,
            studentId: editParentData.studentId,
            status: editParentData.status,
          },
          actorUid,
          actorEmail
        );

        setSuccessToast(`Parent/Student account updated for ${selectedUser.displayName}.`);
      }

      setIsEditModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      console.error('Error updating portal user:', err);
      setFormError(err.message || 'Failed to update account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Status Toggle Confirm
  const handleOpenToggleStatus = (u: UnifiedPortalUser) => {
    setSelectedUser(u);
    setIsToggleStatusModalOpen(true);
  };

  // Confirm Status Toggle
  const handleToggleStatusConfirm = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const nextStatus = selectedUser.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      const actorUid = user?.uid || userProfile?.uid || 'admin';
      const actorEmail = user?.email || userProfile?.email || 'admin@gpacademy.in';

      await portalUserService.toggleUnifiedUserStatus(
        selectedUser.uid,
        selectedUser.userType,
        nextStatus,
        actorUid,
        actorEmail
      );

      setSuccessToast(
        `Account status for ${selectedUser.displayName} has been set to ${nextStatus}.`
      );
      setIsToggleStatusModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to change account status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Password Reset
  const handleSendPasswordReset = async (u: UnifiedPortalUser) => {
    if (!confirm(`Send official Firebase password setup / reset email to ${u.email}?`)) {
      return;
    }

    try {
      const actorUid = user?.uid || userProfile?.uid || 'admin';
      const actorEmail = user?.email || userProfile?.email || 'admin@gpacademy.in';

      const msg = await portalUserService.sendUnifiedPasswordReset(
        u.email,
        u.uid,
        u.userType,
        actorUid,
        actorEmail
      );
      setSuccessToast(msg);
    } catch (err: any) {
      alert(err.message || 'Failed to send password reset email.');
    }
  };

  // Copy Email Helper
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Open Details Modal
  const handleOpenDetailModal = (u: UnifiedPortalUser) => {
    setSelectedUser(u);
    setIsDetailModalOpen(true);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const search = searchQuery.toLowerCase().trim();

      // Search matching
      if (search) {
        const nameMatches = (u.displayName || '').toLowerCase().includes(search);
        const emailMatches = (u.email || '').toLowerCase().includes(search);
        const teacherIdMatches = (u.teacherId || '').toLowerCase().includes(search);
        const studentMatches = (u.students || []).some(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            s.studentId.toLowerCase().includes(search) ||
            s.className.toLowerCase().includes(search) ||
            s.section.toLowerCase().includes(search)
        );

        if (!nameMatches && !emailMatches && !teacherIdMatches && !studentMatches) {
          return false;
        }
      }

      // User Type filter
      if (userTypeFilter !== 'ALL' && u.userType !== userTypeFilter) {
        return false;
      }

      // Account Status filter
      if (accountStatusFilter !== 'ALL' && u.status !== accountStatusFilter) {
        return false;
      }

      // Class filter
      if (classFilter) {
        if (u.userType === 'TEACHER') {
          if (!u.assignedClasses?.includes(classFilter)) return false;
        } else {
          const hasClass = (u.students || []).some((s) => s.className === classFilter);
          if (!hasClass) return false;
        }
      }

      // Section filter
      if (sectionFilter) {
        if (u.userType === 'TEACHER') {
          if (!u.assignedSections?.includes(sectionFilter)) return false;
        } else {
          const hasSection = (u.students || []).some(
            (s) => s.section.toUpperCase() === sectionFilter.toUpperCase()
          );
          if (!hasSection) return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, userTypeFilter, accountStatusFilter, classFilter, sectionFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const teachers = users.filter((u) => u.userType === 'TEACHER').length;
    const parents = users.filter((u) => u.userType === 'PARENT_STUDENT').length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const disabled = users.filter((u) => u.status === 'DISABLED').length;
    return { total, teachers, parents, active, disabled };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-[#FFC907]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#001c46] text-[#FFC907] flex items-center justify-center font-bold shadow-md shadow-blue-950/10">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#001c46] tracking-tight">
              Portal Users
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Centralized account management for Faculty Teachers and Enrolled Parent/Student accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh portal users"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#001c46] text-[#FFC907] hover:bg-[#002866] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portal User</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-4 h-4 text-[#001c46]" />
          </div>
          <div className="text-2xl font-black text-[#001c46] mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Faculty / Teachers
            </span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {stats.teachers}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Parent / Student
            </span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">
            {stats.parents}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
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
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              Disabled Accounts
            </span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            {stats.disabled}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by User Name, Email, Student ID, Teacher ID, Class..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* User Type Filter */}
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="ALL">All User Types</option>
            <option value="TEACHER">Faculty / Teacher</option>
            <option value="PARENT_STUDENT">Parent / Student</option>
          </select>

          {/* Account Status Filter */}
          <select
            value={accountStatusFilter}
            onChange={(e) => setAccountStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Status: ACTIVE</option>
            <option value="DISABLED">Status: DISABLED</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
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
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery ||
            userTypeFilter !== 'ALL' ||
            accountStatusFilter !== 'ALL' ||
            classFilter ||
            sectionFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setUserTypeFilter('ALL');
                setAccountStatusFilter('ALL');
                setClassFilter('');
                setSectionFilter('');
              }}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Loading Centralized Portal Users...
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
                  ? 'No portal accounts exist yet. Click "+ Add Portal User" to create credentials for Faculty or Parent/Student.'
                  : 'No users match your search and filter criteria.'}
              </p>
            </div>
            {users.length === 0 && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001c46] text-[#FFC907] text-xs font-bold cursor-pointer hover:bg-[#002866]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add First Portal User</span>
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
                    <th className="py-4 px-5">User Name</th>
                    <th className="py-4 px-5">Email</th>
                    <th className="py-4 px-4">User Type</th>
                    <th className="py-4 px-4">Linked Student</th>
                    <th className="py-4 px-4">Teacher ID</th>
                    <th className="py-4 px-4">Account Status</th>
                    <th className="py-4 px-4">Created Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredUsers.map((u) => {
                    const isTeacher = u.userType === 'TEACHER';
                    const primaryStd = u.primaryStudent || (u.students && u.students[0]);
                    const multiStudents = (u.students || []).length;

                    return (
                      <tr
                        key={u.uid}
                        className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetailModal(u)}
                      >
                        {/* User Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                                isTeacher
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isTeacher ? (
                                <GraduationCap className="w-4 h-4" />
                              ) : (
                                (u.displayName || 'U').charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#001c46] group-hover:text-blue-700 transition-colors">
                                {u.displayName}
                              </div>
                              {u.phone && (
                                <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-700">{u.email}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyEmail(u.email);
                              }}
                              className="p-1 text-gray-400 hover:text-[#001c46] transition-colors rounded-md hover:bg-gray-100"
                              title="Copy Email"
                            >
                              {copiedEmail === u.email ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* User Type */}
                        <td className="py-4 px-4">
                          {isTeacher ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <GraduationCap className="w-3 h-3 text-indigo-600" />
                              Teacher
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              <UserCheck className="w-3 h-3 text-blue-600" />
                              Parent/Student
                            </span>
                          )}
                        </td>

                        {/* Linked Student */}
                        <td className="py-4 px-4">
                          {!isTeacher ? (
                            primaryStd ? (
                              <div>
                                <div className="font-bold text-[#001c46]">
                                  {primaryStd.name}
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono">
                                  {primaryStd.studentId} • {primaryStd.className} ({primaryStd.section})
                                </div>
                                {multiStudents > 1 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md mt-0.5">
                                    <Users className="w-2.5 h-2.5" />
                                    +{multiStudents - 1} linked
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-600 font-bold text-[11px]">
                                No student linked
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 font-bold">—</span>
                          )}
                        </td>

                        {/* Teacher ID */}
                        <td className="py-4 px-4">
                          {isTeacher ? (
                            <span className="font-mono font-bold text-indigo-900 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100">
                              {u.teacherId || 'Unassigned'}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-bold">—</span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4">
                          {u.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-gray-500 text-[11px]">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-IN', {
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
                              onClick={() => handleOpenDetailModal(u)}
                              className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="View Account Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={isTeacher ? 'Edit Teacher Assignments' : 'Edit Parent/Student Account'}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenToggleStatus(u)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                u.status === 'ACTIVE'
                                  ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                              }`}
                              title={u.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                            >
                              {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendPasswordReset(u)}
                              className="p-1.5 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Send Firebase Password Setup / Reset Email"
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

            {/* Mobile Cards View */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isTeacher = u.userType === 'TEACHER';
                const primaryStd = u.primaryStudent || (u.students && u.students[0]);

                return (
                  <div
                    key={u.uid}
                    onClick={() => handleOpenDetailModal(u)}
                    className="p-4 space-y-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                            isTeacher ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isTeacher ? <GraduationCap className="w-4 h-4" /> : (u.displayName || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#001c46] text-sm">
                            {u.displayName}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {isTeacher ? `Faculty ID: ${u.teacherId || '—'}` : `Student: ${primaryStd?.name || '—'}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isTeacher ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                            Teacher
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 uppercase">
                            Parent/Std
                          </span>
                        )}

                        {u.status === 'ACTIVE' ? (
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
                      <div className="truncate font-medium">{u.email}</div>
                      <div className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenToggleStatus(u)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          u.status === 'ACTIVE'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendPasswordReset(u)}
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
      {/* ADD PORTAL USER MODAL (UNIFIED: TEACHER VS PARENT/STUDENT)                 */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#001c46] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFC907] text-[#001c46] flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Add Portal User</h3>
                  <p className="text-[11px] text-gray-300">
                    Create secure authentication credentials for Teacher or Parent/Student.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{formError}</span>
                </div>
              )}

              {/* Step 1: User Type Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[#001c46] uppercase tracking-wider">
                  1. Select User Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('TEACHER')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedUserType === 'TEACHER'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/30'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        selectedUserType === 'TEACHER'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-[#001c46]">Teacher / Faculty</div>
                      <div className="text-[10px] text-gray-500">Access Teacher Panel (/teacher)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUserType('PARENT_STUDENT')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedUserType === 'PARENT_STUDENT'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/30'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        selectedUserType === 'PARENT_STUDENT'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-[#001c46]">Parent / Student</div>
                      <div className="text-[10px] text-gray-500">Access Student Portal (/portal)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ============================================================== */}
              {/* TEACHER SPECIFIC FIELDS                                         */}
              {/* ============================================================== */}
              {selectedUserType === 'TEACHER' && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Teacher Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherFormData.name}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Sharma"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700">
                          Teacher ID <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            const nextId = await portalUserService.generateNextTeacherId();
                            setTeacherFormData({ ...teacherFormData, teacherId: nextId });
                          }}
                          className="text-[10px] text-blue-700 font-bold hover:underline"
                        >
                          Auto Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={teacherFormData.teacherId}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, teacherId: e.target.value })}
                        placeholder="e.g. GP-T-2026-001"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Faculty Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={teacherFormData.email}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, email: e.target.value })}
                        placeholder="e.g. rajesh.teacher@gpacademy.in"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={teacherFormData.phone}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Assigned Subjects */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Assigned Subjects <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {SUBJECT_OPTIONS.map((sub) => {
                        const isSelected = teacherFormData.subjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setTeacherFormData({
                                  ...teacherFormData,
                                  subjects: teacherFormData.subjects.filter((s) => s !== sub),
                                });
                              } else {
                                setTeacherFormData({
                                  ...teacherFormData,
                                  subjects: [...teacherFormData.subjects, sub],
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Assigned Classes <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {CLASS_OPTIONS.map((c) => {
                        const isSelected = teacherFormData.assignedClasses.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setTeacherFormData({
                                  ...teacherFormData,
                                  assignedClasses: teacherFormData.assignedClasses.filter((cl) => cl !== c),
                                });
                              } else {
                                setTeacherFormData({
                                  ...teacherFormData,
                                  assignedClasses: [...teacherFormData.assignedClasses, c],
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#001c46] text-[#FFC907] shadow-2xs'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Sections */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Assigned Sections
                    </label>
                    <div className="flex gap-2">
                      {SECTION_OPTIONS.map((sec) => {
                        const isSelected = (teacherFormData.assignedSections || []).includes(sec);
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              const curr = teacherFormData.assignedSections || [];
                              if (isSelected) {
                                setTeacherFormData({
                                  ...teacherFormData,
                                  assignedSections: curr.filter((s) => s !== sec),
                                });
                              } else {
                                setTeacherFormData({
                                  ...teacherFormData,
                                  assignedSections: [...curr, sec],
                                });
                              }
                            }}
                            className={`w-10 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-black'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {sec}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Initial Account Status
                    </label>
                    <select
                      value={teacherFormData.status}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                    >
                      <option value="ACTIVE">ACTIVE (Authorized to login)</option>
                      <option value="DISABLED">DISABLED (Login blocked)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* PARENT/STUDENT SPECIFIC FIELDS                                 */}
              {/* ============================================================== */}
              {selectedUserType === 'PARENT_STUDENT' && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  {/* Select Enrolled Student */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#001c46]">
                      Link Enrolled Student <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={parentFormData.studentUid}
                      onChange={(e) => handleStudentSelectInAdd(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                    >
                      <option value="">-- Choose active enrolled student --</option>
                      {allActiveStudents.map((std) => (
                        <option key={std.uid} value={std.uid}>
                          {std.name} ({std.studentId}) — {std.className} {std.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Details Preview */}
                  {parentFormData.studentUid && (() => {
                    const std = allActiveStudents.find((s) => s.uid === parentFormData.studentUid);
                    if (!std) return null;
                    return (
                      <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl text-xs text-[#001c46] space-y-1">
                        <div className="font-bold flex justify-between">
                          <span>{std.name} (Student ID: {std.studentId})</span>
                          <span className="text-blue-700 font-semibold">{std.board}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 flex gap-3">
                          <span>Class: <strong>{std.className}</strong></span>
                          <span>Section: <strong>{std.section}</strong></span>
                          <span>Roll: <strong>{std.rollNumber || '—'}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Parent / Guardian Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={parentFormData.name}
                        onChange={(e) => setParentFormData({ ...parentFormData, name: e.target.value })}
                        placeholder="e.g. Ramesh Verma"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={parentFormData.phone}
                        onChange={(e) => setParentFormData({ ...parentFormData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Portal Login Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={parentFormData.email}
                        onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
                        placeholder="e.g. parent.student@gpacademy.in"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Initial Account Status
                    </label>
                    <select
                      value={parentFormData.status}
                      onChange={(e) => setParentFormData({ ...parentFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                    >
                      <option value="ACTIVE">ACTIVE (Authorized to login)</option>
                      <option value="DISABLED">DISABLED (Login blocked)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Security & Password Notice */}
              <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Secure Firebase Authentication</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Passwords are never stored in databases or local storage. An official Firebase password setup / reset email will be sent automatically to the provided address so the user can securely configure their password.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#001c46] text-[#FFC907] hover:bg-[#002866] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Portal User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MODAL (TEACHER ASSIGNMENTS OR PARENT/STUDENT LINK)                    */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#001c46] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFC907] text-[#001c46] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Edit {selectedUser.userType === 'TEACHER' ? 'Teacher Profile & Assignments' : 'Parent/Student Account'}
                  </h3>
                  <p className="text-[11px] text-gray-300">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{formError}</span>
                </div>
              )}

              {/* TEACHER EDIT FORM */}
              {selectedUser.userType === 'TEACHER' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">Teacher Name</label>
                      <input
                        type="text"
                        required
                        value={editTeacherData.name}
                        onChange={(e) => setEditTeacherData({ ...editTeacherData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">Teacher ID</label>
                      <input
                        type="text"
                        value={editTeacherData.teacherId}
                        onChange={(e) => setEditTeacherData({ ...editTeacherData, teacherId: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">Phone</label>
                      <input
                        type="tel"
                        required
                        value={editTeacherData.phone}
                        onChange={(e) => setEditTeacherData({ ...editTeacherData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">Account Status</label>
                      <select
                        value={editTeacherData.status}
                        onChange={(e) => setEditTeacherData({ ...editTeacherData, status: e.target.value as any })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                      </select>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Assigned Subjects</label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {SUBJECT_OPTIONS.map((sub) => {
                        const isSelected = editTeacherData.subjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditTeacherData({
                                  ...editTeacherData,
                                  subjects: editTeacherData.subjects.filter((s) => s !== sub),
                                });
                              } else {
                                setEditTeacherData({
                                  ...editTeacherData,
                                  subjects: [...editTeacherData.subjects, sub],
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Assigned Classes</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {CLASS_OPTIONS.map((c) => {
                        const isSelected = editTeacherData.assignedClasses.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditTeacherData({
                                  ...editTeacherData,
                                  assignedClasses: editTeacherData.assignedClasses.filter((cl) => cl !== c),
                                });
                              } else {
                                setEditTeacherData({
                                  ...editTeacherData,
                                  assignedClasses: [...editTeacherData.assignedClasses, c],
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#001c46] text-[#FFC907]'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Assigned Sections</label>
                    <div className="flex gap-2">
                      {SECTION_OPTIONS.map((sec) => {
                        const isSelected = editTeacherData.assignedSections.includes(sec);
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditTeacherData({
                                  ...editTeacherData,
                                  assignedSections: editTeacherData.assignedSections.filter((s) => s !== sec),
                                });
                              } else {
                                setEditTeacherData({
                                  ...editTeacherData,
                                  assignedSections: [...editTeacherData.assignedSections, sec],
                                });
                              }
                            }}
                            className={`w-10 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-black'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {sec}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* PARENT/STUDENT EDIT FORM */}
              {selectedUser.userType === 'PARENT_STUDENT' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">Linked Student</label>
                    <select
                      value={editParentData.studentUid}
                      onChange={(e) => {
                        const std = allActiveStudents.find((s) => s.uid === e.target.value);
                        setEditParentData({
                          ...editParentData,
                          studentUid: e.target.value,
                          studentId: std?.studentId || '',
                        });
                      }}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                    >
                      <option value="">-- Choose active enrolled student --</option>
                      {allActiveStudents.map((std) => (
                        <option key={std.uid} value={std.uid}>
                          {std.name} ({std.studentId}) — {std.className} {std.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">Parent / Guardian Name</label>
                      <input
                        type="text"
                        required
                        value={editParentData.name}
                        onChange={(e) => setEditParentData({ ...editParentData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={editParentData.phone}
                        onChange={(e) => setEditParentData({ ...editParentData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">Account Status</label>
                    <select
                      value={editParentData.status}
                      onChange={(e) => setEditParentData({ ...editParentData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#001c46] focus:bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#001c46] text-[#FFC907] hover:bg-[#002866] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black ${
                    selectedUser.userType === 'TEACHER' ? 'bg-indigo-600 text-white' : 'bg-[#FFC907] text-[#001c46]'
                  }`}
                >
                  {selectedUser.userType === 'TEACHER' ? (
                    <GraduationCap className="w-6 h-6" />
                  ) : (
                    selectedUser.displayName.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <span>{selectedUser.displayName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedUser.userType === 'TEACHER'
                          ? 'bg-indigo-900/60 text-indigo-200'
                          : 'bg-blue-900/60 text-blue-200'
                      }`}
                    >
                      {selectedUser.userType === 'TEACHER' ? 'Faculty Teacher' : 'Parent / Student'}
                    </span>
                  </h3>
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
                  <span className="text-[10px] font-bold text-gray-400 uppercase">User Type</span>
                  <div className="font-bold text-[#001c46] mt-0.5">
                    {selectedUser.userType === 'TEACHER' ? 'TEACHER' : 'PARENT / STUDENT'}
                  </div>
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
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Teacher ID</span>
                  <div className="font-mono font-bold text-indigo-900 mt-0.5">
                    {selectedUser.teacherId || '—'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Contact Phone</span>
                  <div className="text-gray-800 font-medium mt-0.5">
                    {selectedUser.phone || '—'}
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
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Target Panel</span>
                  <div className="text-blue-700 font-bold mt-0.5">
                    {selectedUser.userType === 'TEACHER' ? '/teacher' : '/portal'}
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Firebase Auth UID</span>
                  <div className="font-mono text-[11px] text-gray-600 truncate mt-0.5">
                    {selectedUser.uid}
                  </div>
                </div>
              </div>

              {/* Teacher Academic Assignments */}
              {selectedUser.userType === 'TEACHER' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-[#001c46] uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Academic Assignments</span>
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Assigned Subjects</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedUser.subjects || []).length > 0 ? (
                          selectedUser.subjects?.map((s) => (
                            <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-xs">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">None assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Assigned Classes</span>
                        <div className="flex flex-wrap gap-1">
                          {(selectedUser.assignedClasses || []).length > 0 ? (
                            selectedUser.assignedClasses?.map((c) => (
                              <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-bold text-[11px]">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Assigned Sections</span>
                        <div className="flex flex-wrap gap-1">
                          {(selectedUser.assignedSections || []).length > 0 ? (
                            selectedUser.assignedSections?.map((sec) => (
                              <span key={sec} className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-800 rounded-md font-bold text-[11px]">
                                {sec}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">All Sections</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked Students Section for Parent/Student */}
              {selectedUser.userType === 'PARENT_STUDENT' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#001c46] uppercase tracking-wide flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-blue-600" />
                      <span>Linked Students ({(selectedUser.students || []).length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleOpenEditModal(selectedUser);
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change Link</span>
                    </button>
                  </div>

                  {(selectedUser.students || []).length === 0 ? (
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEditModal(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenToggleStatus(selectedUser);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    selectedUser.status === 'ACTIVE'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedUser.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{selectedUser.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}</span>
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
      {/* CONFIRM TOGGLE STATUS MODAL                                               */}
      {/* ========================================================================= */}
      {isToggleStatusModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#001c46]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                selectedUser.status === 'ACTIVE'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {selectedUser.status === 'ACTIVE' ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-[#001c46]">
                {selectedUser.status === 'ACTIVE' ? 'Disable Account Access?' : 'Enable Account Access?'}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedUser.status === 'ACTIVE'
                  ? `Disabling account will prevent ${selectedUser.displayName} (${selectedUser.email}) from logging into the portal immediately. All attendance, grades, and marks remain completely intact.`
                  : `Enabling account will restore login access for ${selectedUser.displayName} (${selectedUser.email}).`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsToggleStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatusConfirm}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer text-white ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{selectedUser.status === 'ACTIVE' ? 'Confirm Disable' : 'Confirm Enable'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
