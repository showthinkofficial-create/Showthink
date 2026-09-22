import React, { useState, useEffect, useMemo } from 'react';
import { Plus, UserCheck, AlertCircle, RefreshCw, Inbox, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Teacher, TeacherFilterOptions, TeacherFormData } from '../../types/teacher';
import { teacherService } from '../../services/teacherService';

import TeacherSearch from '../../components/admin/teachers/TeacherSearch';
import TeacherFilters from '../../components/admin/teachers/TeacherFilters';
import TeacherTable from '../../components/admin/teachers/TeacherTable';
import TeacherCard from '../../components/admin/teachers/TeacherCard';
import TeacherForm from '../../components/admin/teachers/TeacherForm';
import TeacherProfile from '../../components/admin/teachers/TeacherProfile';
import TeacherConfirmDialog, { DialogActionType } from '../../components/admin/teachers/TeacherConfirmDialog';

interface TeachersManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const PAGE_SIZE = 15;

export default function TeachersManager({ currentPath, onNavigate }: TeachersManagerProps) {
  const { userProfile, currentUser } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Search State
  const [filters, setFilters] = useState<TeacherFilterOptions>({
    searchQuery: '',
    status: '',
    subject: '',
    assignedClass: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Action Dialog State (disable, enable, reset-password, delete)
  const [dialogTarget, setDialogTarget] = useState<Teacher | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogActionType>('disable');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Access check: Only SUPER_ADMIN and ADMIN
  const isAuthorized = userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';

  // Clear feedback message automatically after 6 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Parse path parameters (e.g. /admin/teachers, /admin/teachers/add, /admin/teachers/:uid, /admin/teachers/:uid/edit)
  const viewMode = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    if (cleanPath === '/admin/teachers') return 'list';
    if (cleanPath === '/admin/teachers/add') return 'add';
    if (cleanPath.endsWith('/edit')) return 'edit';
    return 'profile';
  }, [currentPath]);

  const activeUid = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    const parts = cleanPath.split('/admin/teachers/');
    if (!parts[1]) return null;
    const subParts = parts[1].split('/');
    return subParts[0] && subParts[0] !== 'add' ? subParts[0] : null;
  }, [currentPath]);

  // Load teacher list from Firestore
  const fetchTeachers = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data);
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Failed to load teacher records from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchTeachers();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  // Active teacher for profile or edit mode
  const activeTeacher = useMemo(() => {
    if (!activeUid) return null;
    return teachers.find((t) => t.uid === activeUid) || null;
  }, [activeUid, teachers]);

  // Extract all available subjects across all teachers for filter dropdown
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (Array.isArray(t.subjects)) {
        t.subjects.forEach((s) => set.add(s));
      }
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Filtered & Searched Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      // 1. Search Query (Name, Teacher ID, Email, Phone)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = teacher.name.toLowerCase().includes(query);
        const matchesId = teacher.teacherId.toLowerCase().includes(query);
        const matchesEmail = teacher.email.toLowerCase().includes(query);
        const matchesPhone = teacher.phone.includes(query);

        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status && teacher.status !== filters.status) {
        return false;
      }

      // 3. Subject Filter
      if (filters.subject && (!teacher.subjects || !teacher.subjects.includes(filters.subject))) {
        return false;
      }

      // 4. Assigned Class Filter
      if (filters.assignedClass && (!teacher.assignedClasses || !teacher.assignedClasses.includes(filters.assignedClass))) {
        return false;
      }

      return true;
    });
  }, [teachers, filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Paginated subset
  const totalPages = Math.ceil(filteredTeachers.length / PAGE_SIZE) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, currentPage]);

  // Handlers
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      status: '',
      subject: '',
      assignedClass: '',
    });
  };

  const handleAddSubmit = async (formData: TeacherFormData) => {
    const created = await teacherService.addTeacher(
      formData,
      currentUser?.uid,
      currentUser?.email || undefined
    );
    await fetchTeachers();
    setFeedback({
      type: 'success',
      text: `Teacher ${created.name} (${created.teacherId}) registered successfully. An account setup email was dispatched.`,
    });
    onNavigate(`/admin/teachers/${created.uid}`);
  };

  const handleEditSubmit = async (formData: TeacherFormData) => {
    if (!activeUid) return;
    await teacherService.updateTeacher(
      activeUid,
      formData,
      currentUser?.uid
    );
    await fetchTeachers();
    setFeedback({
      type: 'success',
      text: `Teacher record for ${formData.name} updated successfully.`,
    });
    onNavigate(`/admin/teachers/${activeUid}`);
  };

  // Action open handlers
  const handleToggleStatus = (teacher: Teacher) => {
    setDialogAction(teacher.status === 'ACTIVE' ? 'disable' : 'enable');
    setDialogTarget(teacher);
  };

  const handleResetPassword = (teacher: Teacher) => {
    setDialogAction('reset-password');
    setDialogTarget(teacher);
  };

  const handleDelete = (teacher: Teacher) => {
    setDialogAction('delete');
    setDialogTarget(teacher);
  };

  const handleConfirmAction = async () => {
    if (!dialogTarget) return;
    setIsActionLoading(true);

    try {
      if (dialogAction === 'disable') {
        await teacherService.disableTeacher(
          dialogTarget.uid,
          currentUser?.uid,
          currentUser?.email || undefined
        );
        setFeedback({
          type: 'success',
          text: `Account for ${dialogTarget.name} has been disabled.`,
        });
      } else if (dialogAction === 'enable') {
        await teacherService.enableTeacher(
          dialogTarget.uid,
          currentUser?.uid,
          currentUser?.email || undefined
        );
        setFeedback({
          type: 'success',
          text: `Account for ${dialogTarget.name} has been activated.`,
        });
      } else if (dialogAction === 'reset-password') {
        const result = await teacherService.resetPassword(
          dialogTarget.uid,
          dialogTarget.email,
          currentUser?.uid,
          currentUser?.email || undefined
        );
        setFeedback({
          type: 'success',
          text: result.message || `Password reset link dispatched to ${dialogTarget.email}.`,
        });
      } else if (dialogAction === 'delete') {
        await teacherService.softDeleteTeacher(
          dialogTarget.uid,
          currentUser?.uid,
          currentUser?.email || undefined
        );
        setFeedback({
          type: 'success',
          text: `Teacher record for ${dialogTarget.name} was successfully deactivated.`,
        });
        if (viewMode === 'profile' || viewMode === 'edit') {
          onNavigate('/admin/teachers');
        }
      }

      await fetchTeachers();
      setDialogTarget(null);
    } catch (err: any) {
      console.error(`Failed to execute ${dialogAction}:`, err);
      setFeedback({
        type: 'error',
        text: err.message || `Failed to perform action: ${dialogAction}`,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Check 1: Access Denied for non-admin roles
  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Access Denied
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
            Faculty Directory management is restricted exclusively to System Administrators and Super Admins.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/admin')}
          className="px-5 py-2.5 bg-[#001c46] hover:bg-[#001c46]/90 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
        >
          Return to Panel
        </button>
      </div>
    );
  }

  // View Mode: ADD TEACHER FORM
  if (viewMode === 'add') {
    return (
      <TeacherForm
        onSubmit={handleAddSubmit}
        onCancel={() => onNavigate('/admin/teachers')}
        isEditing={false}
      />
    );
  }

  // View Mode: EDIT TEACHER FORM
  if (viewMode === 'edit') {
    if (loading) {
      return (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#001c46]/20 border-t-[#001c46] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading teacher details...</p>
        </div>
      );
    }

    if (!activeTeacher) {
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-gray-800">Teacher record not found.</p>
          <button
            onClick={() => onNavigate('/admin/teachers')}
            className="px-4 py-2 bg-[#001c46] text-white text-xs font-bold rounded-xl"
          >
            Back to Teachers
          </button>
        </div>
      );
    }

    return (
      <TeacherForm
        initialTeacher={activeTeacher}
        onSubmit={handleEditSubmit}
        onCancel={() => onNavigate(`/admin/teachers/${activeTeacher.uid}`)}
        isEditing={true}
      />
    );
  }

  // View Mode: TEACHER PROFILE
  if (viewMode === 'profile') {
    if (loading) {
      return (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#001c46]/20 border-t-[#001c46] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading profile...</p>
        </div>
      );
    }

    if (!activeTeacher) {
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-gray-800">Teacher record not found.</p>
          <button
            onClick={() => onNavigate('/admin/teachers')}
            className="px-4 py-2 bg-[#001c46] text-white text-xs font-bold rounded-xl"
          >
            Back to Teachers
          </button>
        </div>
      );
    }

    return (
      <>
        {feedback && (
          <div
            className={`mb-4 p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <TeacherProfile
          teacher={activeTeacher}
          onBack={() => onNavigate('/admin/teachers')}
          onEdit={() => onNavigate(`/admin/teachers/${activeTeacher.uid}/edit`)}
          onToggleStatus={() => handleToggleStatus(activeTeacher)}
          onResetPassword={() => handleResetPassword(activeTeacher)}
          onDelete={() => handleDelete(activeTeacher)}
        />

        <TeacherConfirmDialog
          isOpen={Boolean(dialogTarget)}
          teacher={dialogTarget}
          actionType={dialogAction}
          onConfirm={handleConfirmAction}
          onCancel={() => setDialogTarget(null)}
          isLoading={isActionLoading}
        />
      </>
    );
  }

  // View Mode: LIST TEACHERS
  return (
    <div className="space-y-6">
      {/* Top Action Bar & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#001c46]/10 text-[#001c46] flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Teacher Management
            </h1>
            <p className="text-xs text-gray-500">
              Manage faculty profiles, credentials, class allocations, and portal access
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/admin/teachers/add')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#001c46] hover:bg-[#001c46]/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <TeacherSearch
            value={filters.searchQuery}
            onChange={(val) => setFilters((prev) => ({ ...prev, searchQuery: val }))}
          />
          <TeacherFilters
            filters={filters}
            availableSubjects={availableSubjects}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Results Count & Refresh */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold pt-2 border-t border-gray-100">
          <span>
            Showing {filteredTeachers.length} of {teachers.length} teacher records
          </span>
          <button
            onClick={fetchTeachers}
            className="flex items-center gap-1.5 hover:text-[#001c46] transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Records</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 space-y-3">
          <div className="w-8 h-8 border-3 border-[#001c46]/20 border-t-[#001c46] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Syncing teachers from Firestore...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 shadow-2xs space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-gray-900">
              No teachers found.
            </h3>
            <p className="text-xs text-gray-500">
              {teachers.length === 0
                ? 'No faculty members registered in GP Academy database yet.'
                : 'No teachers match your current search query or filter selection.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {teachers.length > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => onNavigate('/admin/teachers/add')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#001c46] hover:bg-[#001c46]/90 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>
      ) : (
        /* Teacher Records Presentation */
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TeacherTable
              teachers={paginatedTeachers}
              onView={(t) => onNavigate(`/admin/teachers/${t.uid}`)}
              onEdit={(t) => onNavigate(`/admin/teachers/${t.uid}/edit`)}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
              onDelete={handleDelete}
            />
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {paginatedTeachers.map((t) => (
              <TeacherCard
                key={t.uid}
                teacher={t}
                onView={(teacher) => onNavigate(`/admin/teachers/${teacher.uid}`)}
                onEdit={(teacher) => onNavigate(`/admin/teachers/${teacher.uid}/edit`)}
                onToggleStatus={handleToggleStatus}
                onResetPassword={handleResetPassword}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs font-bold text-gray-600">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Teacher Actions */}
      <TeacherConfirmDialog
        isOpen={Boolean(dialogTarget)}
        teacher={dialogTarget}
        actionType={dialogAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setDialogTarget(null)}
        isLoading={isActionLoading}
      />
    </div>
  );
}

