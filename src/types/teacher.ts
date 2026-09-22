export type TeacherStatus = 'ACTIVE' | 'DISABLED';

export interface Teacher {
  uid: string; // Document key / Firebase Auth UID
  teacherId: string; // Auto-generated or custom institutional ID (e.g. GP-T-2026-001)
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  subjects: string[];
  assignedClasses: string[];
  assignedSections?: string[];
  qualification?: string;
  address?: string;
  joiningDate?: string;
  profilePhoto?: string;
  status: TeacherStatus;
  role?: 'TEACHER';
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFormData {
  teacherId?: string; // Optional custom teacher ID override
  name: string;
  email: string;
  phone: string;
  alternatePhone: string;
  subjects: string[];
  assignedClasses: string[];
  assignedSections: string[];
  qualification: string;
  address: string;
  joiningDate: string;
  profilePhoto: string;
  status?: TeacherStatus;
}

export interface TeacherFilterOptions {
  searchQuery: string;
  status: string;
  subject: string;
  assignedClass: string;
}

export const SECTION_OPTIONS = ['A', 'B', 'C', 'D'] as const;

export const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Science',
  'English',
  'Hindi',
  'Sanskrit',
  'Social Studies (SST)',
  'History & Civics',
  'Geography',
  'Economics',
  'Computer Science',
  'General Knowledge',
  'Environmental Studies',
  'Physical Education',
  'Art & Craft'
] as const;
