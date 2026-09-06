export type StudentBoard = 'CBSE' | 'UP Board';
export type StudentStatus = 'ACTIVE' | 'DISABLED';

export interface Student {
  uid: string; // Document ID / Unique ID
  studentId: string; // Auto-generated ID in format [ClassDigit]GP[3-digit Roll] (e.g. 10GP014, 5GP014, 1GP014)
  name: string;
  email?: string;
  className: string;
  section: string;
  rollNumber: string;
  board: StudentBoard;
  parentName: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  address?: string;
  previousSchool?: string;
  admissionDate?: string;
  profilePhoto?: string;
  authUid?: string;
  status: StudentStatus;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  className: string;
  section: string;
  rollNumber: string;
  board: StudentBoard;
  parentName: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  address: string;
  previousSchool: string;
  admissionDate: string;
  profilePhoto: string;
}

export interface StudentFilterOptions {
  searchQuery: string;
  className: string;
  board: string;
  status: string;
  section: string;
}

export const CLASS_OPTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
] as const;

export const BOARD_OPTIONS: StudentBoard[] = ['CBSE', 'UP Board'];

/**
 * Returns allowed boards for a given class name based on school logic.
 * Nursery to Class 8: CBSE only.
 * Class 9 to Class 12: CBSE or UP Board.
 */
export function getAllowedBoardsForClass(className: string): StudentBoard[] {
  if (!className) return ['CBSE'];
  const cbseOnlyClasses = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];
  if (cbseOnlyClasses.includes(className)) {
    return ['CBSE'];
  }
  return ['CBSE', 'UP Board'];
}

/**
 * Helper to extract class digit/number for Student ID format:
 * e.g. "Class 10" -> "10", "Class 5" -> "5", "Class 1" -> "1", "Class 12" -> "12", "10th" -> "10"
 * For pre-primary: "Nursery" -> "0", "LKG" -> "LKG", "UKG" -> "UKG", "Playgroup" -> "0"
 */
export function getClassDigitOrCode(className?: string): string {
  if (!className) return '1';
  const trimmed = className.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits) {
    return digits; // e.g. "1", "2", ... "10", "11", "12"
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes('nur')) return '0';
  if (lower.includes('lkg')) return 'LKG';
  if (lower.includes('ukg')) return 'UKG';
  if (lower.includes('pg') || lower.includes('play')) return '0';
  return trimmed.substring(0, 3).toUpperCase();
}

/**
 * Format Student ID in the requested format:
 * [Class Digit/Code] + GP + [3-digit Roll Number]
 * Examples:
 * Class 10, Roll 14 -> "10GP014"
 * Class 5, Roll 14 -> "5GP014"
 * Class 1, Roll 14 -> "1GP014"
 * Class 10, Roll 1 -> "10GP001"
 * Nursery, Roll 14 -> "0GP014"
 */
export function formatStudentId(className?: string, rollNumber?: string | number, fallbackNumber: number = 1): string {
  const classCode = getClassDigitOrCode(className);
  let rollNum = fallbackNumber;

  if (rollNumber !== undefined && rollNumber !== null && String(rollNumber).trim() !== '') {
    const parsed = parseInt(String(rollNumber).replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      rollNum = parsed;
    }
  }

  const paddedRoll = String(rollNum).padStart(3, '0');
  return `${classCode}GP${paddedRoll}`;
}

/**
 * Format student name as a valid, clean Firestore document ID:
 * e.g. "Rahul Sharma" -> "Rahul_Sharma"
 * e.g. "Aarav Gupta" -> "Aarav_Gupta"
 */
export function generateStudentDocId(name?: string): string {
  if (!name || !name.trim()) {
    return `Student_${Date.now()}`;
  }
  // Trim, replace multiple spaces/slashes with underscore, keep alphanumeric, underscores, hyphens, and periods
  const sanitized = name
    .trim()
    .replace(/[/\s]+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .replace(/^_+|_+$/g, '');

  return sanitized || `Student_${Date.now()}`;
}
