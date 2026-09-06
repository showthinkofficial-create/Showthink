import React, { useState } from 'react';
import { Notice } from '../../types/notice';
import {
  Bell,
  Search,
  Filter,
  Calendar,
  FileText,
  Paperclip,
  X,
  AlertCircle
} from 'lucide-react';

interface TeacherNoticesViewProps {
  notices: Notice[];
}

export const TeacherNoticesView: React.FC<TeacherNoticesViewProps> = ({ notices }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const filteredNotices = notices.filter((n) => {
    if (selectedType !== 'ALL' && n.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Search Filter */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <Bell className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-black">Faculty Notice Board</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Official circulars, administrative announcements, and academic updates.
            </p>
          </div>

          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-xs">
            {filteredNotices.length} Active Circulars
          </span>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          
          <div className="sm:col-span-2 space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Keyword Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search circular title or contents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Notice Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Notice Types</option>
              <option value="GENERAL">General Notice</option>
              <option value="URGENT">Urgent Circular</option>
              <option value="ACADEMIC">Academic Announcement</option>
              <option value="EXAM">Examination Notice</option>
              <option value="HOLIDAY">Holiday Declaration</option>
              <option value="EVENT">School Event</option>
            </select>
          </div>

        </div>

      </div>

      {/* Notices List Cards Grid */}
      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setActiveNotice(notice)}
              className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase ${
                      notice.priority === 'URGENT' || notice.type === 'URGENT'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {notice.type}
                  </span>
                  <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {notice.publishDate}
                  </span>
                </div>

                <h3 className="font-extrabold text-[#001c46] text-sm line-clamp-2 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {notice.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-amber-700 font-bold">
                <span>Audience: {notice.targetAudience}</span>
                <span>Click to expand →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
          <Bell className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-extrabold text-gray-800">No Matching Circulars</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No active faculty circulars found matching your current search criteria.
          </p>
        </div>
      )}

      {/* Notice Detail Modal */}
      {activeNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn space-y-0">
            
            <div className="bg-[#001c46] text-white p-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFC907] text-[#001c46] text-[10px] font-black uppercase">
                  {activeNotice.type}
                </span>
                <h3 className="text-lg font-black tracking-tight leading-snug">
                  {activeNotice.title}
                </h3>
                <p className="text-xs text-blue-200 font-mono">
                  Published: {activeNotice.publishDate}
                </p>
              </div>
              <button
                onClick={() => setActiveNotice(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="prose prose-xs max-w-none text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                {activeNotice.description}
              </div>

              {activeNotice.attachmentUrl && (
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={activeNotice.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs transition-all"
                  >
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>Download Attachment File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
              <button
                onClick={() => setActiveNotice(null)}
                className="px-5 py-2 bg-[#001c46] text-white text-xs font-bold rounded-xl hover:bg-[#1a325d]"
              >
                Close Notice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
