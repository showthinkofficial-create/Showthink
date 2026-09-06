import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Film,
  Calendar,
  XCircle,
  Inbox,
  Sparkles,
  Layers
} from 'lucide-react';
import { GalleryAlbum, GalleryMedia } from '../types/gallery';
import { galleryService } from '../services/galleryService';
import { GALLERY_IMAGES } from '../data/content';

export default function Gallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [mediaItems, setMediaItems] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('ALL');
  const [lightboxMedia, setLightboxMedia] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPublicGallery() {
      setLoading(true);
      try {
        const [pubAlbums, pubMedia] = await Promise.all([
          galleryService.getPublishedAlbums(),
          galleryService.getPublishedMedia(),
        ]);
        if (isMounted) {
          setAlbums(pubAlbums);
          setMediaItems(pubMedia);
        }
      } catch (err) {
        console.warn('Failed to fetch published gallery:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchPublicGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter published media by selected album
  const displayedMedia = useMemo(() => {
    if (selectedAlbumId === 'ALL') {
      return mediaItems;
    }
    return mediaItems.filter((m) => m.albumId === selectedAlbumId);
  }, [mediaItems, selectedAlbumId]);

  const hasPublishedFirestoreContent = albums.length > 0 || mediaItems.length > 0;

  return (
    <div className="space-y-16 pb-20 animate-fadeIn font-sans">
      {/* Page Title Hero Banner */}
      <section className="bg-gradient-to-r from-[#001c46] to-[#1A325D] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#FFC907] text-xs font-bold uppercase tracking-widest block">
            Visual Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight">
            GP Academy Campus Life Gallery
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">
            Explore photos and video highlights from recent school events, sports meets, cultural celebrations, and academic achievements.
          </p>
        </div>
      </section>

      {/* Main Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        {/* Album Category Tabs */}
        {hasPublishedFirestoreContent && (
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto bg-gray-50 p-2 rounded-2xl border border-gray-200/80">
            <button
              onClick={() => setSelectedAlbumId('ALL')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedAlbumId === 'ALL'
                  ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              All Photos & Videos ({mediaItems.length})
            </button>
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedAlbumId === album.id
                    ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {album.name}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Content Area */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">Loading published campus media...</p>
          </div>
        ) : hasPublishedFirestoreContent ? (
          displayedMedia.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#001c46]">No gallery content is currently available.</h3>
              <p className="text-xs text-gray-500">
                Media for this album will appear here once published by school administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedMedia.map((media) => (
                <div
                  key={media.id}
                  className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-60 bg-gray-900 overflow-hidden flex items-center justify-center">
                    {media.mediaType === 'VIDEO' ? (
                      <video
                        src={media.downloadUrl}
                        controls
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.downloadUrl}
                        alt={media.caption || media.fileName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => setLightboxMedia(media)}
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                        {media.mediaType === 'VIDEO' ? (
                          <>
                            <Film className="w-3.5 h-3.5 text-purple-400" /> Video
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Photo
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Caption & Details */}
                  {media.caption && (
                    <div className="p-4 bg-white border-t border-gray-100">
                      <p className="text-xs font-semibold text-[#001c46] line-clamp-2 leading-relaxed">
                        {media.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Fallback static showcase if no Firestore published items exist yet */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {GALLERY_IMAGES.map((img) => (
                <div
                  key={img.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all relative"
                >
                  <div className="h-56 w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
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
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3">
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#FFC907] transition-colors p-2 cursor-pointer"
            >
              <XCircle className="w-8 h-8" />
            </button>

            {lightboxMedia.mediaType === 'VIDEO' ? (
              <video
                src={lightboxMedia.downloadUrl}
                controls
                autoPlay
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={lightboxMedia.downloadUrl}
                alt={lightboxMedia.caption || lightboxMedia.fileName}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}

            {lightboxMedia.caption && (
              <p className="text-sm font-semibold text-white bg-black/60 px-4 py-2 rounded-xl max-w-xl text-center">
                "{lightboxMedia.caption}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
