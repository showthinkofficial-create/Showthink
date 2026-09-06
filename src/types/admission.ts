export type AdmissionEnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'ADMISSION_CONFIRMED'
  | 'NOT_INTERESTED'
  | 'CLOSED';

export interface AdmissionSubmittedFormData {
  studentName: string;
  parentName: string;
  phone: string;
  previousSchool?: string;
  grade: string;
  board: 'CBSE' | 'UP Board';
  studentAge: string;
  remarks?: string;
}

export interface AdmissionEnquiryNote {
  id: string;
  enquiryId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface AdmissionEnquiry {
  id: string;
  enquiryId: string;
  submittedFormData: AdmissionSubmittedFormData;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  board: 'CBSE' | 'UP Board';
  studentAge?: string;
  previousSchool?: string;
  remarks?: string;
  status: AdmissionEnquiryStatus;
  followUpDate?: string;
  followUpNote?: string;
  convertedStudentId?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionFilterOptions {
  searchQuery: string;
  grade: string;
  status: string;
  date: string;
  session: string;
}

export const ADMISSION_STATUS_CONFIG: Record<
  AdmissionEnquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: 'NEW',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  CONTACTED: {
    label: 'CONTACTED',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  FOLLOW_UP: {
    label: 'FOLLOW UP',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  ADMISSION_CONFIRMED: {
    label: 'CONFIRMED',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  NOT_INTERESTED: {
    label: 'NOT INTERESTED',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  CLOSED: {
    label: 'CLOSED',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
};
