import React, { useState, useEffect } from 'react';
import { GalleryMedia, GalleryAlbum } from '../../types/gallery';
import { galleryService } from '../../services/galleryService';
import {
  Image as ImageIcon,
  Search,
  X,
  Maximize2,
  Calendar
} from 'lucide-react';

export const TeacherGalleryView: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [mediaItems, setMediaItems] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeMedia, setActiveMedia] = useState<GalleryMedia | null>(null);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const [fetchedAlbums, fetchedMedia] = await Promise.all([
        galleryService.getAlbums(),
        galleryService.getAllMedia(),
      ]);

      const publishedAlbums = fetchedAlbums.filter((a) => a.status === 'PUBLISHED');
      const publishedMedia = fetchedMedia.filter((m) => m.status === 'PUBLISHED');

      setAlbums(publishedAlbums);
      setMediaItems(publishedMedia);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const filteredMedia = mediaItems.filter((m) => {
    if (selectedAlbumId !== 'ALL' && m.albumId !== selectedAlbumId) return false;
    if (selectedType !== 'ALL' && m.mediaType !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <ImageIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-black">Campus Activity Gallery</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Explore school events, sports meets, cultural programs, and academic celebrations.
            </p>
          </div>

          <span className="px-3.5 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-full font-bold text-xs">
            {filteredMedia.length} Photos & Media
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
          
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Filter by Album</label>
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Event Albums</option>
              {albums.map((alb) => (
                <option key={alb.id} value={alb.id}>
                  {alb.name} ({alb.eventDate})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider text-[10px]">Filter by Media Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#001c46] outline-none"
            >
              <option value="ALL">All Media Types</option>
              <option value="IMAGE">Photos / Images</option>
              <option value="VIDEO">Videos</option>
            </select>
          </div>

        </div>

      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading gallery media...</p>
          </div>
        ) : filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((media) => (
              <div
                key={media.id}
                onClick={() => setActiveMedia(media)}
                className="group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer aspect-4/3 shadow-2xs hover:shadow-md transition-all"
              >
                {media.mediaType === 'VIDEO' ? (
                  <video
                    src={media.downloadUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={media.downloadUrl}
                    alt={media.caption || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white text-xs">
                  <h4 className="font-extrabold line-clamp-1">{media.caption || 'Campus Moment'}</h4>
                  <p className="text-[10px] text-gray-300 line-clamp-1">{media.fileName}</p>
                </div>

                <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-extrabold text-gray-800">No Gallery Photos Found</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              No photos or media items match your selected album or category filter.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {activeMedia.mediaType === 'VIDEO' ? (
              <video
                src={activeMedia.downloadUrl}
                controls
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={activeMedia.downloadUrl}
                alt={activeMedia.caption || 'Full size photo'}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
            )}

            <div className="text-center text-white space-y-1">
              <h3 className="text-base font-black">{activeMedia.caption || 'GP Academy Gallery'}</h3>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
