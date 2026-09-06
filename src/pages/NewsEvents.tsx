import React, { useState, useEffect } from 'react';
import { NEWS_EVENTS } from '../data/content';
import { ChevronRight, X, Calendar, Bell } from 'lucide-react';
import { noticeService } from '../services/noticeService';
import { Notice } from '../types/notice';

export default function NewsEvents() {
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [publishedNotices, setPublishedNotices] = useState<any[]>(NEWS_EVENTS);

  useEffect(() => {
    async function loadLiveNotices() {
      try {
        const live = await noticeService.getNotices({ status: 'PUBLISHED' });
        if (live && live.length > 0) {
          const formatted = live.map((n: Notice) => ({
            id: n.id,
            title: n.title,
            date: n.publishDate || new Date().toISOString().split('T')[0],
            category: n.type || 'Notice',
            summary: n.description || '',
            content: n.description || '',
            imageUrl: n.attachmentUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'
          }));
          setPublishedNotices(formatted);
        }
      } catch (e) {
        console.warn('Using static notices fallback:', e);
      }
    }
    loadLiveNotices();
  }, []);

  const activeNews = publishedNotices.find(item => item.id === selectedNewsId);

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Page Title */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            School Bulletin
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            News, Events & Notifications
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Stay updated with school board outcomes, monsoon sports leagues, and holiday calendar notices.
          </p>
        </div>
      </section>

      {/* Main Grid display of News cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#001c46]">
            Official Announcements
          </h2>
          <div className="w-16 h-1 bg-[#FFC907] mx-auto rounded-full"></div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Direct notifications from Noida Headquarters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {publishedNotices.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-white text-[#001c46] text-[10px] font-black uppercase tracking-wider rounded-lg shadow">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-mono text-gray-400 block font-bold">
                    {item.date}
                  </span>
                  <h3 className="font-sans font-extrabold text-[#001c46] text-base leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedNewsId(item.id)}
                  className="text-xs font-bold text-[#1A325D] hover:text-[#001c46] flex items-center gap-1 uppercase tracking-wider"
                >
                  Read Full Notice <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News Full View Modal */}
      {activeNews && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedNewsId(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedNewsId(null)}
              className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-mono uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded inline-block font-bold">
              {activeNews.category}
            </span>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 block">{activeNews.date}</span>
              <h3 className="text-xl sm:text-2xl font-sans font-black text-[#001c46]">
                {activeNews.title}
              </h3>
            </div>

            <div className="h-48 w-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
              <img
                src={activeNews.imageUrl}
                alt={activeNews.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              {activeNews.content}
            </p>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
              <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest font-mono">
                Issued by GP Academy Relations Desk
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
