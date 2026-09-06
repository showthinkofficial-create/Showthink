import React from 'react';
import { Search, X } from 'lucide-react';

interface StudentSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StudentSearch({ value, onChange }: StudentSearchProps) {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Name, ID, Phone, or Parent..."
        className="w-full pl-10 pr-9 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-[#001c46] rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none transition-all shadow-2xs"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
