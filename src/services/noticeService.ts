import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Notice,
  NoticeFormData,
  NoticeFilterOptions,
  NoticeStatus,
} from '../types/notice';
import { auditService } from './auditService';

const NOTICES_COLLECTION = 'notices';

// Initial seed notices if database is empty
const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice_annual_sports_2026',
    title: 'Annual Sports Meet 2026 - Registration Open',
    description: 'GP Academy is organizing its Annual Sports Meet 2026. All students from Nursery to Class 12 are encouraged to participate in track events, football, basketball, and athletics. Interested students should submit their names to physical education teachers.',
    type: 'Event',
    targetAudience: 'ALL_STUDENTS',
    publishDate: '2026-08-01',
    expiryDate: '2026-09-15',
    priority: 'IMPORTANT',
    status: 'PUBLISHED',
    createdBy: 'Principal Office',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    attachmentName: 'Sports_Schedule_2026.pdf',
    attachmentType: 'pdf',
  },
  {
    id: 'notice_midterm_exam_class10',
    title: 'Mid-Term Examination Date Sheet - Class 10',
    description: 'The Mid-Term Examination for Class 10 (CBSE & UP Board) will commence from September 10, 2026. Attendance is mandatory for all internal assessment tests.',
    type: 'Exam',
    targetAudience: 'SPECIFIC_CLASS',
    targetClass: 'Class 10',
    publishDate: '2026-08-10',
    expiryDate: '2026-09-30',
    priority: 'URGENT',
    status: 'PUBLISHED',
    createdBy: 'Exam Department',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'notice_independence_day_holiday',
    title: 'Independence Day Celebration & Holiday Notice',
    description: 'The school will celebrate 80th Independence Day on August 15, 2026 with flag hoisting ceremony at 8:00 AM. Attendance is mandatory for staff and Class 5–12 students. August 16 will be a institutional holiday.',
    type: 'Holiday',
    targetAudience: 'ALL_STUDENTS',
    publishDate: '2026-08-05',
    expiryDate: '2026-08-17',
    priority: 'NORMAL',
    status: 'PUBLISHED',
    createdBy: 'Administration',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'notice_faculty_meeting_august',
    title: 'Monthly Faculty Evaluation & Curriculum Alignment Meeting',
    description: 'All faculty members are requested to attend the monthly academic alignment meeting in the Main Auditorium on Saturday at 2:30 PM.',
    type: 'General Announcement',
    targetAudience: 'TEACHERS',
    publishDate: '2026-08-11',
    expiryDate: '2026-08-20',
    priority: 'IMPORTANT',
    status: 'DRAFT',
    createdBy: 'Academic Director',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let localNoticesCache: Notice[] = [...INITIAL_NOTICES];

export const noticeService = {
  // Get all notices with optional filtering
  async getNotices(filters?: NoticeFilterOptions): Promise<Notice[]> {
    try {
      const colRef = collection(db, NOTICES_COLLECTION);
      const snapshot = await getDocs(colRef);

      let list: Notice[] = [];
      if (snapshot.empty && localNoticesCache.length > 0) {
        // Seed initial items to firestore
        for (const notice of INITIAL_NOTICES) {
          try {
            await setDoc(doc(db, NOTICES_COLLECTION, notice.id), {
              title: notice.title,
              description: notice.description,
              type: notice.type,
              targetAudience: notice.targetAudience,
              targetClass: notice.targetClass || '',
              targetSection: notice.targetSection || '',
              publishDate: notice.publishDate,
              expiryDate: notice.expiryDate || '',
              priority: notice.priority,
              attachmentUrl: notice.attachmentUrl || '',
              attachmentName: notice.attachmentName || '',
              attachmentType: notice.attachmentType || '',
              status: notice.status,
              createdBy: notice.createdBy,
              createdAt: notice.createdAt,
              updatedAt: notice.updatedAt,
            });
            list.push(notice);
          } catch {
            list.push(notice);
          }
        }
      } else {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || 'Untitled Notice',
            description: data.description || '',
            type: data.type || 'General Announcement',
            targetAudience: data.targetAudience || 'ALL_STUDENTS',
            targetClass: data.targetClass || undefined,
            targetSection: data.targetSection || undefined,
            publishDate: data.publishDate || new Date().toISOString().split('T')[0],
            expiryDate: data.expiryDate || undefined,
            priority: data.priority || 'NORMAL',
            attachmentUrl: data.attachmentUrl || undefined,
            attachmentName: data.attachmentName || undefined,
            attachmentType: data.attachmentType || undefined,
            status: (data.status as NoticeStatus) || 'DRAFT',
            createdBy: data.createdBy || 'Admin',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
      }

      localNoticesCache = list;

      // Filter list
      let filtered = [...list];
      if (filters) {
        if (filters.type && filters.type !== 'ALL') {
          filtered = filtered.filter((n) => n.type.toLowerCase() === filters.type?.toLowerCase());
        }
        if (filters.targetAudience && filters.targetAudience !== 'ALL') {
          filtered = filtered.filter((n) => n.targetAudience === filters.targetAudience);
        }
        if (filters.priority && filters.priority !== 'ALL') {
          filtered = filtered.filter((n) => n.priority === filters.priority);
        }
        if (filters.status && filters.status !== 'ALL') {
          filtered = filtered.filter((n) => n.status === filters.status);
        }
        if (filters.date) {
          filtered = filtered.filter((n) => n.publishDate === filters.date);
        }
        if (filters.searchQuery && filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase().trim();
          filtered = filtered.filter(
            (n) => n.title.toLowerCase().includes(q) || n.type.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
          );
        }
      }

      // Sort by publishDate descending, then createdAt descending
      filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

      return filtered;
    } catch (err) {
      console.warn('Firestore notices fetch fallback to local cache:', err);
      let list = [...localNoticesCache];
      if (filters) {
        if (filters.type && filters.type !== 'ALL') {
          list = list.filter((n) => n.type.toLowerCase() === filters.type?.toLowerCase());
        }
        if (filters.targetAudience && filters.targetAudience !== 'ALL') {
          list = list.filter((n) => n.targetAudience === filters.targetAudience);
        }
        if (filters.priority && filters.priority !== 'ALL') {
          list = list.filter((n) => n.priority === filters.priority);
        }
        if (filters.status && filters.status !== 'ALL') {
          list = list.filter((n) => n.status === filters.status);
        }
        if (filters.date) {
          list = list.filter((n) => n.publishDate === filters.date);
        }
        if (filters.searchQuery && filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase().trim();
          list = list.filter(
            (n) => n.title.toLowerCase().includes(q) || n.type.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
          );
        }
      }
      return list;
    }
  },

  // Get single notice by ID
  async getNoticeById(id: string): Promise<Notice | null> {
    try {
      const docRef = doc(db, NOTICES_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          title: data.title || 'Untitled Notice',
          description: data.description || '',
          type: data.type || 'General Announcement',
          targetAudience: data.targetAudience || 'ALL_STUDENTS',
          targetClass: data.targetClass || undefined,
          targetSection: data.targetSection || undefined,
          publishDate: data.publishDate || new Date().toISOString().split('T')[0],
          expiryDate: data.expiryDate || undefined,
          priority: data.priority || 'NORMAL',
          attachmentUrl: data.attachmentUrl || undefined,
          attachmentName: data.attachmentName || undefined,
          attachmentType: data.attachmentType || undefined,
          status: (data.status as NoticeStatus) || 'DRAFT',
          createdBy: data.createdBy || 'Admin',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Error getting notice from firestore:', e);
    }
    const found = localNoticesCache.find((n) => n.id === id);
    return found || null;
  },

  // Create new notice
  async createNotice(data: NoticeFormData): Promise<Notice> {
    const id = `notice_${Date.now()}`;
    const currentUser = auth.currentUser;
    const createdByName = currentUser?.displayName || currentUser?.email || 'Admin User';

    const newNotice: Notice = {
      id,
      title: data.title,
      description: data.description,
      type: data.type,
      targetAudience: data.targetAudience,
      targetClass: data.targetAudience === 'SPECIFIC_CLASS' || data.targetAudience === 'SPECIFIC_SECTION' ? data.targetClass : undefined,
      targetSection: data.targetAudience === 'SPECIFIC_SECTION' ? data.targetSection : undefined,
      publishDate: data.publishDate,
      expiryDate: data.expiryDate || undefined,
      priority: data.priority,
      attachmentUrl: data.attachmentUrl || undefined,
      attachmentName: data.attachmentName || undefined,
      attachmentType: data.attachmentType || undefined,
      status: data.status || 'DRAFT',
      createdBy: createdByName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, NOTICES_COLLECTION, id);
      await setDoc(docRef, {
        title: newNotice.title,
        description: newNotice.description,
        type: newNotice.type,
        targetAudience: newNotice.targetAudience,
        targetClass: newNotice.targetClass || '',
        targetSection: newNotice.targetSection || '',
        publishDate: newNotice.publishDate,
        expiryDate: newNotice.expiryDate || '',
        priority: newNotice.priority,
        attachmentUrl: newNotice.attachmentUrl || '',
        attachmentName: newNotice.attachmentName || '',
        attachmentType: newNotice.attachmentType || '',
        status: newNotice.status,
        createdBy: newNotice.createdBy,
        createdAt: newNotice.createdAt,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Notice creation saved locally:', e);
    }

    localNoticesCache.unshift(newNotice);

    if (currentUser) {
      await auditService.logAction({
        actorUid: currentUser.uid,
        actorEmail: currentUser.email || undefined,
        actorRole: 'ADMIN',
        action: 'NOTICE_CREATED',
        targetType: 'NOTICE',
        targetId: id,
        targetName: newNotice.title,
        success: true,
        metadata: {
          priority: newNotice.priority,
          targetAudience: newNotice.targetAudience,
        },
      });
    }

    return newNotice;
  },

  // Update existing notice
  async updateNotice(id: string, data: Partial<NoticeFormData>, actorUid?: string): Promise<void> {
    const notice = await this.getNoticeById(id);
    if (!notice) throw new Error('Notice not found.');

    const updatedClass = data.targetAudience === 'SPECIFIC_CLASS' || data.targetAudience === 'SPECIFIC_SECTION' 
      ? (data.targetClass !== undefined ? data.targetClass : notice.targetClass) 
      : undefined;
    
    const updatedSection = data.targetAudience === 'SPECIFIC_SECTION' 
      ? (data.targetSection !== undefined ? data.targetSection : notice.targetSection) 
      : undefined;

    const payload: Partial<Notice> = {
      ...data,
      targetClass: updatedClass,
      targetSection: updatedSection,
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, NOTICES_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        targetClass: updatedClass || '',
        targetSection: updatedSection || '',
        expiryDate: data.expiryDate !== undefined ? data.expiryDate : (notice.expiryDate || ''),
        attachmentUrl: data.attachmentUrl !== undefined ? data.attachmentUrl : (notice.attachmentUrl || ''),
        attachmentName: data.attachmentName !== undefined ? data.attachmentName : (notice.attachmentName || ''),
        attachmentType: data.attachmentType !== undefined ? data.attachmentType : (notice.attachmentType || ''),
        updatedAt: serverTimestamp(),
      });

      if (actorUid || auth.currentUser) {
        await auditService.logAction({
          actorUid: actorUid || auth.currentUser?.uid || 'admin',
          actorRole: 'ADMIN',
          action: 'NOTICE_UPDATED',
          targetType: 'NOTICE',
          targetId: id,
          targetName: data.title || notice.title,
          success: true,
          metadata: {
            updatedFields: Object.keys(data),
          },
        });
      }
    } catch (e) {
      console.warn('Notice update saved locally:', e);
    }

    const idx = localNoticesCache.findIndex((n) => n.id === id);
    if (idx !== -1) {
      localNoticesCache[idx] = {
        ...localNoticesCache[idx],
        ...payload,
      };
    }
  },

  // Update status (e.g. Publish / Archive)
  async updateNoticeStatus(id: string, status: NoticeStatus, actorUid?: string): Promise<void> {
    try {
      const docRef = doc(db, NOTICES_COLLECTION, id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });

      if (actorUid || auth.currentUser) {
        await auditService.logAction({
          actorUid: actorUid || auth.currentUser?.uid || 'admin',
          actorRole: 'ADMIN',
          action: 'NOTICE_UPDATED',
          targetType: 'NOTICE',
          targetId: id,
          success: true,
          metadata: { status },
        });
      }
    } catch (e) {
      console.warn('Notice status update saved locally:', e);
    }

    const idx = localNoticesCache.findIndex((n) => n.id === id);
    if (idx !== -1) {
      localNoticesCache[idx] = {
        ...localNoticesCache[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // Delete notice (with audit logging)
  async deleteNotice(id: string, actorUid?: string): Promise<void> {
    try {
      const docRef = doc(db, NOTICES_COLLECTION, id);
      await deleteDoc(docRef);

      if (actorUid || auth.currentUser) {
        await auditService.logAction({
          actorUid: actorUid || auth.currentUser?.uid || 'admin',
          actorRole: 'ADMIN',
          action: 'NOTICE_DELETED',
          targetType: 'NOTICE',
          targetId: id,
          success: true,
        });
      }
    } catch (e) {
      console.warn('Notice deletion executed locally:', e);
    }

    localNoticesCache = localNoticesCache.filter((n) => n.id !== id);
  },

  // Utility to check if notice is expired based on current date
  isNoticeExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return expiryDate < today;
  },
};
