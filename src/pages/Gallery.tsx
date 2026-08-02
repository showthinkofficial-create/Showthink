import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../data/content';
import { ZoomIn } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';

type FilterType = 'All' | 'Campus' | 'Activities' | 'Sports' | 'Labs' | 'Celebrations';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories: FilterType[] = ['All', 'Campus', 'Activities', 'Sports', 'Labs', 'Celebrations'];

  const filteredImages = activeFilter === 'All'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(img => img.category === activeFilter);

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* Page Title */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            Visual Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            GP Academy Campus Life Gallery
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Witness our vibrant atmosphere, sports complexes, highly rigorous classrooms, and scientific experimental setups.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto bg-gray-50 p-2 rounded-2xl border border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat);
                setLightboxIndex(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeFilter === cat
                  ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(idx)}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer relative"
            >
              <div className="h-56 w-full overflow-hidden bg-gray-100 relative">
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {/* Hover mask with zoom icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-1 bg-white">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                  {img.category}
                </span>
                <h4 className="font-sans font-extrabold text-[#001c46] text-sm truncate">
                  {img.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        images={filteredImages}
        currentIndex={lightboxIndex ?? 0}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
}
