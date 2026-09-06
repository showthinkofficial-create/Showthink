import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Timetable,
  TimetableFormData,
  TimetableEntry,
  TimetableEntryFormData,
  TimetableFilterOptions,
  TimetableStatus,
  DayOfWeek,
} from '../types/timetable';
import { teacherService } from './teacherService';

const TIMETABLES_COLLECTION = 'timetables';
const TIMETABLE_ENTRIES_COLLECTION = 'timetableEntries';

export const timetableService = {
  // Get list of timetables with optional filtering
  async getTimetables(filters?: TimetableFilterOptions): Promise<Timetable[]> {
    try {
      const colRef = collection(db, TIMETABLES_COLLECTION);
      const snapshot = await getDocs(colRef);
      
      let list: Timetable[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          academicSession: data.academicSession || '2026-2027',
          className: data.className || '',
          section: data.section || 'A',
          board: data.board || 'CBSE',
          status: (data.status as TimetableStatus) || 'DRAFT',
          createdBy: data.createdBy || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      // Apply client-side filters
      if (filters) {
        if (filters.academicSession) {
          list = list.filter((t) => t.academicSession === filters.academicSession);
        }
        if (filters.className) {
          list = list.filter((t) => t.className === filters.className);
        }
        if (filters.section) {
          list = list.filter((t) => t.section === filters.section);
        }
        if (filters.board) {
          list = list.filter((t) => t.board === filters.board);
        }
        if (filters.status) {
          list = list.filter((t) => t.status === filters.status);
        }
      }

      // Sort by className, then section
      return list.sort((a, b) => {
        const classComp = a.className.localeCompare(b.className);
        if (classComp !== 0) return classComp;
        return a.section.localeCompare(b.section);
      });
    } catch (error) {
      console.warn('Warning/offline fetching timetables:', error);
      return [];
    }
  },

  // Get single timetable by ID
  async getTimetableById(id: string): Promise<Timetable | null> {
    try {
      const docRef = doc(db, TIMETABLES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          academicSession: data.academicSession || '2026-2027',
          className: data.className || '',
          section: data.section || 'A',
          board: data.board || 'CBSE',
          status: (data.status as TimetableStatus) || 'DRAFT',
          createdBy: data.createdBy || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.warn('Warning/offline fetching timetable by ID:', error);
      return null;
    }
  },

  // Create new timetable header
  async createTimetable(data: TimetableFormData): Promise<Timetable> {
    const colRef = collection(db, TIMETABLES_COLLECTION);
    const newDocRef = doc(colRef);
    const timestamp = new Date().toISOString();

    const newTimetable: Omit<Timetable, 'id'> = {
      academicSession: data.academicSession,
      className: data.className,
      section: data.section,
      board: data.board,
      status: data.status || 'DRAFT',
      createdBy: auth.currentUser?.email || 'admin',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(newDocRef, newTimetable);

    return {
      id: newDocRef.id,
      ...newTimetable,
    };
  },

  // Update timetable details
  async updateTimetable(id: string, data: Partial<TimetableFormData>): Promise<void> {
    const docRef = doc(db, TIMETABLES_COLLECTION, id);
    const timestamp = new Date().toISOString();

    await updateDoc(docRef, {
      ...data,
      updatedAt: timestamp,
    });
  },

  // Update status (DRAFT | PUBLISHED | ARCHIVED)
  async updateTimetableStatus(id: string, status: TimetableStatus): Promise<void> {
    const docRef = doc(db, TIMETABLES_COLLECTION, id);
    const timestamp = new Date().toISOString();

    await updateDoc(docRef, {
      status,
      updatedAt: timestamp,
    });
  },

  // Delete timetable and all its entries
  async deleteTimetable(id: string): Promise<void> {
    // First fetch all entries for this timetable
    const entries = await this.getTimetableEntries(id);
    for (const entry of entries) {
      await deleteDoc(doc(db, TIMETABLE_ENTRIES_COLLECTION, entry.id));
    }
    // Delete timetable document
    await deleteDoc(doc(db, TIMETABLES_COLLECTION, id));
  },

  // Get all entries for a specific timetable or across all timetables if timetableId is omitted
  async getTimetableEntries(timetableId?: string): Promise<TimetableEntry[]> {
    try {
      const colRef = collection(db, TIMETABLE_ENTRIES_COLLECTION);
      const q = timetableId ? query(colRef, where('timetableId', '==', timetableId)) : query(colRef);
      const snapshot = await getDocs(q);

      // Pre-fetch timetables map for className/section decoration if fetching all
      const timetablesMap: Record<string, { className: string; section: string }> = {};
      if (!timetableId) {
        const allTimetables = await this.getTimetables();
        allTimetables.forEach((t) => {
          timetablesMap[t.id] = { className: t.className, section: t.section };
        });
      }

      const list: TimetableEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const ttMeta: { className?: string; section?: string } = timetablesMap[data.timetableId] || {};
        list.push({
          id: docSnap.id,
          timetableId: data.timetableId,
          day: data.day as DayOfWeek,
          periodNumber: Number(data.periodNumber) || 1,
          startTime: data.startTime || '08:00',
          endTime: data.endTime || '08:45',
          subject: data.subject || '',
          teacherId: data.teacherId || '',
          teacherName: data.teacherName || '',
          room: data.room || '',
          type: data.type || 'CLASS',
          className: data.className || ttMeta.className || 'Assigned Class',
          section: data.section || ttMeta.section || 'A',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      // Sort by period number then start time
      return list.sort((a, b) => {
        if (a.periodNumber !== b.periodNumber) {
          return a.periodNumber - b.periodNumber;
        }
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.warn('Warning/offline fetching timetable entries:', error);
      return [];
    }
  },

  // Check for duplicate period in the same timetable
  async checkDuplicatePeriod(
    timetableId: string,
    day: DayOfWeek,
    periodNumber: number,
    excludeEntryId?: string
  ): Promise<boolean> {
    const entries = await this.getTimetableEntries(timetableId);
    const duplicate = entries.find(
      (e) => e.day === day && e.periodNumber === periodNumber && e.id !== excludeEntryId
    );
    return !!duplicate;
  },

  // Check for teacher conflict across all timetables for the same day and period
  async checkTeacherConflict(
    teacherId: string,
    day: DayOfWeek,
    periodNumber: number,
    academicSession: string,
    currentTimetableId: string,
    excludeEntryId?: string
  ): Promise<{ hasConflict: boolean; conflictInfo?: string }> {
    if (!teacherId) return { hasConflict: false };

    try {
      // Get all entries for the given day and period
      const colRef = collection(db, TIMETABLE_ENTRIES_COLLECTION);
      const q = query(
        colRef,
        where('day', '==', day),
        where('periodNumber', '==', periodNumber),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        if (docSnap.id === excludeEntryId) continue;
        const entryData = docSnap.data();
        if (entryData.timetableId !== currentTimetableId) {
          // Fetch parent timetable to check academic session and class name
          const parentTT = await this.getTimetableById(entryData.timetableId);
          if (parentTT && parentTT.academicSession === academicSession && parentTT.status !== 'ARCHIVED') {
            return {
              hasConflict: true,
              conflictInfo: `${parentTT.className} - Section ${parentTT.section}`,
            };
          }
        }
      }
    } catch (error) {
      console.warn('Error checking teacher conflict:', error);
    }

    return { hasConflict: false };
  },

  // Add a new period or break entry
  async addTimetableEntry(data: TimetableEntryFormData): Promise<TimetableEntry> {
    // 1. Check duplicate period in same timetable
    const isDuplicate = await this.checkDuplicatePeriod(
      data.timetableId,
      data.day,
      data.periodNumber
    );
    if (isDuplicate) {
      throw new Error('This period is already assigned.');
    }

    // 2. If assigning a teacher, check if teacher is disabled
    if (data.type === 'CLASS' && data.teacherId) {
      const teacher = await teacherService.getTeacherByUid(data.teacherId);
      if (teacher && teacher.status === 'DISABLED') {
        throw new Error(`Teacher "${teacher.name}" is currently disabled and cannot be assigned to new timetable entries.`);
      }

      // 3. Check teacher conflict across other timetables
      const timetable = await this.getTimetableById(data.timetableId);
      const session = timetable?.academicSession || '2026-2027';
      const conflict = await this.checkTeacherConflict(
        data.teacherId,
        data.day,
        data.periodNumber,
        session,
        data.timetableId
      );

      if (conflict.hasConflict) {
        throw new Error(
          `Teacher is already assigned to another class (${conflict.conflictInfo}) during this period.`
        );
      }
    }

    const colRef = collection(db, TIMETABLE_ENTRIES_COLLECTION);
    const newDocRef = doc(colRef);
    const timestamp = new Date().toISOString();

    const newEntry: Omit<TimetableEntry, 'id'> = {
      timetableId: data.timetableId,
      day: data.day,
      periodNumber: Number(data.periodNumber),
      startTime: data.startTime,
      endTime: data.endTime,
      subject: data.subject,
      teacherId: data.teacherId || '',
      teacherName: data.teacherName || '',
      room: data.room || '',
      type: data.type,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(newDocRef, newEntry);

    return {
      id: newDocRef.id,
      ...newEntry,
    };
  },

  // Update existing timetable entry
  async updateTimetableEntry(
    entryId: string,
    data: TimetableEntryFormData
  ): Promise<void> {
    // 1. Check duplicate period in same timetable
    const isDuplicate = await this.checkDuplicatePeriod(
      data.timetableId,
      data.day,
      data.periodNumber,
      entryId
    );
    if (isDuplicate) {
      throw new Error('This period is already assigned.');
    }

    // 2. Check teacher disabled and conflict if type CLASS
    if (data.type === 'CLASS' && data.teacherId) {
      const teacher = await teacherService.getTeacherByUid(data.teacherId);
      if (teacher && teacher.status === 'DISABLED') {
        throw new Error(`Teacher "${teacher.name}" is currently disabled and cannot be assigned.`);
      }

      const timetable = await this.getTimetableById(data.timetableId);
      const session = timetable?.academicSession || '2026-2027';
      const conflict = await this.checkTeacherConflict(
        data.teacherId,
        data.day,
        data.periodNumber,
        session,
        data.timetableId,
        entryId
      );

      if (conflict.hasConflict) {
        throw new Error(
          `Teacher is already assigned to another class (${conflict.conflictInfo}) during this period.`
        );
      }
    }

    const docRef = doc(db, TIMETABLE_ENTRIES_COLLECTION, entryId);
    const timestamp = new Date().toISOString();

    await updateDoc(docRef, {
      day: data.day,
      periodNumber: Number(data.periodNumber),
      startTime: data.startTime,
      endTime: data.endTime,
      subject: data.subject,
      teacherId: data.teacherId || '',
      teacherName: data.teacherName || '',
      room: data.room || '',
      type: data.type,
      updatedAt: timestamp,
    });
  },

  // Delete timetable entry
  async deleteTimetableEntry(entryId: string): Promise<void> {
    const docRef = doc(db, TIMETABLE_ENTRIES_COLLECTION, entryId);
    await deleteDoc(docRef);
  },
};
