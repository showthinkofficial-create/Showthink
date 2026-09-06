export type NoticeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type TargetAudience =
  | 'ALL_STUDENTS'
  | 'ALL_TEACHERS'
  | 'STUDENTS'
  | 'TEACHERS'
  | 'PARENTS'
  | 'SPECIFIC_CLASS'
  | 'SPECIFIC_SECTION';

export const NOTICE_TYPE_PRESETS = [
  'General Announcement',
  'Holiday',
  'Exam',
  'Admission',
  'Event',
  'Fee',
  'Result',
  'Important',
  'Other',
] as const;

export interface Notice {
  id: string;
  title: string;
  description: string;
  type: string;
  targetAudience: TargetAudience;
  targetClass?: string;
  targetSection?: string;
  publishDate: string; // YYYY-MM-DD
  expiryDate?: string;  // YYYY-MM-DD
  priority: NoticePriority;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string; // 'pdf' | 'image' | 'doc'
  status: NoticeStatus;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFormData {
  title: string;
  description: string;
  type: string;
  targetAudience: TargetAudience;
  targetClass?: string;
  targetSection?: string;
  publishDate: string;
  expiryDate?: string;
  priority: NoticePriority;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  status?: NoticeStatus;
}

export interface NoticeFilterOptions {
  type?: string;
  targetAudience?: string;
  priority?: string;
  status?: string;
  searchQuery?: string;
  date?: string;
}

export const TARGET_AUDIENCE_OPTIONS: { label: string; value: TargetAudience }[] = [
  { label: 'All Students & Teachers', value: 'ALL_STUDENTS' },
  { label: 'Students Only', value: 'STUDENTS' },
  { label: 'Teachers Only', value: 'TEACHERS' },
  { label: 'Specific Class', value: 'SPECIFIC_CLASS' },
  { label: 'Specific Section', value: 'SPECIFIC_SECTION' },
];

export const PRIORITY_OPTIONS: { label: string; value: NoticePriority; badgeColor: string }[] = [
  { label: 'Normal', value: 'NORMAL', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Important', value: 'IMPORTANT', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Urgent', value: 'URGENT', badgeColor: 'bg-red-100 text-red-800 border-red-200 animate-pulse' },
];
