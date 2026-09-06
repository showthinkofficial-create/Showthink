import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { SUBJECT_OPTIONS, TeacherFilterOptions } from '../../../types/teacher';
import { CLASS_OPTIONS } from '../../../types/student';

interface TeacherFiltersProps {
  filters: TeacherFilterOptions;
  availableSubjects?: string[];
  onChange: (filters: TeacherFilterOptions) => void;
  onReset: () => void;
}

export default function TeacherFilters({
  filters,
  availableSubjects,
  onChange,
  onReset,
}: TeacherFiltersProps) {
  const hasActiveFilters =
    filters.status !== '' ||
    filters.subject !== '' ||
    filters.assignedClass !== '';

  const subjectList = availableSubjects && availableSubjects.length > 0
    ? availableSubjects
    : Array.from(SUBJECT_OPTIONS);

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mr-1">
        <Filter className="w-3.5 h-3.5 text-[#001c46]" />
        <span className="hidden sm:inline">Filter By:</span>
      </div>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="DISABLED">DISABLED</option>
      </select>

      {/* Subject Filter */}
      <select
        value={filters.subject}
        onChange={(e) => onChange({ ...filters, subject: e.target.value })}
        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer max-w-[160px] truncate"
      >
        <option value="">All Subjects</option>
        {subjectList.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      {/* Assigned Class Filter */}
      <select
        value={filters.assignedClass}
        onChange={(e) => onChange({ ...filters, assignedClass: e.target.value })}
        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer"
      >
        <option value="">All Classes</option>
        {CLASS_OPTIONS.map((cls) => (
          <option key={cls} value={cls}>
            {cls}
          </option>
        ))}
      </select>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          title="Clear active filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
