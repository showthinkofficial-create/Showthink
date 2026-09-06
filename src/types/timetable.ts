import { StudentBoard } from './student';

export type TimetableStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type EntryType = 'CLASS' | 'BREAK' | 'ASSEMBLY';

export interface Timetable {
  id: string;
  academicSession: string; // e.g. "2026-2027"
  className: string;      // Nursery, LKG, UKG, Class 1 - 12
  section: string;        // A, B, C, D
  board: StudentBoard;    // CBSE | UP Board
  status: TimetableStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableFormData {
  academicSession: string;
  className: string;
  section: string;
  board: StudentBoard;
  status?: TimetableStatus;
}

export interface TimetableEntry {
  id: string;
  timetableId: string;
  day: DayOfWeek;
  periodNumber: number;  // 1, 2, 3...
  startTime: string;     // e.g. "08:00"
  endTime: string;       // e.g. "08:45"
  subject: string;       // e.g. "Mathematics", "Lunch Break", "Assembly"
  teacherId?: string;    // UID from Teacher database if CLASS
  teacherName?: string;  // Display name of assigned teacher
  room?: string;         // e.g. "Room 101", "Lab 1", "Activity Room"
  type: EntryType;       // 'CLASS' | 'BREAK' | 'ASSEMBLY'
  className?: string;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntryFormData {
  timetableId: string;
  day: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId?: string;
  teacherName?: string;
  room?: string;
  type: EntryType;
}

export interface TimetableFilterOptions {
  academicSession?: string;
  className?: string;
  section?: string;
  board?: string;
  status?: string;
  searchQuery?: string;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

export const ACADEMIC_SESSION_OPTIONS = [
  '2026-2027',
  '2025-2026',
  '2024-2025',
];

export const ENTRY_TYPE_OPTIONS: { label: string; value: EntryType; description: string }[] = [
  { label: 'Class Period', value: 'CLASS', description: 'Academic subject class with teacher' },
  { label: 'Break', value: 'BREAK', description: 'Recess, Short Break, Lunch Break' },
  { label: 'Assembly', value: 'ASSEMBLY', description: 'Morning Assembly, Prayer, Orientation' },
];
