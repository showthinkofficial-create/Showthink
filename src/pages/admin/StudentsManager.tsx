import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Users, AlertCircle, RefreshCw, Inbox, UserPlus } from 'lucide-react';
import { Student, StudentFilterOptions, StudentFormData } from '../../types/student';
import { studentService } from '../../services/studentService';
import { admissionService } from '../../services/admissionService';

import StudentSearch from '../../components/admin/students/StudentSearch';
import StudentFilters from '../../components/admin/students/StudentFilters';
import StudentTable from '../../components/admin/students/StudentTable';
import StudentCard from '../../components/admin/students/StudentCard';
import StudentForm from '../../components/admin/students/StudentForm';
import StudentProfile from '../../components/admin/students/StudentProfile';
import ConfirmDialog from '../../components/admin/students/ConfirmDialog';
import Pagination from '../../components/admin/students/Pagination';

interface StudentsManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const PAGE_SIZE = 20;

export default function StudentsManager({ currentPath, onNavigate }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoGenId, setAutoGenId] = useState<string>('1GP001');

  // Filter & Search State
  const [filters, setFilters] = useState<StudentFilterOptions>({
    searchQuery: '',
    className: '',
    board: '',
    status: '',
    section: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Disable Dialog State
  const [disableTarget, setDisableTarget] = useState<Student | null>(null);
  const [isDisabling, setIsDisabling] = useState<boolean>(false);

  // Action Loading State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Parse path parameters (e.g. /admin/students/add or /admin/students/:uid or /admin/students/:uid/edit)
  const viewMode = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    if (cleanPath === '/admin/students') return 'list';
    if (cleanPath === '/admin/students/add') return 'add';
    if (cleanPath.endsWith('/edit')) return 'edit';
    return 'profile';
  }, [currentPath]);

  const activeUid = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    const parts = cleanPath.split('/admin/students/');
    if (!parts[1]) return null;
    const subParts = parts[1].split('/');
    if (subParts[0] === 'add') return null;
    return subParts[0]; // UID
  }, [currentPath]);

  // Load students from Firestore with Real-time Subscription
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Initial ID generation
    studentService.generateNextStudentId().then(setAutoGenId).catch(console.warn);

    const unsubscribe = studentService.subscribeStudents((data) => {
      setStudents(data);
      setLoading(false);
      studentService.generateNextStudentId().then(setAutoGenId).catch(console.warn);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentService.getStudents();
      setStudents(data);
      const nextId = await studentService.generateNextStudentId();
      setAutoGenId(nextId);
    } catch (err: any) {
      console.error('Failed to load students:', err);
    }
  };

  // Filtered & Searched Students
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      // Search query (Name, ID, Phone, Parent Name)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const nameMatch = std.name.toLowerCase().includes(q);
        const idMatch = std.studentId.toLowerCase().includes(q);
        const phoneMatch = std.phone.includes(q);
        const parentMatch = std.parentName.toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !phoneMatch && !parentMatch) {
          return false;
        }
      }

      // Class Filter
      if (filters.className && std.className !== filters.className) {
        return false;
      }

      // Board Filter
      if (filters.board && std.board !== filters.board) {
        return false;
      }

      // Status Filter
      if (filters.status && std.status !== filters.status) {
        return false;
      }

      // Section Filter
      if (filters.section && (std.section || 'A').toUpperCase() !== filters.section.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [students, filters]);

  // Dynamic sections available across loaded students
  const availableSections = useMemo(() => {
    const secs = new Set<string>();
    students.forEach((s) => {
      if (s.section) secs.add(s.section.toUpperCase());
    });
    return Array.from(secs).sort();
  }, [students]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handlers
  const handleAddStudent = async (formData: StudentFormData) => {
    setIsSubmitting(true);
    try {
      const createdStudent = await studentService.addStudent(formData);
      
      // Check if this student creation originated from an admission enquiry conversion
      const rawConvert = sessionStorage.getItem('gp_convert_enquiry');
      if (rawConvert) {
        try {
          const parsed = JSON.parse(rawConvert);
          if (parsed.fromEnquiryId && createdStudent.studentId) {
            await admissionService.linkConvertedStudent(parsed.fromEnquiryId, createdStudent.studentId);
          }
        } catch (e) {
          console.error('Error linking converted enquiry:', e);
        } finally {
          sessionStorage.removeItem('gp_convert_enquiry');
        }
      }

      await loadStudents();
      onNavigate('/admin/students');
    } catch (err) {
      console.error('Error adding student:', err);
      alert('Failed to save student profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (formData: StudentFormData) => {
    if (!activeUid) return;
    setIsSubmitting(true);
    try {
      await studentService.updateStudent(activeUid, formData);
      await loadStudents();
      onNavigate('/admin/students');
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Failed to update student profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!disableTarget) return;
    setIsDisabling(true);
    try {
      if (disableTarget.status === 'ACTIVE') {
        await studentService.disableStudent(disableTarget.uid);
      } else {
        await studentService.enableStudent(disableTarget.uid);
      }
      await loadStudents();
      setDisableTarget(null);
    } catch (err) {
      console.error('Error updating student status:', err);
      alert('Failed to update student status.');
    } finally {
      setIsDisabling(false);
    }
  };

  // Find active student object if in profile/edit mode
  const activeStudent = useMemo(() => {
    if (!activeUid) return null;
    return students.find((s) => s.uid === activeUid) || null;
  }, [students, activeUid]);

  // Render ADD Form
  if (viewMode === 'add') {
    let prefillData: Student | null = null;
    const rawConvert = sessionStorage.getItem('gp_convert_enquiry');
    if (rawConvert) {
      try {
        const parsed = JSON.parse(rawConvert);
        prefillData = {
          uid: '',
          studentId: autoGenId,
          name: parsed.name || '',
          parentName: parsed.parentName || '',
          phone: parsed.phone || '',
          className: parsed.className || 'Class 1',
          board: parsed.board || 'CBSE',
          section: 'A',
          rollNumber: '',
          previousSchool: parsed.previousSchool || '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (e) {
        console.error('Error parsing convert enquiry prefill:', e);
      }
    }

    return (
      <div className="space-y-4">
        {rawConvert && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-sans">
            <div className="flex items-center gap-2 font-bold">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Converting Admission Enquiry into Official Student Record</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('gp_convert_enquiry');
                window.location.reload();
              }}
              className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-950 cursor-pointer"
            >
              Clear Prefill
            </button>
          </div>
        )}
        <StudentForm
          initialData={prefillData}
          autoGeneratedStudentId={autoGenId}
          isLoading={isSubmitting}
          onSubmit={handleAddStudent}
          onCancel={() => {
            sessionStorage.removeItem('gp_convert_enquiry');
            onNavigate('/admin/students');
          }}
        />
      </div>
    );
  }

  // Render EDIT Form
  if (viewMode === 'edit') {
    if (loading) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 font-sans">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading student profile details...</p>
        </div>
      );
    }

    if (!activeStudent) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-4 font-sans max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-black text-[#001c46]">Student Record Not Found</h3>
          <p className="text-xs text-gray-500">The requested student profile UID does not exist or was removed.</p>
          <button
            onClick={() => onNavigate('/admin/students')}
            className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold"
          >
            Back to Students
          </button>
        </div>
      );
    }

    return (
      <StudentForm
        initialData={activeStudent}
        isEditMode={true}
        isLoading={isSubmitting}
        onSubmit={handleEditStudent}
        onCancel={() => onNavigate(`/admin/students/${activeStudent.uid}`)}
      />
    );
  }

  // Render PROFILE View
  if (viewMode === 'profile' && activeUid) {
    if (loading) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 font-sans">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading student profile...</p>
        </div>
      );
    }

    if (!activeStudent) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-4 font-sans max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-black text-[#001c46]">Student Record Not Found</h3>
          <p className="text-xs text-gray-500">The requested student UID could not be retrieved from database.</p>
          <button
            onClick={() => onNavigate('/admin/students')}
            className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold"
          >
            Back to Students
          </button>
        </div>
      );
    }

    return (
      <>
        <StudentProfile
          student={activeStudent}
          onEdit={() => onNavigate(`/admin/students/${activeStudent.uid}/edit`)}
          onDisable={() => setDisableTarget(activeStudent)}
          onBack={() => onNavigate('/admin/students')}
        />

        {/* Confirm Enable / Disable Modal */}
        <ConfirmDialog
          isOpen={!!disableTarget}
          title={disableTarget?.status === 'ACTIVE' ? 'Disable Student Account' : 'Enable Student Account'}
          message={
            disableTarget?.status === 'ACTIVE'
              ? `Are you sure you want to disable ${disableTarget?.name} (${disableTarget?.studentId})?`
              : `Are you sure you want to re-enable and activate ${disableTarget?.name} (${disableTarget?.studentId})?`
          }
          confirmText={disableTarget?.status === 'ACTIVE' ? 'Disable Student' : 'Enable Student'}
          variant={disableTarget?.status === 'ACTIVE' ? 'danger' : 'success'}
          note={
            disableTarget?.status === 'ACTIVE'
              ? 'Disabling will change the student status to DISABLED. Their record will remain safely in Firestore, but they will be restricted from portal logins.'
              : 'Enabling will restore the student status to ACTIVE, permitting full access to student profile features and portals.'
          }
          isLoading={isDisabling}
          onConfirm={handleConfirmToggleStatus}
          onCancel={() => setDisableTarget(null)}
        />
      </>
    );
  }

  // Render LIST View (Default /admin/students)
  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#001c46] text-[#FFC907] rounded-2xl shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#001c46] tracking-tight">Student Directory</h2>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Manage student enrollments, academic profiles, and status records.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/admin/students/add')}
          className="inline-flex items-center justify-center gap-2 bg-[#001c46] hover:bg-[#1a325d] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FFC907]" />
          <span>Add Student</span>
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
            onClick={loadStudents}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-[11px] font-extrabold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filters Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <StudentSearch
          value={filters.searchQuery}
          onChange={(q) => setFilters({ ...filters, searchQuery: q })}
        />

        <StudentFilters
          filters={filters}
          availableSections={availableSections}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              searchQuery: '',
              className: '',
              board: '',
              status: '',
              section: '',
            })
          }
        />
      </div>

      {/* Content Area: Table / Cards / Loading / Empty */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading student directory from Firestore...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#001c46]">No students found.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {students.length === 0
                ? 'There are no student profiles registered in the database yet.'
                : 'No student records match your current search and filter criteria.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/admin/students/add')}
            className="inline-flex items-center gap-2 bg-[#001c46] hover:bg-[#1a325d] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFC907]" />
            <span>Add Student</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <StudentTable
              students={paginatedStudents}
              onView={(uid) => onNavigate(`/admin/students/${uid}`)}
              onEdit={(uid) => onNavigate(`/admin/students/${uid}/edit`)}
              onDisable={(student) => setDisableTarget(student)}
            />
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
            {paginatedStudents.map((std) => (
              <StudentCard
                key={std.uid}
                student={std}
                onView={(uid) => onNavigate(`/admin/students/${uid}`)}
                onEdit={(uid) => onNavigate(`/admin/students/${uid}/edit`)}
                onDisable={(student) => setDisableTarget(student)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredStudents.length}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Confirm Enable / Disable Modal */}
      <ConfirmDialog
        isOpen={!!disableTarget}
        title={disableTarget?.status === 'ACTIVE' ? 'Disable Student Account' : 'Enable Student Account'}
        message={
          disableTarget?.status === 'ACTIVE'
            ? `Are you sure you want to disable ${disableTarget?.name} (${disableTarget?.studentId})?`
            : `Are you sure you want to re-enable and activate ${disableTarget?.name} (${disableTarget?.studentId})?`
        }
        confirmText={disableTarget?.status === 'ACTIVE' ? 'Disable Student' : 'Enable Student'}
        variant={disableTarget?.status === 'ACTIVE' ? 'danger' : 'success'}
        note={
          disableTarget?.status === 'ACTIVE'
            ? 'Disabling will change the student status to DISABLED. Their record will remain safely in Firestore, but they will be restricted from portal logins.'
            : 'Enabling will restore the student status to ACTIVE, permitting full access to student profile features and portals.'
        }
        isLoading={isDisabling}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setDisableTarget(null)}
      />
    </div>
  );
}
