export type GalleryStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type MediaType = 'IMAGE' | 'VIDEO';

export interface GalleryAlbum {
  id: string;
  name: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  coverImageUrl?: string;
  coverImageStoragePath?: string;
  status: GalleryStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  mediaCount?: number;
}

export interface GalleryMedia {
  id: string;
  albumId: string;
  fileName: string;
  fileType: string;
  mediaType: MediaType;
  storagePath: string;
  downloadUrl: string;
  fileSize: number;
  caption?: string;
  status: GalleryStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryFilterOptions {
  searchQuery: string;
  albumId: string;
  mediaType: string; // '' | 'IMAGE' | 'VIDEO'
  status: string; // '' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  eventDate: string;
}

export const GALLERY_STATUS_CONFIG: Record<
  GalleryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  DRAFT: {
    label: 'DRAFT',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  PUBLISHED: {
    label: 'PUBLISHED',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  ARCHIVED: {
    label: 'ARCHIVED',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
};
