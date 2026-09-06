import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Film,
  Calendar,
  X,
  Play,
  Eye
} from 'lucide-react';
import { GalleryAlbum, GalleryMedia } from '../../types/gallery';

interface StudentGalleryViewProps {
  albums: GalleryAlbum[];
  media: GalleryMedia[];
}

export const StudentGalleryView: React.FC<StudentGalleryViewProps> = ({ albums, media }) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<GalleryMedia | null>(null);

  // Only published albums and media
  const publishedAlbums = albums.filter((a) => a.status === 'PUBLISHED');
  const publishedMedia = media.filter((m) => m.status === 'PUBLISHED');

  const activeAlbum = publishedAlbums.find((a) => a.id === selectedAlbumId);
  const albumMedia = selectedAlbumId
    ? publishedMedia.filter((m) => m.albumId === selectedAlbumId)
    : publishedMedia;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#001c46]">
            <ImageIcon className="w-6 h-6 text-[#FFC907]" />
            <h1 className="text-xl font-black">Academy Media Gallery</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Photo albums and video highlights of school events, sports meets, and achievements.
          </p>
        </div>

        {selectedAlbumId && (
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all shrink-0"
          >
            ← Back to All Albums
          </button>
        )}
      </div>

      {/* Album Selector Cards (when no album selected) */}
      {!selectedAlbumId && (
        <div className="space-y-4">
          <h2 className="font-black text-base text-gray-900">Event Albums</h2>

          {publishedAlbums.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">No Published Albums</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No event gallery albums have been published yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {publishedAlbums.map((album) => {
                const count = publishedMedia.filter((m) => m.albumId === album.id).length;
                return (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#001c46] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="h-44 bg-gray-100 relative overflow-hidden">
                      {album.coverImageUrl ? (
                        <img
                          src={album.coverImageUrl}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#001c46] flex items-center justify-center text-[#FFC907]">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{count} Media</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{album.eventDate || 'Recent Event'}</span>
                      </div>
                      <h3 className="font-black text-base text-gray-900 group-hover:text-[#001c46] transition-colors">
                        {album.name}
                      </h3>
                      {album.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{album.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Album Media Grid */}
      {selectedAlbumId && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-2">
            <span className="text-[10px] font-bold text-[#001c46] uppercase tracking-wider block">Album</span>
            <h2 className="text-xl font-black text-gray-900">{activeAlbum?.name}</h2>
            {activeAlbum?.description && (
              <p className="text-xs text-gray-600">{activeAlbum.description}</p>
            )}
          </div>

          {albumMedia.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No media items available in this album yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {albumMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveMedia(item)}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-[#001c46] transition-all cursor-pointer group relative aspect-square"
                >
                  {item.mediaType === 'VIDEO' ? (
                    <div className="w-full h-full bg-black/90 flex items-center justify-center relative">
                      <Film className="w-10 h-10 text-gray-400" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#FFC907] text-[#001c46] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.downloadUrl}
                      alt={item.caption || item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white text-[10px] font-bold truncate">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveMedia(null)}
            className="absolute top-6 right-6 p-2 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-4">
            {activeMedia.mediaType === 'VIDEO' ? (
              <video
                src={activeMedia.downloadUrl}
                controls
                autoPlay
                className="max-h-[70vh] w-auto rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={activeMedia.downloadUrl}
                alt={activeMedia.caption || activeMedia.fileName}
                className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            )}

            {activeMedia.caption && (
              <p className="text-white text-xs font-semibold text-center bg-black/60 px-4 py-2 rounded-xl">
                {activeMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
