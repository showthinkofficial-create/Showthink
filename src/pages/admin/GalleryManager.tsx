import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  Trash2,
  Edit,
  ArrowLeft,
  Calendar,
  Lock,
  UploadCloud,
  CheckCircle2,
  XCircle,
  FileText,
  Tag,
  Clock,
  Sparkles,
  Inbox,
  FolderPlus,
  Film
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  GalleryAlbum,
  GalleryMedia,
  GalleryStatus,
  GalleryFilterOptions,
  GALLERY_STATUS_CONFIG,
  MediaType
} from '../../types/gallery';
import { galleryService } from '../../services/galleryService';
import { isSupabaseConfigured, getSupabaseConfigError } from '../../lib/supabase';
import { validateGalleryFile } from '../../services/galleryStorageService';

interface GalleryManagerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  caption: string;
}

export default function GalleryManager({ currentPath, onNavigate }: GalleryManagerProps) {
  const { userProfile } = useAuth();
  const isAdminOrSuperAdmin = userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';
  const isSuperAdmin = userProfile?.role === 'SUPER_ADMIN';

  // Data State
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [mediaList, setMediaList] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Album state parsed from URL (e.g. /admin/gallery/albums/:id or /admin/gallery/:id)
  const activeAlbumId = useMemo(() => {
    const cleanPath = currentPath.replace(/\/$/, '');
    if (cleanPath.includes('/admin/gallery/albums/')) {
      return cleanPath.split('/admin/gallery/albums/')[1] || null;
    }
    return null;
  }, [currentPath]);

  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);

  // Search & Filter State
  const [filters, setFilters] = useState<GalleryFilterOptions>({
    searchQuery: '',
    albumId: '',
    mediaType: '',
    status: '',
    eventDate: '',
  });

  // Modal / Form States
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    status: 'PUBLISHED' as GalleryStatus,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSavingAlbum, setIsSavingAlbum] = useState<boolean>(false);

  // Upload Queue State
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [defaultUploadCaption, setDefaultUploadCaption] = useState<string>('');

  // Caption Editing State
  const [editingMedia, setEditingMedia] = useState<GalleryMedia | null>(null);
  const [captionInput, setCaptionInput] = useState<string>('');
  const [isSavingCaption, setIsSavingCaption] = useState<boolean>(false);

  // Fullscreen Preview Lightbox State
  const [previewMedia, setPreviewMedia] = useState<GalleryMedia | null>(null);

  // Deletion Modal States
  const [deletingMedia, setDeletingMedia] = useState<GalleryMedia | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState<boolean>(false);

  const [deletingAlbum, setDeletingAlbum] = useState<GalleryAlbum | null>(null);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState<boolean>(false);

  // Load Albums and Media
  const loadGalleryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const albumsData = await galleryService.getAlbums();
      setAlbums(albumsData);

      if (activeAlbumId) {
        const currentAlb = await galleryService.getAlbumById(activeAlbumId);
        setActiveAlbum(currentAlb);
        if (currentAlb) {
          const albumMedia = await galleryService.getMediaByAlbum(currentAlb.id);
          setMediaList(albumMedia);
        }
      } else {
        const allMedia = await galleryService.getAllMedia();
        setMediaList(allMedia);
      }
    } catch (err: any) {
      console.error('Failed to load gallery data:', err);
      setError('Unable to fetch gallery data from Firebase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrSuperAdmin) {
      loadGalleryData();
    }
  }, [isAdminOrSuperAdmin, activeAlbumId]);

  // Handle Album Cover Selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Create / Edit Album Submit
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.name.trim()) return;

    setIsSavingAlbum(true);
    setError(null);

    try {
      const createdByName = userProfile?.displayName || userProfile?.email || 'Admin';

      if (editingAlbum) {
        await galleryService.updateAlbum(
          editingAlbum.id,
          {
            name: albumForm.name.trim(),
            description: albumForm.description.trim(),
            eventDate: albumForm.eventDate,
            status: albumForm.status,
          },
          coverFile || undefined
        );
      } else {
        await galleryService.createAlbum(
          {
            name: albumForm.name.trim(),
            description: albumForm.description.trim(),
            eventDate: albumForm.eventDate,
            status: albumForm.status,
            createdBy: createdByName,
          },
          coverFile || undefined
        );
      }

      setShowAlbumModal(false);
      setEditingAlbum(null);
      setCoverFile(null);
      setCoverPreview(null);
      setAlbumForm({
        name: '',
        description: '',
        eventDate: new Date().toISOString().split('T')[0],
        status: 'PUBLISHED',
      });

      await loadGalleryData();
    } catch (err: any) {
      console.error('Save album error:', err);
      setError(err.message || 'Failed to save album. Please check Firebase configuration.');
    } finally {
      setIsSavingAlbum(false);
    }
  };

  // Open Edit Album Modal
  const openEditAlbumModal = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumForm({
      name: album.name,
      description: album.description || '',
      eventDate: album.eventDate || new Date().toISOString().split('T')[0],
      status: album.status,
    });
    setCoverPreview(album.coverImageUrl || null);
    setCoverFile(null);
    setShowAlbumModal(true);
  };

  // Open New Album Modal
  const openNewAlbumModal = () => {
    setEditingAlbum(null);
    setAlbumForm({
      name: '',
      description: '',
      eventDate: new Date().toISOString().split('T')[0],
      status: 'PUBLISHED',
    });
    setCoverPreview(null);
    setCoverFile(null);
    setShowAlbumModal(true);
  };

  // Delete Album Confirm
  const handleConfirmDeleteAlbum = async () => {
    if (!deletingAlbum) return;

    // Requirement: Check whether the album contains media before deleting
    const albumMedia = await galleryService.getMediaByAlbum(deletingAlbum.id);
    if (albumMedia.length > 0) {
      alert("This album contains media. Please remove the media before deleting the album.");
      setDeletingAlbum(null);
      return;
    }

    setIsDeletingAlbum(true);
    try {
      await galleryService.deleteAlbum(deletingAlbum.id);
      setDeletingAlbum(null);
      await loadGalleryData();
      if (activeAlbumId === deletingAlbum.id) {
        onNavigate('/admin/gallery');
      }
    } catch (err: any) {
      console.error('Delete album error:', err);
      alert(`Failed to delete album: ${err.message}`);
    } finally {
      setIsDeletingAlbum(false);
    }
  };

  // Multi-file Media Selection handler for Upload Queue
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files) as File[];
    const newItems: UploadQueueItem[] = files.map((file) => {
      const validation = validateGalleryFile(file);
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        errorMessage: validation.error,
        caption: defaultUploadCaption,
      };
    });

    setUploadQueue((prev) => [...prev, ...newItems]);
    e.target.value = ''; // Reset file input
  };

  // Remove Item from Upload Queue before processing
  const handleRemoveQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Execute Upload Queue
  const handleStartUploadQueue = async () => {
    if (!activeAlbum || uploadQueue.length === 0) return;

    setIsUploading(true);
    const uploaderName = userProfile?.displayName || userProfile?.email || 'Admin';

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status === 'completed') continue;

      // Update status to uploading
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'uploading', progress: 0 } : it))
      );

      try {
        await galleryService.uploadMediaItem(
          activeAlbum.id,
          item.file,
          uploaderName,
          item.caption,
          'PUBLISHED',
          (percent) => {
            setUploadQueue((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: percent } : it))
            );
          }
        );

        setUploadQueue((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'completed', progress: 100 } : it))
        );
      } catch (err: any) {
        console.error(`Upload failed for ${item.file.name}:`, err);
        setUploadQueue((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'error',
                  errorMessage: err.message || 'Storage upload error',
                }
              : it
          )
        );
      }
    }

    setIsUploading(false);
    // Reload media list
    const updatedMedia = await galleryService.getMediaByAlbum(activeAlbum.id);
    setMediaList(updatedMedia);
  };

  // Save Media Caption
  const handleSaveCaption = async () => {
    if (!editingMedia) return;
    setIsSavingCaption(true);
    try {
      await galleryService.updateMediaCaption(editingMedia.id, captionInput);
      setEditingMedia(null);
      if (activeAlbum) {
        const updated = await galleryService.getMediaByAlbum(activeAlbum.id);
        setMediaList(updated);
      } else {
        const updated = await galleryService.getAllMedia();
        setMediaList(updated);
      }
    } catch (err: any) {
      alert(`Failed to save caption: ${err.message}`);
    } finally {
      setIsSavingCaption(false);
    }
  };

  // Toggle Media Status (Publish / Archive / Draft)
  const handleToggleMediaStatus = async (media: GalleryMedia, newStatus: GalleryStatus) => {
    try {
      await galleryService.updateMediaStatus(media.id, newStatus);
      if (activeAlbum) {
        const updated = await galleryService.getMediaByAlbum(activeAlbum.id);
        setMediaList(updated);
      } else {
        const updated = await galleryService.getAllMedia();
        setMediaList(updated);
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Delete Media Confirm
  const handleConfirmDeleteMedia = async () => {
    if (!deletingMedia) return;
    setIsDeletingMedia(true);
    try {
      await galleryService.deleteMediaItem(deletingMedia.id);
      setDeletingMedia(null);
      if (activeAlbum) {
        const updated = await galleryService.getMediaByAlbum(activeAlbum.id);
        setMediaList(updated);
      } else {
        const updated = await galleryService.getAllMedia();
        setMediaList(updated);
      }
    } catch (err: any) {
      console.error('Delete media error:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeletingMedia(false);
    }
  };

  // Filtered Media List
  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      // Search Query (Caption or File Name)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const captionMatch = (m.caption || '').toLowerCase().includes(q);
        const nameMatch = m.fileName.toLowerCase().includes(q);
        if (!captionMatch && !nameMatch) return false;
      }

      // Media Type Filter
      if (filters.mediaType && m.mediaType !== filters.mediaType) {
        return false;
      }

      // Status Filter
      if (filters.status && m.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [mediaList, filters]);

  // Filtered Albums List
  const filteredAlbums = useMemo(() => {
    return albums.filter((alb) => {
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const nameMatch = alb.name.toLowerCase().includes(q);
        const descMatch = alb.description.toLowerCase().includes(q);
        if (!nameMatch && !descMatch) return false;
      }
      if (filters.status && alb.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [albums, filters]);

  // Role Protection Guard
  if (!isAdminOrSuperAdmin) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-4 max-w-md mx-auto font-sans">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-[#001c46]">Access Restricted</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Gallery Management is accessible strictly by Authorized School Administrators only.
        </p>
        <button
          onClick={() => onNavigate('/admin')}
          className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // ================= VIEW: SINGLE ALBUM DETAIL (/admin/gallery/albums/:id) ================= //
  if (activeAlbumId) {
    if (loading) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 font-sans">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading gallery album details...</p>
        </div>
      );
    }

    if (!activeAlbum) {
      return (
        <div className="bg-white p-12 rounded-3xl text-center space-y-4 font-sans max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-black text-[#001c46]">Album Not Found</h3>
          <p className="text-xs text-gray-500">The requested gallery album does not exist or was removed.</p>
          <button
            onClick={() => onNavigate('/admin/gallery')}
            className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Back to Albums
          </button>
        </div>
      );
    }

    const albumStatusCfg = GALLERY_STATUS_CONFIG[activeAlbum.status] || GALLERY_STATUS_CONFIG.DRAFT;

    return (
      <div className="space-y-6 font-sans max-w-7xl mx-auto">
        {/* Album Header Banner */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => onNavigate('/admin/gallery')}
                className="p-2 text-gray-500 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Back to All Albums"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${albumStatusCfg.bg} ${albumStatusCfg.text} ${albumStatusCfg.border}`}
                  >
                    {albumStatusCfg.label}
                  </span>
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeAlbum.eventDate ? new Date(activeAlbum.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Event Date'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#001c46] tracking-tight mt-1">
                  {activeAlbum.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditAlbumModal(activeAlbum)}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-[#001c46] rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Album Info</span>
              </button>

              <button
                onClick={() => setDeletingAlbum(activeAlbum)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Album"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {activeAlbum.description && (
            <p className="text-xs text-gray-600 leading-relaxed max-w-3xl pt-2 border-t border-gray-100">
              {activeAlbum.description}
            </p>
          )}
        </div>

        {/* Upload Media Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#FFC907]" /> Upload Media to Album
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Upload JPG, PNG, WEBP images or MP4, WEBM videos directly to Supabase Storage.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#001c46] bg-blue-50 px-2.5 py-1 rounded-lg">
              {mediaList.length} Items Total
            </span>
          </div>

          {!isSupabaseConfigured() && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold block uppercase tracking-wider text-amber-900">
                  Supabase Storage Configuration Required
                </span>
                <p className="text-amber-800 leading-relaxed">
                  Gallery media uploads require valid Supabase Storage configuration. Please set <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in your environment variables.
                </p>
              </div>
            </div>
          )}

          {/* File Picker & Default Caption Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Default Caption for Uploads (Optional)
              </label>
              <input
                type="text"
                value={defaultUploadCaption}
                onChange={(e) => setDefaultUploadCaption(e.target.value)}
                placeholder="e.g. Students participating in Annual Function 2026"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46]"
              />
            </div>

            <div className="md:col-span-4 flex items-end">
              <label className="w-full py-2.5 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Select Files to Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Upload Queue List */}
          {uploadQueue.length > 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#001c46] uppercase tracking-wider">
                  Pending Upload Queue ({uploadQueue.length} Files)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUploadQueue([])}
                    disabled={isUploading}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-800 disabled:opacity-50 cursor-pointer"
                  >
                    Clear Queue
                  </button>
                  <button
                    onClick={handleStartUploadQueue}
                    disabled={isUploading}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload All Files</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-gray-200 rounded-xl space-y-1 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {item.file.type.startsWith('video/') ? (
                          <Video className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="font-extrabold text-[#001c46] truncate max-w-xs">
                          {item.file.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({(item.file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === 'completed' && (
                          <span className="flex items-center gap-1 text-emerald-600 font-extrabold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="flex items-center gap-1 text-rose-600 font-extrabold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Upload Failed
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleRemoveQueueItem(item.id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {item.status === 'uploading' && (
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-1">
                        <div
                          className="bg-[#001c46] h-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {item.status === 'error' && item.errorMessage && (
                      <p className="text-[11px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg">
                        {item.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Media Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search media by caption or file name..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46]"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={filters.mediaType}
                onChange={(e) => setFilters({ ...filters, mediaType: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
              >
                <option value="">All Media Types</option>
                <option value="IMAGE">Images Only</option>
                <option value="VIDEO">Videos Only</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Cards Grid */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#001c46]">No media uploaded yet.</h3>
            <p className="text-xs text-gray-500">
              Use the upload dropzone above to upload photos and videos for this album.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((media) => {
              const statusCfg = GALLERY_STATUS_CONFIG[media.status] || GALLERY_STATUS_CONFIG.PUBLISHED;

              return (
                <div
                  key={media.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200"
                >
                  {/* Media Preview Container */}
                  <div className="relative h-48 bg-gray-900 overflow-hidden flex items-center justify-center">
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => setPreviewMedia(media)}
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Top Status & Type Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-2xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                        {media.mediaType === 'VIDEO' ? (
                          <>
                            <Film className="w-3 h-3 text-purple-400" /> VIDEO
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-3 h-3 text-blue-400" /> IMAGE
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs font-sans">
                    <div>
                      <p className="font-extrabold text-[#001c46] truncate" title={media.fileName}>
                        {media.fileName}
                      </p>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-1 italic font-medium">
                        {media.caption ? `"${media.caption}"` : 'No caption set'}
                      </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1 text-[11px]">
                      <button
                        onClick={() => {
                          setEditingMedia(media);
                          setCaptionInput(media.caption || '');
                        }}
                        className="p-1.5 text-gray-600 hover:text-[#001c46] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Caption"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {media.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => handleToggleMediaStatus(media, 'ARCHIVED')}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleMediaStatus(media, 'PUBLISHED')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg cursor-pointer"
                        >
                          Publish
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingMedia(media)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW: ALBUMS LIST / DIRECTORY (/admin/gallery) ================= //
  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#001c46] text-[#FFC907] rounded-2xl shadow-2xs">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#001c46] tracking-tight">Gallery Management</h2>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Create school event albums, manage photos/videos, and publish to the public campus gallery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGalleryData}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-[#001c46] rounded-xl transition-all cursor-pointer"
            title="Refresh Albums"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openNewAlbumModal}
            className="bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Album</span>
          </button>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block uppercase tracking-wider text-amber-900">
              Supabase Storage Configuration Required
            </span>
            <p className="text-amber-800 leading-relaxed">
              Gallery photos and videos are hosted on Supabase Storage. Set <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in environment variables to enable uploads.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadGalleryData}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-[11px] font-extrabold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search albums by name or event description..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
            >
              <option value="">All Album Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Albums Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading gallery albums from Firebase...</p>
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-[#001c46] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#001c46]">No gallery albums created yet.</h3>
          <p className="text-xs text-gray-500">
            Click "Create New Album" above to set up photo/video albums for school events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => {
            const statusCfg = GALLERY_STATUS_CONFIG[album.status] || GALLERY_STATUS_CONFIG.DRAFT;

            return (
              <div
                key={album.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200"
              >
                {/* Cover Image Header */}
                <div className="relative h-48 bg-gradient-to-br from-[#001c46] to-[#1a325d] overflow-hidden flex items-center justify-center">
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-2 text-white/70">
                      <ImageIcon className="w-10 h-10 mx-auto text-[#FFC907]" />
                      <span className="text-xs font-bold uppercase tracking-wider block">
                        No Cover Set
                      </span>
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Media Count Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-black/60 text-white backdrop-blur-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#FFC907]" />
                      {album.mediaCount || 0} Media
                    </span>
                  </div>
                </div>

                {/* Album Details Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{album.eventDate ? new Date(album.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date Not Set'}</span>
                    </div>
                    <h3 className="text-base font-black text-[#001c46] tracking-tight">
                      {album.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {album.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => onNavigate(`/admin/gallery/albums/${album.id}`)}
                      className="px-4 py-2 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Album</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditAlbumModal(album)}
                        className="p-2 text-gray-600 hover:text-[#001c46] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        title="Edit Album"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingAlbum(album)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Album"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit Album */}
      {showAlbumModal && (
        <div className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#FFC907]" />
                {editingAlbum ? 'Edit Gallery Album' : 'Create Gallery Album'}
              </h3>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Album Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026"
                  value={albumForm.name}
                  onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Event Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of the school event or celebration..."
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={albumForm.eventDate}
                    onChange={(e) => setAlbumForm({ ...albumForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#001c46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Publication Status *
                  </label>
                  <select
                    value={albumForm.status}
                    onChange={(e) => setAlbumForm({ ...albumForm, status: e.target.value as GalleryStatus })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#001c46] cursor-pointer"
                  >
                    <option value="PUBLISHED">PUBLISHED (Visible Publicly)</option>
                    <option value="DRAFT">DRAFT (Admin Only)</option>
                    <option value="ARCHIVED">ARCHIVED (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                  {coverPreview ? (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-black/5">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPreview(null);
                          setCoverFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg hover:bg-black/80"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        Click below to upload JPG, PNG or WEBP cover photo
                      </p>
                    </div>
                  )}

                  <label className="inline-block px-3.5 py-1.5 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-extrabold cursor-pointer hover:bg-gray-100 transition-colors">
                    <span>{coverPreview ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  disabled={isSavingAlbum}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAlbum}
                  className="flex-1 py-2.5 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAlbum ? 'Saving Album...' : 'Save Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Caption */}
      {editingMedia && (
        <div className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl border border-gray-100 font-sans">
            <h3 className="text-base font-black text-[#001c46]">Edit Media Caption</h3>
            <textarea
              rows={3}
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="e.g. Students participating in Annual Sports Day..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#001c46]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCaption}
                disabled={isSavingCaption}
                className="px-4 py-2 bg-[#001c46] text-white rounded-xl text-xs font-extrabold shadow-xs disabled:opacity-50"
              >
                {isSavingCaption ? 'Saving...' : 'Save Caption'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Media Preview Lightbox */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#FFC907] transition-colors p-2 cursor-pointer"
            >
              <XCircle className="w-8 h-8" />
            </button>

            {previewMedia.mediaType === 'VIDEO' ? (
              <video
                src={previewMedia.downloadUrl}
                controls
                autoPlay
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={previewMedia.downloadUrl}
                alt={previewMedia.caption || previewMedia.fileName}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}

            {previewMedia.caption && (
              <p className="text-sm font-semibold text-white bg-black/60 px-4 py-2 rounded-xl max-w-xl text-center">
                "{previewMedia.caption}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Media */}
      {deletingMedia && (
        <div className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-[#001c46]">
                Are you sure you want to delete this media?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This will permanently delete file <strong>{deletingMedia.fileName}</strong> from Firestore and Supabase Storage. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingMedia(null)}
                disabled={isDeletingMedia}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteMedia}
                disabled={isDeletingMedia}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isDeletingMedia ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Album */}
      {deletingAlbum && (
        <div className="fixed inset-0 bg-[#001c46]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-[#001c46]">
                Delete Gallery Album?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to delete album <strong>{deletingAlbum.name}</strong>? Note: If this album contains any media, you must remove all media items first before deleting the album.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingAlbum(null)}
                disabled={isDeletingAlbum}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAlbum}
                disabled={isDeletingAlbum}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isDeletingAlbum ? 'Deleting Album...' : 'Delete Album'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
