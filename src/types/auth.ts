export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PORTAL_USER' | 'STUDENT' | 'PARENT';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  loginEnabled?: boolean;
  linkedStudents?: string[];
  linkedStudentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

