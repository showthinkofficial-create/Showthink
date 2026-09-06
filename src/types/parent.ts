export type ParentStatus = 'ACTIVE' | 'DISABLED';

export interface ParentProfile {
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  occupation?: string;
  linkedStudentIds: string[]; // List of Student IDs (e.g., GP20260001) or student doc UIDs
  status: ParentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ParentStudentLink {
  id: string;
  parentUid: string;
  studentId: string;
  studentUid: string;
  studentName?: string;
  relationship?: string; // 'Father' | 'Mother' | 'Guardian'
  createdAt: string;
}

export type ParentTab =
  | 'dashboard'
  | 'profile'
  | 'children'
  | 'attendance'
  | 'results'
  | 'fees'
  | 'receipts'
  | 'timetable'
  | 'notices'
  | 'gallery';
