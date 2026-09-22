import React, { useState } from 'react';
import { GalleryAlbum, GalleryMedia } from '../../types/gallery';
import {
  Image,
  Video,
  X,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ParentGalleryViewProps {
  albums: GalleryAlbum[];
  media: GalleryMedia[];
}

export const ParentGalleryView: React.FC<ParentGalleryViewProps> = ({
  albums,
  media,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('ALL');
  const [previewMedia, setPreviewMedia] = useState<GalleryMedia | null>(null);

  const filteredMedia = media.filter((m) => {
    if (selectedAlbumId !== 'ALL' && m.albumId !== selectedAlbumId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Campus Gallery & Event Highlights</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Glimpses of academic celebrations, sports meets, science exhibitions, and annual events at GP Academy.
          </p>
        </div>

        <div className="text-xs bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-gray-600 font-semibold self-start sm:self-auto">
          Media Assets: <span className="font-bold text-[#001c46]">{filteredMedia.length} item(s)</span>
        </div>
      </div>

      {/* Album Selector Filter */}
      {albums.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedAlbumId('ALL')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedAlbumId === 'ALL'
                ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Photos & Videos ({media.length})
          </button>
          {albums.map((album) => {
            const isSelected = selectedAlbumId === album.id;
            const albumMediaCount = media.filter((m) => m.albumId === album.id).length;

            return (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbumId(album.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{album.name}</span>
                <span className="ml-1.5 opacity-70 font-normal">({albumMediaCount})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <Image className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Gallery Items Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Published event pictures and videos will be displayed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredMedia.map((item) => {
            const isVideo = item.mediaType === 'VIDEO';

            return (
              <div
                key={item.id}
                onClick={() => setPreviewMedia(item)}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-gray-900 border border-gray-200 cursor-pointer shadow-xs hover:shadow-md transition-all"
              >
                {isVideo ? (
                  <video
                    src={item.downloadUrl}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.downloadUrl}
                    alt={item.caption || item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}

                {/* Media Type Badge */}
                <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-lg">
                  {isVideo ? <Video className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 sm:p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-bold truncate">
                    {item.caption || item.fileName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-10 sm:-top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center">
              {previewMedia.mediaType === 'VIDEO' ? (
                <video
                  src={previewMedia.downloadUrl}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl"
                />
              ) : (
                <img
                  src={previewMedia.downloadUrl}
                  alt={previewMedia.caption || previewMedia.fileName}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
                />
              )}
            </div>

            {previewMedia.caption && (
              <div className="mt-3 text-center text-white text-xs font-semibold max-w-lg">
                {previewMedia.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
