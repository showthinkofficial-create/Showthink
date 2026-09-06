import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { CLASS_OPTIONS, StudentFilterOptions } from '../../../types/student';

interface StudentFiltersProps {
  filters: StudentFilterOptions;
  availableSections: string[];
  onChange: (filters: StudentFilterOptions) => void;
  onReset: () => void;
}

export default function StudentFilters({
  filters,
  availableSections,
  onChange,
  onReset,
}: StudentFiltersProps) {
  const hasActiveFilters =
    filters.className !== '' ||
    filters.board !== '' ||
    filters.status !== '' ||
    filters.section !== '';

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mr-1">
        <Filter className="w-3.5 h-3.5 text-[#001c46]" />
        <span className="hidden sm:inline">Filter By:</span>
      </div>

      {/* Class Filter */}
      <select
        value={filters.className}
        onChange={(e) => onChange({ ...filters, className: e.target.value })}
        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer"
      >
        <option value="">All Classes</option>
        {CLASS_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Board Filter */}
      <select
        value={filters.board}
        onChange={(e) => onChange({ ...filters, board: e.target.value })}
        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer"
      >
        <option value="">All Boards</option>
        <option value="CBSE">CBSE</option>
        <option value="UP Board">UP Board</option>
      </select>

      {/* Section Filter */}
      <select
        value={filters.section}
        onChange={(e) => onChange({ ...filters, section: e.target.value })}
        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer"
      >
        <option value="">All Sections</option>
        {availableSections.length > 0 ? (
          availableSections.map((sec) => (
            <option key={sec} value={sec}>
              Section {sec}
            </option>
          ))
        ) : (
          <>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </>
        )}
      </select>

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
