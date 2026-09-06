import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestorePayload } from '../lib/firebase';
import { Teacher, TeacherFormData } from '../types/teacher';
import { auditService } from './auditService';

const COLLECTION_NAME = 'teachers';

export const teacherService = {
  /**
   * Fetch all teacher records from Firestore
   */
  async getTeachers(): Promise<Teacher[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const teachers: Teacher[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Teacher;
        teachers.push(data);
      });
      // Sort by createdAt descending
      return teachers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching teachers:', error);
      return [];
    }
  },

  /**
   * Fetch a single teacher record by UID
   */
  async getTeacherByUid(uid: string): Promise<Teacher | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Teacher;
      }
      return null;
    } catch (error) {
      console.warn('Warning/offline fetching teacher by UID:', error);
      return null;
    }
  },

  /**
   * Fetch a teacher profile using the authenticated user's UID or Email without fetching all records
   */
  async getTeacherByAuthUser(authUid: string, email?: string): Promise<Teacher | null> {
    try {
      // 1. Direct document read by ID
      const docRef = doc(db, COLLECTION_NAME, authUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Teacher;
      }

      // 2. Query where 'uid' == authUid
      const qUid = query(collection(db, COLLECTION_NAME), where('uid', '==', authUid));
      const snapUid = await getDocs(qUid);
      if (!snapUid.empty) {
        return snapUid.docs[0].data() as Teacher;
      }

      // 3. Query where 'email' == email
      if (email) {
        const qEmail = query(collection(db, COLLECTION_NAME), where('email', '==', email.toLowerCase().trim()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          return snapEmail.docs[0].data() as Teacher;
        }
      }

      return null;
    } catch (error) {
      console.warn('Warning/offline fetching teacher by Auth user:', error);
      return null;
    }
  },

  /**
   * Check if a given Teacher ID already exists in the system
   */
  async checkTeacherIdExists(teacherId: string, excludeUid?: string): Promise<boolean> {
    try {
      const teachers = await this.getTeachers();
      return teachers.some(
        (t) => t.teacherId.toLowerCase() === teacherId.toLowerCase().trim() && t.uid !== excludeUid
      );
    } catch (err) {
      console.warn('Error checking teacher ID existence', err);
      return false;
    }
  },

  /**
   * Automatically generate the next Teacher ID (Format: GP-T-2026-001)
   */
  async generateNextTeacherId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GP-T-${year}-`;
    
    try {
      const teachers = await this.getTeachers();
      let maxNum = 0;

      teachers.forEach((tch) => {
        if (tch.teacherId && tch.teacherId.startsWith(prefix)) {
          const numStr = tch.teacherId.replace(prefix, '');
          const parsed = parseInt(numStr, 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        }
      });

      const nextNum = maxNum + 1;
      const formattedNum = String(nextNum).padStart(3, '0');
      return `${prefix}${formattedNum}`;
    } catch (err) {
      console.warn('Could not compute max teacher ID, defaulting to GP-T-2026-001', err);
      return `${prefix}001`;
    }
  },

  /**
   * Add a new teacher record to Firestore
   */
  async addTeacher(formData: TeacherFormData, actorUid?: string): Promise<Teacher> {
    const autoId = await this.generateNextTeacherId();
    const finalTeacherId = formData.teacherId?.trim() || autoId;

    // Verify duplicate teacher ID
    const exists = await this.checkTeacherIdExists(finalTeacherId);
    if (exists) {
      throw new Error(`Teacher ID '${finalTeacherId}' is already assigned to another teacher.`);
    }

    // Unique document ID key
    const uid = `tch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const rawRecord: Teacher = {
      uid,
      teacherId: finalTeacherId,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      alternatePhone: formData.alternatePhone?.trim() || undefined,
      subjects: formData.subjects.map((s) => s.trim()).filter(Boolean),
      assignedClasses: formData.assignedClasses.map((c) => c.trim()).filter(Boolean),
      qualification: formData.qualification?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      joiningDate: formData.joiningDate || now.split('T')[0],
      profilePhoto: formData.profilePhoto?.trim() || undefined,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    const teacherRecord = sanitizeFirestorePayload(rawRecord) as Teacher;
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      await setDoc(docRef, teacherRecord);

      // Audit log
      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'TEACHER_CREATED',
          targetType: 'TEACHER',
          targetId: uid,
          targetName: teacherRecord.name,
          success: true,
          metadata: {
            teacherId: teacherRecord.teacherId,
            email: teacherRecord.email,
          },
        });
      }

      return rawRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Update an existing teacher record in Firestore
   * Note: UID and Teacher ID cannot be modified
   */
  async updateTeacher(uid: string, formData: Partial<TeacherFormData>, actorUid?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    const rawUpdatePayload: Record<string, any> = {
      updatedAt: now,
    };

    if (formData.name !== undefined) rawUpdatePayload.name = formData.name.trim();
    if (formData.email !== undefined) rawUpdatePayload.email = formData.email.trim().toLowerCase();
    if (formData.phone !== undefined) rawUpdatePayload.phone = formData.phone.trim();
    if (formData.alternatePhone !== undefined) rawUpdatePayload.alternatePhone = formData.alternatePhone.trim() || null;
    if (formData.subjects !== undefined) rawUpdatePayload.subjects = formData.subjects.map((s) => s.trim()).filter(Boolean);
    if (formData.assignedClasses !== undefined) rawUpdatePayload.assignedClasses = formData.assignedClasses.map((c) => c.trim()).filter(Boolean);
    if (formData.qualification !== undefined) rawUpdatePayload.qualification = formData.qualification.trim() || null;
    if (formData.address !== undefined) rawUpdatePayload.address = formData.address.trim() || null;
    if (formData.joiningDate !== undefined) rawUpdatePayload.joiningDate = formData.joiningDate || null;
    if (formData.profilePhoto !== undefined) rawUpdatePayload.profilePhoto = formData.profilePhoto.trim() || null;

    const updatePayload = sanitizeFirestorePayload(rawUpdatePayload);

    try {
      await updateDoc(docRef, updatePayload);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'TEACHER_UPDATED',
          targetType: 'TEACHER',
          targetId: uid,
          targetName: formData.name,
          success: true,
          metadata: {
            updatedFields: Object.keys(formData),
          },
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Soft disable a teacher (status = DISABLED)
   */
  async disableTeacher(uid: string, actorUid?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        status: 'DISABLED',
        updatedAt: now,
      });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'TEACHER_DISABLED',
          targetType: 'TEACHER',
          targetId: uid,
          success: true,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Re-enable / activate a teacher (status = ACTIVE)
   */
  async enableTeacher(uid: string, actorUid?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        status: 'ACTIVE',
        updatedAt: now,
      });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'TEACHER_ENABLED',
          targetType: 'TEACHER',
          targetId: uid,
          success: true,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Soft-delete teacher record
   */
  async softDeleteTeacher(uid: string, actorUid: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: now,
        deletedBy: actorUid,
        status: 'DISABLED',
        updatedAt: now,
      });

      await auditService.logAction({
        actorUid,
        actorRole: 'ADMIN',
        action: 'TEACHER_SOFT_DELETED',
        targetType: 'TEACHER',
        targetId: uid,
        success: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Restore a soft-deleted teacher record
   */
  async restoreTeacher(uid: string, actorUid: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        status: 'ACTIVE',
        updatedAt: now,
      });

      await auditService.logAction({
        actorUid,
        actorRole: 'ADMIN',
        action: 'TEACHER_RESTORED',
        targetType: 'TEACHER',
        targetId: uid,
        success: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },
};
