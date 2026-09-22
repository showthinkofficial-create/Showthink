import React, { useState } from 'react';
import { Student } from '../../types/student';
import { Notice } from '../../types/notice';
import {
  Bell,
  Search,
  FileText,
  Download,
  AlertCircle,
  Clock,
  Calendar,
  ExternalLink,
  Tag,
  Paperclip,
} from 'lucide-react';

interface ParentNoticesViewProps {
  student: Student | null;
  notices: Notice[];
}

export const ParentNoticesView: React.FC<ParentNoticesViewProps> = ({
  student,
  notices,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredNotices = notices.filter((notice) => {
    if (priorityFilter !== 'ALL' && notice.priority !== priorityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notice.title.toLowerCase().includes(q);
      const matchDesc = notice.description.toLowerCase().includes(q);
      const matchType = notice.type.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">School Notices & Circulars</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Official announcements for parents & students of Class {student?.className || 'GP Academy'}.
          </p>
        </div>

        <div className="text-xs bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-gray-600 font-semibold self-start sm:self-auto">
          Active Notices: <span className="font-bold text-[#001c46]">{filteredNotices.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, exams, holidays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46]"
          />
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'].map((p) => {
            const isSelected = priorityFilter === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#001c46] text-[#FFC907] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'ALL' ? 'All Priority' : p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <Bell className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Matching Notices</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            There are currently no circulars matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => {
            const isUrgent = notice.priority === 'URGENT';
            const isImportant = notice.priority === 'IMPORTANT';

            return (
              <div
                key={notice.id}
                className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-xs hover:border-[#001c46] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Meta Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          isUrgent
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isImportant
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {notice.priority}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-md">
                        {notice.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{notice.publishDate}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-900 leading-snug break-words">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line break-words">
                      {notice.description}
                    </p>
                  </div>
                </div>

                {/* Footer Attachment or Audience Pill */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Audience: {notice.targetAudience.replace(/_/g, ' ')}
                  </span>

                  {notice.attachmentUrl && (
                    <a
                      href={notice.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#001c46] hover:text-[#1a325d] bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all border border-amber-200 max-w-full"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#001c46] shrink-0" />
                      <span className="truncate">View Circular Attachment</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
