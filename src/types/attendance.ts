export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'NOT_MARKED' | 'LATE' | 'HALF_DAY';

export interface CalendarDayAttendance {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  status: AttendanceStatus;
  record?: AttendanceRecord;
}

/**
 * Attendance calculation formula:
 * Attendance % = Present Days ÷ Total Marked Working Days × 100
 * Leave ko absent mein count mat karo.
 * Marked Working Days = Present Days + Absent Days (excludes approved leave)
 */
export function calculateAttendancePercentage(presentDays: number, absentDays: number): number {
  const totalMarkedWorkingDays = presentDays + absentDays;
  if (totalMarkedWorkingDays <= 0) return 100;
  return Math.round((presentDays / totalMarkedWorkingDays) * 1000) / 10;
}

export type AbsenceReasonKey =
  | 'SICK_LEAVE'
  | 'URGENT_WORK'
  | 'APPROVED_LEAVE'
  | 'UNINFORMED'
  | 'OTHER';

export interface AbsenceReasonOption {
  key: AbsenceReasonKey;
  label: string;
  hindiLabel: string;
  shortLabel: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const ABSENCE_REASONS: AbsenceReasonOption[] = [
  {
    key: 'SICK_LEAVE',
    label: 'Sick / Medical Leave',
    hindiLabel: 'बीमारी / अस्वस्थता',
    shortLabel: 'Sick Leave',
    icon: '🤒',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    description: 'Fever, medical illness, doctor visit, injury',
  },
  {
    key: 'URGENT_WORK',
    label: 'Family Emergency / Urgent Work',
    hindiLabel: 'पारिवारिक / आकस्मिक कार्य',
    shortLabel: 'Family / Urgent',
    icon: '🏠',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
    description: 'Out of town, family function, household emergency',
  },
  {
    key: 'APPROVED_LEAVE',
    label: 'Prior Approved Leave (Application)',
    hindiLabel: 'स्वीकृत अवकाश (प्रार्थना पत्र)',
    shortLabel: 'Approved Leave',
    icon: '📝',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Prior leave application submitted and approved by school',
  },
  {
    key: 'UNINFORMED',
    label: 'Uninformed / Without Notice',
    hindiLabel: 'बिना सूचना / अ सूचित अनुपस्थिति',
    shortLabel: 'Uninformed',
    icon: '❓',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    description: 'No prior notice or call received from parent/guardian',
  },
  {
    key: 'OTHER',
    label: 'Other Reason (Specify)',
    hindiLabel: 'अन्य कारण',
    shortLabel: 'Other Reason',
    icon: '💬',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Transport breakdown, weather disruption, or custom reason',
  },
];

export function getAbsenceReasonDetails(reasonKey?: string): AbsenceReasonOption | undefined {
  if (!reasonKey) return undefined;
  return ABSENCE_REASONS.find(
    (r) => r.key === reasonKey || r.label.toLowerCase() === reasonKey.toLowerCase() || r.shortLabel.toLowerCase() === reasonKey.toLowerCase()
  );
}

/**
 * Format HH:mm (24-hour) string to a friendly 12-hour format with AM/PM
 * Example: "08:15" -> "08:15 AM", "13:30" -> "01:30 PM"
 */
export function formatTime12Hour(timeStr?: string | null): string {
  if (!timeStr || !timeStr.trim()) return '';
  const clean = timeStr.trim();
  
  // If already contains AM/PM
  if (clean.toUpperCase().includes('AM') || clean.toUpperCase().includes('PM')) {
    return clean;
  }

  const parts = clean.split(':');
  if (parts.length < 2) return clean;

  const hours24 = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');

  if (isNaN(hours24)) return clean;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const formattedHours = String(hours12).padStart(2, '0');

  return `${formattedHours}:${minutes} ${period}`;
}

/**
 * Get current local time formatted as "HH:mm" (24-hour) for standard <input type="time" />
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export interface AttendanceRecord {
  id?: string;
  studentId: string; // Institutional ID (e.g. GP014, GP015) or doc uid
  studentUid: string; // Firestore student document key
  studentName: string;
  rollNumber?: string;
  class?: string; // Class name alias
  className: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  absenceReason?: string; // SICK_LEAVE, URGENT_WORK, APPROVED_LEAVE, UNINFORMED, OTHER or custom string
  absenceNote?: string; // Optional detailed remark / reason note
  remarks?: string;
  inTime?: string; // Arrival / Entry time (e.g., "08:15" or "08:15 AM")
  outTime?: string; // Departure / Exit time (e.g., "13:30" or "01:30 PM")
  parentNotified?: boolean;
  markedBy: string; // Email or UID of admin marking attendance
  markedByRole?: 'ADMIN' | 'TEACHER';
  createdAt?: any; // Timestamp or ISO String
  updatedAt?: any; // Timestamp or ISO String
}

export interface StudentAttendanceItem {
  studentDocUid: string;
  studentId: string;
  name: string;
  rollNumber: string;
  className: string;
  class?: string;
  section: string;
  status: AttendanceStatus;
  absenceReason?: string;
  absenceNote?: string;
  remarks?: string;
  inTime?: string; // Arrival / Entry time
  outTime?: string; // Departure / Exit time
  parentPhone?: string;
  parentName?: string;
  existingRecordId?: string;
  isExisting?: boolean;
}

export interface AttendanceTopStats {
  totalStudents: number;
  present: number;
  absent: number;
  leave?: number;
  late: number;
  halfDay: number;
  absentWithReason?: number;
  absentUninformed?: number;
}

export interface StudentAttendanceSummary {
  studentDocUid: string;
  studentId: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays?: number;
  lateDays: number;
  halfDayDays: number;
  percentage: number;
  absenceReasonsCount?: Record<string, number>;
}

export interface MonthlyAttendanceSummaryItem {
  studentDocUid: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  presentDays: number;
  absentDays: number;
  leaveDays?: number;
  lateDays: number;
  halfDayDays: number;
  totalWorkingDays: number;
  percentage: number;
  recentAbsenceReasons?: string[];
}

export interface AttendanceFilterOptions {
  date: string;
  className: string;
  section: string;
  studentSearch?: string;
  status?: string;
  absenceReason?: string;
}
