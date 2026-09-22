import { Student } from './student';
import { UserRole, UserStatus } from './auth';

export type PortalUserType = 'TEACHER' | 'PARENT_STUDENT';

export interface PortalUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  loginEnabled: boolean;
  userType?: PortalUserType;
  phone?: string;
  teacherId?: string;
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

export interface UnifiedPortalUser {
  uid: string;
  email: string;
  displayName: string;
  userType: PortalUserType;
  role: UserRole;
  status: UserStatus;
  loginEnabled: boolean;
  createdAt: string;
  updatedAt: string;

  // Contact info
  phone?: string;
  alternatePhone?: string;

  // Teacher-specific data (if userType === 'TEACHER')
  teacherId?: string;
  subjects?: string[];
  assignedClasses?: string[];
  assignedSections?: string[];
  qualification?: string;
  joiningDate?: string;

  // Parent/Student-specific data (if userType === 'PARENT_STUDENT')
  linkedStudents?: string[];
  linkedStudentIds?: string[];
  students: Student[];
  primaryStudent?: Student | null;
}

export interface CreateTeacherPortalUserFormData {
  name: string;
  teacherId?: string;
  email: string;
  phone: string;
  subjects: string[];
  assignedClasses: string[];
  assignedSections: string[];
  qualification?: string;
  status: 'ACTIVE' | 'DISABLED';
}

export interface CreateParentStudentPortalUserFormData {
  name: string;
  email: string;
  phone: string;
  studentUid: string;
  studentId: string;
  status: 'ACTIVE' | 'DISABLED';
}

export interface CreatePortalUserFormData {
  studentUid: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface PortalUserFilterOptions {
  searchQuery: string;
  userType: 'ALL' | 'TEACHER' | 'PARENT_STUDENT';
  accountStatus: 'ALL' | 'ACTIVE' | 'DISABLED';
  loginStatus: 'ALL' | 'ENABLED' | 'DISABLED';
  className: string;
  section: string;
}

