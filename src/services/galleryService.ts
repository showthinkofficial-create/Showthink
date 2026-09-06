import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  GalleryAlbum,
  GalleryMedia,
  GalleryStatus,
  MediaType
} from '../types/gallery';
import {
  galleryStorageService,
  validateGalleryFile
} from './galleryStorageService';
import { auditService } from './auditService';

const ALBUMS_COLLECTION = 'galleryAlbums';
const MEDIA_COLLECTION = 'galleryMedia';

export const galleryService = {
  // ================= ALBUMS CRUD ================= //

  /**
   * Fetch all gallery albums (Admin view)
   */
  async getAlbums(): Promise<GalleryAlbum[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ALBUMS_COLLECTION));
      const albums: GalleryAlbum[] = [];
      querySnapshot.forEach((docSnap) => {
        albums.push(docSnap.data() as GalleryAlbum);
      });

      // Attach media counts
      const allMedia = await this.getAllMedia();
      const mediaCountMap: Record<string, number> = {};
      allMedia.forEach((m) => {
        mediaCountMap[m.albumId] = (mediaCountMap[m.albumId] || 0) + 1;
      });

      albums.forEach((album) => {
        album.mediaCount = mediaCountMap[album.id] || 0;
      });

      return albums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching gallery albums:', error);
      return [];
    }
  },

  /**
   * Fetch only PUBLISHED albums (Public view)
   */
  async getPublishedAlbums(): Promise<GalleryAlbum[]> {
    try {
      const q = query(collection(db, ALBUMS_COLLECTION), where('status', '==', 'PUBLISHED'));
      const querySnapshot = await getDocs(q);
      const albums: GalleryAlbum[] = [];
      querySnapshot.forEach((docSnap) => {
        albums.push(docSnap.data() as GalleryAlbum);
      });

      return albums.sort((a, b) => new Date(b.eventDate || b.createdAt).getTime() - new Date(a.eventDate || a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching published gallery albums:', error);
      return [];
    }
  },

  /**
   * Fetch a single album by ID
   */
  async getAlbumById(id: string): Promise<GalleryAlbum | null> {
    try {
      const docRef = doc(db, ALBUMS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const album = docSnap.data() as GalleryAlbum;
        const media = await this.getMediaByAlbum(id);
        album.mediaCount = media.length;
        return album;
      }
      return null;
    } catch (error) {
      console.warn('Warning/offline fetching gallery album by ID:', error);
      return null;
    }
  },

  /**
   * Create a new gallery album.
   * If cover file is provided, uploads it to Supabase Storage before writing Firestore record.
   */
  async createAlbum(
    albumData: {
      name: string;
      description: string;
      eventDate: string;
      status: GalleryStatus;
      createdBy: string;
    },
    coverFile?: File,
    onCoverProgress?: (percent: number) => void
  ): Promise<string> {
    const albumId = `album_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let coverImageUrl = '';
    let coverImageStoragePath = '';

    // 1. Upload Cover Image to Supabase Storage FIRST if provided
    if (coverFile) {
      const uploaded = await galleryStorageService.uploadGalleryCoverImage(
        albumId,
        coverFile,
        onCoverProgress
      );
      coverImageUrl = uploaded.publicUrl;
      coverImageStoragePath = uploaded.storagePath;
    }

    const newAlbum: GalleryAlbum = {
      id: albumId,
      name: albumData.name.trim(),
      description: albumData.description.trim(),
      eventDate: albumData.eventDate,
      coverImageUrl,
      coverImageStoragePath,
      status: albumData.status,
      createdBy: albumData.createdBy,
      createdAt: now,
      updatedAt: now,
      mediaCount: 0,
    };

    // 2. Save metadata in Firestore
    const docRef = doc(db, ALBUMS_COLLECTION, albumId);
    try {
      await setDoc(docRef, newAlbum);

      await auditService.logAction({
        actorUid: albumData.createdBy,
        actorRole: 'ADMIN',
        action: 'GALLERY_ALBUM_CREATED',
        targetType: 'GALLERY',
        targetId: albumId,
        targetName: newAlbum.name,
        success: true,
        metadata: {
          eventDate: albumData.eventDate,
          status: albumData.status,
        },
      });

      return albumId;
    } catch (error) {
      // Cleanup uploaded cover image if Firestore write fails
      if (coverImageStoragePath) {
        await galleryStorageService.deleteGalleryMedia(coverImageStoragePath).catch(() => {});
      }
      handleFirestoreError(error, OperationType.WRITE, `${ALBUMS_COLLECTION}/${albumId}`);
      throw error;
    }
  },

  /**
   * Update an existing gallery album
   */
  async updateAlbum(
    id: string,
    updates: Partial<GalleryAlbum>,
    newCoverFile?: File,
    onCoverProgress?: (percent: number) => void
  ): Promise<void> {
    const docRef = doc(db, ALBUMS_COLLECTION, id);
    const now = new Date().toISOString();

    const payload: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };

    if (newCoverFile) {
      // 1. Upload new cover image to Supabase Storage
      const uploaded = await galleryStorageService.uploadGalleryCoverImage(
        id,
        newCoverFile,
        onCoverProgress
      );

      // 2. Remove old cover image from Supabase Storage if it existed
      if (updates.coverImageStoragePath) {
        await galleryStorageService.deleteGalleryMedia(updates.coverImageStoragePath).catch(() => {});
      }

      payload.coverImageUrl = uploaded.publicUrl;
      payload.coverImageStoragePath = uploaded.storagePath;
    }

    try {
      await updateDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${ALBUMS_COLLECTION}/${id}`);
      throw error;
    }
  },

  /**
   * Update album status (e.g., DRAFT, PUBLISHED, ARCHIVED)
   */
  async updateAlbumStatus(id: string, status: GalleryStatus): Promise<void> {
    const docRef = doc(db, ALBUMS_COLLECTION, id);
    try {
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${ALBUMS_COLLECTION}/${id}`);
      throw error;
    }
  },

  /**
   * Delete album and all associated media files from Supabase Storage and Firestore
   */
  async deleteAlbum(id: string): Promise<void> {
    const album = await this.getAlbumById(id);
    const mediaList = await this.getMediaByAlbum(id);

    // Delete cover image from Supabase Storage
    if (album?.coverImageStoragePath) {
      await galleryStorageService.deleteGalleryMedia(album.coverImageStoragePath).catch((err) => {
        console.warn('Cover image storage delete warning:', err);
      });
    }

    // Delete all media records and storage files in album
    for (const media of mediaList) {
      await this.deleteMediaItem(media.id).catch((err) => {
        console.warn(`Media ${media.id} deletion error during album cleanup:`, err);
      });
    }

    // Delete Album Doc in Firestore
    const docRef = doc(db, ALBUMS_COLLECTION, id);
    try {
      await deleteDoc(docRef);

      await auditService.logAction({
        actorUid: 'admin',
        actorRole: 'ADMIN',
        action: 'GALLERY_ALBUM_DELETED',
        targetType: 'GALLERY',
        targetId: id,
        targetName: album?.name || id,
        success: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${ALBUMS_COLLECTION}/${id}`);
      throw error;
    }
  },

  // ================= MEDIA CRUD ================= //

  /**
   * Fetch all media items in an album
   */
  async getMediaByAlbum(albumId: string): Promise<GalleryMedia[]> {
    try {
      const q = query(collection(db, MEDIA_COLLECTION), where('albumId', '==', albumId));
      const querySnapshot = await getDocs(q);
      const mediaList: GalleryMedia[] = [];
      querySnapshot.forEach((docSnap) => {
        mediaList.push(docSnap.data() as GalleryMedia);
      });

      return mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn(`Warning/offline fetching media for album ${albumId}:`, error);
      return [];
    }
  },

  /**
   * Fetch only PUBLISHED media items in a published album
   */
  async getPublishedMediaByAlbum(albumId: string): Promise<GalleryMedia[]> {
    try {
      const q = query(
        collection(db, MEDIA_COLLECTION),
        where('albumId', '==', albumId),
        where('status', '==', 'PUBLISHED')
      );
      const querySnapshot = await getDocs(q);
      const mediaList: GalleryMedia[] = [];
      querySnapshot.forEach((docSnap) => {
        mediaList.push(docSnap.data() as GalleryMedia);
      });

      return mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn(`Warning/offline fetching published media for album ${albumId}:`, error);
      return [];
    }
  },

  /**
   * Fetch all media items across all albums (for search/filter)
   */
  async getAllMedia(): Promise<GalleryMedia[]> {
    try {
      const querySnapshot = await getDocs(collection(db, MEDIA_COLLECTION));
      const mediaList: GalleryMedia[] = [];
      querySnapshot.forEach((docSnap) => {
        mediaList.push(docSnap.data() as GalleryMedia);
      });
      return mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching all media:', error);
      return [];
    }
  },

  /**
   * Fetch all PUBLISHED media items across all published albums (for public gallery)
   */
  async getPublishedMedia(): Promise<GalleryMedia[]> {
    try {
      const q = query(collection(db, MEDIA_COLLECTION), where('status', '==', 'PUBLISHED'));
      const querySnapshot = await getDocs(q);
      const mediaList: GalleryMedia[] = [];
      querySnapshot.forEach((docSnap) => {
        mediaList.push(docSnap.data() as GalleryMedia);
      });
      return mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching published media:', error);
      return [];
    }
  },

  /**
   * Upload single media item to Supabase Storage and create Firestore record.
   * FLOW:
   * 1. Validate file (type, size).
   * 2. Upload file to Supabase Storage FIRST.
   * 3. Return storagePath / publicUrl.
   * 4. Save metadata in Firestore.
   * 5. If Firestore write fails, clean up Supabase Storage file and throw error.
   */
  async uploadMediaItem(
    albumId: string,
    file: File,
    uploadedBy: string,
    caption?: string,
    status: GalleryStatus = 'PUBLISHED',
    onProgress?: (percent: number) => void
  ): Promise<GalleryMedia> {
    // 1. File Validation
    const validation = validateGalleryFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file for gallery upload.');
    }

    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const mediaType: MediaType = validation.mediaType;

    // 2. Upload to Supabase Storage FIRST
    let storagePath = '';
    let publicUrl = '';

    if (mediaType === 'VIDEO') {
      const result = await galleryStorageService.uploadGalleryVideo(
        albumId,
        mediaId,
        file,
        onProgress
      );
      storagePath = result.storagePath;
      publicUrl = result.publicUrl;
    } else {
      const result = await galleryStorageService.uploadGalleryImage(
        albumId,
        mediaId,
        file,
        onProgress
      );
      storagePath = result.storagePath;
      publicUrl = result.publicUrl;
    }

    const newMediaRecord: GalleryMedia = {
      id: mediaId,
      albumId,
      fileName: file.name,
      fileType: file.type || (mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
      mediaType,
      storagePath,
      downloadUrl: publicUrl,
      fileSize: file.size,
      caption: caption ? caption.trim() : '',
      status,
      uploadedBy,
      createdAt: now,
      updatedAt: now,
    };

    // 3. Save metadata in Firestore ONLY after successful Storage upload
    const docRef = doc(db, MEDIA_COLLECTION, mediaId);
    try {
      await setDoc(docRef, newMediaRecord);

      await auditService.logAction({
        actorUid: uploadedBy,
        actorRole: 'ADMIN',
        action: 'GALLERY_MEDIA_UPLOADED',
        targetType: 'GALLERY',
        targetId: mediaId,
        targetName: file.name,
        success: true,
        metadata: {
          albumId,
          mediaType,
          fileSize: file.size,
        },
      });

      return newMediaRecord;
    } catch (error) {
      // Clean up Supabase Storage file to prevent orphan file accumulation
      await galleryStorageService.deleteGalleryMedia(storagePath).catch(() => {});
      handleFirestoreError(error, OperationType.WRITE, `${MEDIA_COLLECTION}/${mediaId}`);
      throw error;
    }
  },

  /**
   * Update media caption (Updates Firestore ONLY)
   */
  async updateMediaCaption(mediaId: string, caption: string): Promise<void> {
    const docRef = doc(db, MEDIA_COLLECTION, mediaId);
    try {
      await updateDoc(docRef, {
        caption: caption.trim(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${MEDIA_COLLECTION}/${mediaId}`);
      throw error;
    }
  },

  /**
   * Update media status (Updates Firestore ONLY)
   */
  async updateMediaStatus(mediaId: string, status: GalleryStatus): Promise<void> {
    const docRef = doc(db, MEDIA_COLLECTION, mediaId);
    try {
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${MEDIA_COLLECTION}/${mediaId}`);
      throw error;
    }
  },

  /**
   * Delete media item.
   * FLOW:
   * 1. Find the Storage path from Firestore.
   * 2. Delete corresponding Supabase Storage object.
   * 3. Only after successful/verified Storage deletion, remove the Firestore media record.
   * If Storage deletion fails:
   *    Do NOT delete Firestore record, throw "Unable to delete the media file. Please try again."
   */
  async deleteMediaItem(mediaId: string): Promise<void> {
    const docRef = doc(db, MEDIA_COLLECTION, mediaId);
    let mediaDoc: GalleryMedia | null = null;

    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        mediaDoc = snap.data() as GalleryMedia;
      }
    } catch (err) {
      console.warn('Error fetching media doc prior to deletion:', err);
    }

    if (!mediaDoc) {
      throw new Error('Media item record not found in Firestore.');
    }

    // 1 & 2. Delete file from Supabase Storage FIRST
    if (mediaDoc.storagePath) {
      try {
        await galleryStorageService.deleteGalleryMedia(mediaDoc.storagePath);
      } catch (storageErr: any) {
        console.error('Failed to delete file from Supabase Storage:', storageErr);
        throw new Error('Unable to delete the media file. Please try again.');
      }
    }

    // 3. Delete record from Firestore ONLY after Storage deletion succeeds
    try {
      await deleteDoc(docRef);

      await auditService.logAction({
        actorUid: 'admin',
        actorRole: 'ADMIN',
        action: 'GALLERY_MEDIA_DELETED',
        targetType: 'GALLERY',
        targetId: mediaId,
        targetName: mediaDoc.fileName,
        success: true,
        metadata: {
          albumId: mediaDoc.albumId,
          storagePath: mediaDoc.storagePath,
        },
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${MEDIA_COLLECTION}/${mediaId}`);
      throw error;
    }
  },
};
