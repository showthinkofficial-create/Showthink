import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestorePayload } from '../lib/firebase';
import { studentService } from './studentService';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceTopStats,
  MonthlyAttendanceSummaryItem,
  StudentAttendanceItem,
  StudentAttendanceSummary,
  calculateAttendancePercentage
} from '../types/attendance';
import { Student } from '../types/student';
import { auditService } from './auditService';

const COLLECTION_NAME = 'attendance';

export const attendanceService = {
  /**
   * Fetch top dashboard metrics for a given date
   */
  async getTopStatsForDate(dateString: string): Promise<AttendanceTopStats> {
    try {
      // Get all active students
      const allStudents = await studentService.getStudents();
      const activeStudents = allStudents.filter((s) => s.status === 'ACTIVE');
      const totalActiveCount = activeStudents.length;

      // Query attendance for date
      const q = query(collection(db, COLLECTION_NAME), where('date', '==', dateString));
      const snapshot = await getDocs(q);

      let present = 0;
      let absent = 0;
      let leave = 0;
      let late = 0;
      let halfDay = 0;
      let absentWithReason = 0;
      let absentUninformed = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AttendanceRecord;
        if (data.status === 'PRESENT') present++;
        else if (data.status === 'LEAVE') leave++;
        else if (data.status === 'ABSENT') {
          absent++;
          if (data.absenceReason && data.absenceReason !== 'UNINFORMED') {
            absentWithReason++;
          } else {
            absentUninformed++;
          }
        }
        else if (data.status === 'LATE') late++;
        else if (data.status === 'HALF_DAY') halfDay++;
      });

      return {
        totalStudents: totalActiveCount,
        present,
        absent,
        leave,
        late,
        halfDay,
        absentWithReason,
        absentUninformed,
      };
    } catch (error) {
      console.warn('Warning/offline fetching attendance top stats:', error);
      return {
        totalStudents: 0,
        present: 0,
        absent: 0,
        leave: 0,
        late: 0,
        halfDay: 0,
        absentWithReason: 0,
        absentUninformed: 0,
      };
    }
  },

  /**
   * Fetch active students for a class & section, merged with existing attendance if already marked for date
   */
  async getStudentsForAttendance(
    className: string,
    section: string,
    dateString: string
  ): Promise<{ students: StudentAttendanceItem[]; isExisting: boolean }> {
    try {
      const allStudents = await studentService.getStudents();
      // Requirement 12: Do not allow attendance for disabled students
      const targetStudents = allStudents.filter(
        (s) =>
          s.status === 'ACTIVE' &&
          s.className === className &&
          s.section.toUpperCase() === section.toUpperCase()
      );

      // Fetch existing records for this class, section, date
      const q = query(
        collection(db, COLLECTION_NAME),
        where('className', '==', className),
        where('section', '==', section.toUpperCase()),
        where('date', '==', dateString)
      );
      const snapshot = await getDocs(q);

      const existingMap = new Map<string, AttendanceRecord>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AttendanceRecord;
        // Key by studentUid or studentId
        const key = data.studentUid || data.studentId;
        existingMap.set(key, data);
      });

      const isExisting = snapshot.size > 0;

      const items: StudentAttendanceItem[] = targetStudents.map((std) => {
        const existing = existingMap.get(std.uid) || existingMap.get(std.studentId);
        return {
          studentDocUid: std.uid,
          studentId: std.studentId,
          name: std.name,
          rollNumber: std.rollNumber || '—',
          className: std.className,
          section: std.section,
          status: existing ? existing.status : 'PRESENT', // Default PRESENT for new
          absenceReason: existing?.absenceReason || (existing?.status === 'ABSENT' ? 'UNINFORMED' : undefined),
          absenceNote: existing?.absenceNote || '',
          inTime: existing?.inTime || '',
          outTime: existing?.outTime || '',
          parentPhone: std.phone || std.alternatePhone || '',
          parentName: std.parentName || '',
          existingRecordId: existing ? `${std.uid}_${dateString}` : undefined,
          isExisting: !!existing,
        };
      });

      // Sort by roll number or student name
      items.sort((a, b) => {
        const rA = parseInt(a.rollNumber, 10);
        const rB = parseInt(b.rollNumber, 10);
        if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
        return a.name.localeCompare(b.name);
      });

      return { students: items, isExisting };
    } catch (error) {
      console.warn('Warning/offline in getStudentsForAttendance:', error);
      return { students: [], isExisting: false };
    }
  },

  /**
   * Save a batch of attendance records with duplicate prevention
   */
  async saveAttendanceBatch(
    items: StudentAttendanceItem[],
    dateString: string,
    className: string,
    section: string,
    markedBy: string
  ): Promise<void> {
    if (!items.length) return;

    try {
      // Verify active students to ensure disabled student rule
      const allStudents = await studentService.getStudents();
      const activeMap = new Map<string, Student>();
      allStudents.forEach((s) => {
        if (s.status === 'ACTIVE') activeMap.set(s.uid, s);
      });

      const batch = writeBatch(db);
      const now = new Date().toISOString();

      for (const item of items) {
        // Validation check (Requirement 12)
        const student = activeMap.get(item.studentDocUid);
        if (!student) {
          console.warn(`Skipping disabled or non-existent student UID: ${item.studentDocUid}`);
          continue;
        }

        // Document ID format: {studentUid}_{date} ensures strict duplicate prevention
        const docId = `${item.studentDocUid}_${dateString}`;
        const docRef = doc(db, COLLECTION_NAME, docId);

        // Check if doc exists to preserve createdAt
        const existingSnap = await getDoc(docRef);
        const exists = existingSnap.exists();

        const recordPayload: Record<string, any> = {
          studentId: item.studentId,
          studentUid: item.studentDocUid,
          studentName: item.name,
          rollNumber: item.rollNumber || '',
          date: dateString,
          className,
          class: className,
          section: section.toUpperCase(),
          status: item.status,
          remarks: item.remarks || item.absenceNote || null,
          inTime: item.inTime ? item.inTime.trim() : null,
          outTime: item.outTime ? item.outTime.trim() : null,
          markedBy,
          markedByRole: 'ADMIN',
          updatedAt: now,
        };

        if (item.status === 'ABSENT') {
          recordPayload.absenceReason = item.absenceReason || 'UNINFORMED';
          if (item.absenceNote && item.absenceNote.trim()) {
            recordPayload.absenceNote = item.absenceNote.trim();
          }
        } else if (item.status === 'LEAVE') {
          recordPayload.absenceReason = item.absenceReason || 'APPROVED_LEAVE';
          if (item.absenceNote && item.absenceNote.trim()) {
            recordPayload.absenceNote = item.absenceNote.trim();
          }
        } else {
          // If status changed to PRESENT/LATE, clear reason
          recordPayload.absenceReason = null;
          recordPayload.absenceNote = null;
        }

        if (!exists) {
          recordPayload.createdAt = now;
        } else {
          recordPayload.createdAt = existingSnap.data()?.createdAt || now;
        }

        batch.set(docRef, sanitizeFirestorePayload(recordPayload), { merge: true });
      }

      await batch.commit();

      await auditService.logAction({
        actorUid: markedBy,
        actorRole: 'TEACHER',
        action: 'ATTENDANCE_MARKED',
        targetType: 'ATTENDANCE',
        targetName: `Class ${className} ${section} - ${dateString}`,
        success: true,
        metadata: {
          className,
          section,
          date: dateString,
          totalStudents: items.length,
        },
      });
    } catch (error) {
      console.error('Error saving attendance batch:', error);
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
      throw error;
    }
  },

  /**
   * Fetch attendance history records with filters
   */
  async getAttendanceHistory(filters: {
    date?: string;
    className?: string;
    section?: string;
    status?: string;
    studentSearch?: string;
    absenceReason?: string;
  }): Promise<AttendanceRecord[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      let records: AttendanceRecord[] = [];

      querySnapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...(docSnap.data() as AttendanceRecord),
        });
      });

      // Filter in memory for maximum search flexibility
      if (filters.date) {
        records = records.filter((r) => r.date === filters.date);
      }
      if (filters.className) {
        records = records.filter((r) => r.className === filters.className);
      }
      if (filters.section) {
        records = records.filter((r) => r.section.toUpperCase() === filters.section.toUpperCase());
      }
      if (filters.status && filters.status !== 'ALL') {
        records = records.filter((r) => r.status === filters.status);
      }
      if (filters.absenceReason && filters.absenceReason !== 'ALL') {
        records = records.filter((r) => r.absenceReason === filters.absenceReason);
      }
      if (filters.studentSearch) {
        const q = filters.studentSearch.toLowerCase().trim();
        records = records.filter(
          (r) =>
            r.studentName?.toLowerCase().includes(q) ||
            r.studentId?.toLowerCase().includes(q) ||
            r.rollNumber?.toLowerCase().includes(q)
        );
      }

      // Sort by date descending, then student name
      return records.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (a.studentName || '').localeCompare(b.studentName || '');
      });
    } catch (error) {
      console.warn('Warning/offline fetching attendance history:', error);
      return [];
    }
  },

  /**
   * Update absence reason and note directly for an attendance record
   */
  async updateAbsenceReason(
    recordDocId: string,
    absenceReason: string,
    absenceNote?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, recordDocId);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        absenceReason,
        absenceNote: absenceNote ? absenceNote.trim() : null,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${recordDocId}`);
      throw error;
    }
  },

  /**
   * Update arrival (in-time) and departure (out-time) directly for an attendance record
   */
  async updateAttendanceTiming(
    recordDocId: string,
    inTime?: string | null,
    outTime?: string | null
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, recordDocId);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        inTime: inTime ? inTime.trim() : null,
        outTime: outTime ? outTime.trim() : null,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${recordDocId}`);
      throw error;
    }
  },

  /**
   * Save or update single student attendance for any date (including previous dates)
   */
  async saveSingleStudentAttendance(payload: {
    studentDocUid: string;
    studentId: string;
    studentName: string;
    rollNumber?: string;
    className: string;
    section: string;
    date: string;
    status: AttendanceStatus;
    absenceReason?: string;
    absenceNote?: string;
    remarks?: string;
    inTime?: string;
    outTime?: string;
    markedBy: string;
    markedByRole?: 'ADMIN' | 'TEACHER';
  }): Promise<AttendanceRecord> {
    const docId = `${payload.studentDocUid}_${payload.date}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const now = new Date().toISOString();

    try {
      const existingSnap = await getDoc(docRef);
      const exists = existingSnap.exists();

      const recordPayload: Record<string, any> = {
        studentId: payload.studentId,
        studentUid: payload.studentDocUid,
        studentName: payload.studentName,
        rollNumber: payload.rollNumber || '',
        date: payload.date,
        className: payload.className,
        class: payload.className,
        section: payload.section.toUpperCase(),
        status: payload.status,
        remarks: payload.remarks || payload.absenceNote || null,
        inTime: payload.inTime ? payload.inTime.trim() : null,
        outTime: payload.outTime ? payload.outTime.trim() : null,
        markedBy: payload.markedBy,
        markedByRole: payload.markedByRole || 'ADMIN',
        updatedAt: now,
      };

      if (payload.status === 'ABSENT') {
        recordPayload.absenceReason = payload.absenceReason || 'UNINFORMED';
        if (payload.absenceNote && payload.absenceNote.trim()) {
          recordPayload.absenceNote = payload.absenceNote.trim();
        }
      } else if (payload.status === 'LEAVE') {
        recordPayload.absenceReason = payload.absenceReason || 'APPROVED_LEAVE';
        if (payload.absenceNote && payload.absenceNote.trim()) {
          recordPayload.absenceNote = payload.absenceNote.trim();
        }
      } else {
        recordPayload.absenceReason = null;
        recordPayload.absenceNote = null;
      }

      if (!exists) {
        recordPayload.createdAt = now;
      } else {
        recordPayload.createdAt = existingSnap.data()?.createdAt || now;
      }

      const sanitized = sanitizeFirestorePayload(recordPayload);
      await setDoc(docRef, sanitized, { merge: true });

      // Audit log
      await auditService.logAction({
        actorUid: payload.markedBy,
        actorRole: payload.markedByRole || 'ADMIN',
        action: exists ? 'ATTENDANCE_MODIFIED' : 'ATTENDANCE_MARKED',
        targetType: 'ATTENDANCE',
        targetName: `${payload.studentName} (${payload.studentId}) - ${payload.date}`,
        success: true,
        metadata: {
          studentUid: payload.studentDocUid,
          studentId: payload.studentId,
          date: payload.date,
          status: payload.status,
          className: payload.className,
          section: payload.section,
        },
      });

      return {
        id: docId,
        ...(sanitized as AttendanceRecord),
      };
    } catch (error) {
      console.error('Error saving single student attendance:', error);
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
      throw error;
    }
  },

  /**
   * Delete or clear an attendance record (revert to NOT MARKED)
   */
  async deleteAttendanceRecord(
    studentDocUid: string,
    dateString: string,
    actorUid: string,
    actorRole: string = 'ADMIN'
  ): Promise<void> {
    const docId = `${studentDocUid}_${dateString}`;
    const docRef = doc(db, COLLECTION_NAME, docId);

    try {
      await deleteDoc(docRef);

      await auditService.logAction({
        actorUid,
        actorRole,
        action: 'ATTENDANCE_DELETED',
        targetType: 'ATTENDANCE',
        targetName: `Attendance Deleted: ${docId}`,
        success: true,
        metadata: {
          studentDocUid,
          date: dateString,
        },
      });
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${docId}`);
      throw error;
    }
  },

  /**
   * Fetch attendance summary for a specific student (ignoring future dates)
   */
  async getStudentAttendanceSummary(studentDocUid: string): Promise<StudentAttendanceSummary | null> {
    try {
      const student = await studentService.getStudentByUid(studentDocUid);
      if (!student) return null;

      const q = query(collection(db, COLLECTION_NAME), where('studentUid', '==', studentDocUid));
      const snapshot = await getDocs(q);

      const todayStr = new Date().toISOString().split('T')[0];
      let present = 0;
      let absent = 0;
      let leave = 0;
      let late = 0;
      let halfDay = 0;
      let totalWorkingDays = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AttendanceRecord;
        if (data.date <= todayStr) {
          totalWorkingDays++;
          if (data.status === 'PRESENT') present++;
          else if (data.status === 'ABSENT') absent++;
          else if (data.status === 'LEAVE') leave++;
          else if (data.status === 'LATE') late++;
          else if (data.status === 'HALF_DAY') halfDay++;
        }
      });

      // Attendance % = Present Days ÷ Total Marked Working Days × 100 (Leave is not counted as absent)
      const percentage = calculateAttendancePercentage(present, absent);

      return {
        studentDocUid: student.uid,
        studentId: student.studentId,
        name: student.name,
        rollNumber: student.rollNumber || '—',
        className: student.className,
        section: student.section,
        totalWorkingDays,
        presentDays: present,
        absentDays: absent,
        leaveDays: leave,
        lateDays: late,
        halfDayDays: halfDay,
        percentage,
      };
    } catch (error) {
      console.warn('Warning/offline fetching student summary:', error);
      return null;
    }
  },

  /**
   * Fetch detailed attendance history records for a single student
   */
  async getStudentAttendanceRecords(studentDocUid: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('studentUid', '==', studentDocUid));
      const snapshot = await getDocs(q);
      const records: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...(docSnap.data() as AttendanceRecord),
        });
      });
      return records.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.warn('Warning/offline fetching student attendance records:', error);
      return [];
    }
  },

  /**
   * Monthly Attendance Summary for a class & section
   */
  async getMonthlySummary(
    year: number,
    month: number, // 1 - 12
    className: string,
    section: string
  ): Promise<MonthlyAttendanceSummaryItem[]> {
    try {
      const allStudents = await studentService.getStudents();
      const targetStudents = allStudents.filter(
        (s) =>
          s.status === 'ACTIVE' &&
          s.className === className &&
          s.section.toUpperCase() === section.toUpperCase()
      );

      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      const todayStr = new Date().toISOString().split('T')[0];

      // Query records for class & section
      const q = query(
        collection(db, COLLECTION_NAME),
        where('className', '==', className),
        where('section', '==', section.toUpperCase())
      );
      const snapshot = await getDocs(q);

      const studentMap = new Map<
        string,
        { present: number; absent: number; leave: number; late: number; halfDay: number; workingDays: number }
      >();

      snapshot.forEach((docSnap) => {
        const record = docSnap.data() as AttendanceRecord;
        if (record.date.startsWith(monthPrefix) && record.date <= todayStr) {
          const sKey = record.studentUid || record.studentId;
          const current = studentMap.get(sKey) || {
            present: 0,
            absent: 0,
            leave: 0,
            late: 0,
            halfDay: 0,
            workingDays: 0,
          };
          current.workingDays++;
          if (record.status === 'PRESENT') current.present++;
          else if (record.status === 'ABSENT') current.absent++;
          else if (record.status === 'LEAVE') current.leave++;
          else if (record.status === 'LATE') current.late++;
          else if (record.status === 'HALF_DAY') current.halfDay++;

          studentMap.set(sKey, current);
        }
      });

      const summaryList: MonthlyAttendanceSummaryItem[] = targetStudents.map((std) => {
        const stats = studentMap.get(std.uid) ||
          studentMap.get(std.studentId) || {
            present: 0,
            absent: 0,
            leave: 0,
            late: 0,
            halfDay: 0,
            workingDays: 0,
          };

        const pct = calculateAttendancePercentage(stats.present, stats.absent);

        return {
          studentDocUid: std.uid,
          studentId: std.studentId,
          studentName: std.name,
          rollNumber: std.rollNumber || '—',
          className: std.className,
          section: std.section,
          presentDays: stats.present,
          absentDays: stats.absent,
          leaveDays: stats.leave,
          lateDays: stats.late,
          halfDayDays: stats.halfDay,
          totalWorkingDays: stats.workingDays,
          percentage: pct,
        };
      });

      return summaryList.sort((a, b) => {
        const rA = parseInt(a.rollNumber, 10);
        const rB = parseInt(b.rollNumber, 10);
        if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
        return a.studentName.localeCompare(b.studentName);
      });
    } catch (error) {
      console.warn('Warning/offline fetching monthly summary:', error);
      return [];
    }
  },
};
