import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Paperclip,
  Search,
  Filter,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Notice } from '../../types/notice';
import { Student } from '../../types/student';

interface StudentNoticesViewProps {
  notices: Notice[];
  student: Student;
}

export const StudentNoticesView: React.FC<StudentNoticesViewProps> = ({ notices, student }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Filter notices relevant ONLY to student:
  // targetAudience === 'ALL_STUDENTS' OR (targetAudience === 'SPECIFIC_CLASS' && targetClass === student.className)
  // OR (targetAudience === 'SPECIFIC_SECTION' && targetClass === student.className && targetSection === student.section)
  const relevantNotices = notices.filter((n) => {
    // Exclude DRAFT or ARCHIVED
    if (n.status !== 'PUBLISHED') return false;

    // Audience filter
    const isTarget =
      n.targetAudience === 'ALL_STUDENTS' ||
      (n.targetAudience === 'SPECIFIC_CLASS' && n.targetClass === student.className) ||
      (n.targetAudience === 'SPECIFIC_SECTION' && n.targetClass === student.className && n.targetSection === student.section);

    if (!isTarget) return false;

    // Type filter
    if (selectedType !== 'ALL' && n.type.toLowerCase() !== selectedType.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      return (
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#001c46]">
            <Bell className="w-6 h-6 text-[#FFC907]" />
            <h1 className="text-xl font-black">Official Notices & Circulars</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Published institutional announcements, holiday circulars, and class notifications.
          </p>
        </div>

        <div className="px-3 py-1 bg-red-100 text-red-800 rounded-xl text-xs font-black uppercase shrink-0">
          {relevantNotices.length} Published Notices
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notice by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#001c46] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Event">Event</option>
            <option value="Exam">Exam</option>
            <option value="Holiday">Holiday</option>
            <option value="General Announcement">General Announcement</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      {relevantNotices.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <Bell className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800">No Notices Available</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            There are currently no active published notices or circulars matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {relevantNotices.map((notice) => {
            let priorityBadge = null;
            if (notice.priority === 'URGENT') {
              priorityBadge = (
                <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-md uppercase">
                  URGENT
                </span>
              );
            } else if (notice.priority === 'IMPORTANT') {
              priorityBadge = (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md uppercase">
                  IMPORTANT
                </span>
              );
            }

            return (
              <div
                key={notice.id}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3 hover:border-[#001c46] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#001c46] text-[#FFC907] text-[10px] font-black rounded-md uppercase tracking-wider">
                      {notice.type}
                    </span>
                    {priorityBadge}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Published: {notice.publishDate}</span>
                  </div>
                </div>

                <h3 className="font-black text-base text-gray-900">{notice.title}</h3>

                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-normal">
                  {notice.description}
                </p>

                {notice.attachmentUrl && (
                  <div className="pt-2">
                    <a
                      href={notice.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#001c46] text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-blue-200"
                    >
                      <Paperclip className="w-4 h-4 text-[#FFC907]" />
                      <span>{notice.attachmentName || 'Download Notice Attachment'}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
