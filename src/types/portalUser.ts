import { Student } from './student';
import { UserRole, UserStatus } from './auth';

export interface PortalUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  loginEnabled: boolean;
  linkedStudents?: string[];
  linkedStudentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PortalStudentLink {
  id: string;
  portalUserUid: string;
  studentId: string;
  studentUid: string;
  studentName: string;
  className: string;
  section: string;
  status: 'ACTIVE' | 'DISABLED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalUserWithStudents extends PortalUser {
  students: Student[];
  primaryStudent?: Student | null;
}

export interface CreatePortalUserFormData {
  studentUid: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PortalUserFilterOptions {
  searchQuery: string;
  accountStatus: 'ALL' | 'ACTIVE' | 'DISABLED';
  loginStatus: 'ALL' | 'ENABLED' | 'DISABLED';
  className: string;
  section: string;
}
