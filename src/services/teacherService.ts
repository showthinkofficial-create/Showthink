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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, sanitizeFirestorePayload } from '../lib/firebase';
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
        // Exclude hard-purged or permanently deleted
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
        const cleanEmail = email.toLowerCase().trim();
        const qEmail = query(collection(db, COLLECTION_NAME), where('email', '==', cleanEmail));
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
   * Add a new teacher record.
   * Invokes backend endpoint to provision Firebase Auth user with role 'TEACHER',
   * dispatches official password setup email, and links Firestore documents.
   */
  async addTeacher(
    formData: TeacherFormData,
    actorUid?: string,
    actorEmail?: string
  ): Promise<Teacher> {
    const autoId = await this.generateNextTeacherId();
    const finalTeacherId = formData.teacherId?.trim() || autoId;

    // Verify duplicate teacher ID locally first
    const exists = await this.checkTeacherIdExists(finalTeacherId);
    if (exists) {
      throw new Error(`Teacher ID '${finalTeacherId}' is already assigned to another teacher.`);
    }

    // Call backend API endpoint to create account + Firebase Auth
    try {
      const res = await fetch('/api/admin/teachers/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacherId: finalTeacherId,
          actorUid: actorUid || 'admin',
          actorEmail: actorEmail || 'admin@gpacademy.in',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create teacher account via backend service.');
      }

      return data.teacher as Teacher;
    } catch (apiError: any) {
      // If the backend threw a business validation error (like email duplicate), bubble it up
      if (apiError.message && (apiError.message.includes('already registered') || apiError.message.includes('already exists'))) {
        throw apiError;
      }
      console.warn('[TeacherService] Backend API creation note, falling back to direct Firestore:', apiError.message);

      // Fallback: direct Firestore write if server is unreachable
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
        assignedSections: (formData.assignedSections || []).map((s) => s.trim()).filter(Boolean),
        qualification: formData.qualification?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        joiningDate: formData.joiningDate || now.split('T')[0],
        profilePhoto: formData.profilePhoto?.trim() || undefined,
        status: formData.status || 'ACTIVE',
        role: 'TEACHER',
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };

      const teacherRecord = sanitizeFirestorePayload(rawRecord) as Teacher;
      const docRef = doc(db, COLLECTION_NAME, uid);
      await setDoc(docRef, teacherRecord);

      // Also create/sync users record for role guard
      try {
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: teacherRecord.email,
          displayName: teacherRecord.name,
          role: 'TEACHER',
          status: teacherRecord.status,
          loginEnabled: teacherRecord.status === 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        });
      } catch (userErr) {
        console.warn('Could not sync users doc in fallback:', userErr);
      }

      // Try sending client-side password reset email
      try {
        await sendPasswordResetEmail(auth, teacherRecord.email);
      } catch (emailErr) {
        console.warn('Could not send client password reset email in fallback:', emailErr);
      }

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
    }
  },

  /**
   * Update an existing teacher record in Firestore
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
    if (formData.assignedSections !== undefined) rawUpdatePayload.assignedSections = formData.assignedSections.map((s) => s.trim()).filter(Boolean);
    if (formData.qualification !== undefined) rawUpdatePayload.qualification = formData.qualification.trim() || null;
    if (formData.address !== undefined) rawUpdatePayload.address = formData.address.trim() || null;
    if (formData.joiningDate !== undefined) rawUpdatePayload.joiningDate = formData.joiningDate || null;
    if (formData.profilePhoto !== undefined) rawUpdatePayload.profilePhoto = formData.profilePhoto.trim() || null;
    if (formData.status !== undefined) rawUpdatePayload.status = formData.status;

    const updatePayload = sanitizeFirestorePayload(rawUpdatePayload);

    try {
      await updateDoc(docRef, updatePayload);

      // Sync name / email to users collection if changed
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userUpdates: Record<string, any> = { updatedAt: now };
          if (formData.name) userUpdates.displayName = formData.name.trim();
          if (formData.email) userUpdates.email = formData.email.trim().toLowerCase();
          if (formData.status) {
            userUpdates.status = formData.status;
            userUpdates.loginEnabled = formData.status === 'ACTIVE';
          }
          await updateDoc(userRef, userUpdates);
        }
      } catch (uErr) {
        console.warn('Could not sync user profile updates:', uErr);
      }

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
   * Trigger official password reset email for a teacher
   */
  async resetPassword(
    teacherUid: string,
    email: string,
    actorUid?: string,
    actorEmail?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try backend endpoint
    try {
      const res = await fetch('/api/admin/teachers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          teacherUid,
          actorUid: actorUid || 'admin',
          actorEmail: actorEmail || 'admin@gpacademy.in',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
    } catch (apiErr) {
      console.warn('[TeacherService] Backend reset password failed, falling back to client SDK:', apiErr);
    }

    // 2. Client-side SDK fallback
    try {
      await sendPasswordResetEmail(auth, cleanEmail);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'PASSWORD_RESET_REQUESTED',
          targetType: 'TEACHER',
          targetId: teacherUid,
          targetName: cleanEmail,
          success: true,
        });
      }

      return {
        success: true,
        message: `A password reset email has been sent to ${cleanEmail}.`,
      };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw new Error(error.message || 'Failed to dispatch password reset email.');
    }
  },

  /**
   * Update teacher status (ACTIVE / DISABLED) across Auth and Firestore
   */
  async updateTeacherStatus(
    uid: string,
    status: 'ACTIVE' | 'DISABLED',
    actorUid?: string,
    actorEmail?: string
  ): Promise<void> {
    // 1. Try backend endpoint
    try {
      const res = await fetch('/api/admin/teachers/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          status,
          actorUid: actorUid || 'admin',
          actorEmail: actorEmail || 'admin@gpacademy.in',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return;
      }
    } catch (apiErr) {
      console.warn('[TeacherService] Backend update status failed, updating via Firestore:', apiErr);
    }

    // 2. Direct Firestore fallback
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        status,
        updatedAt: now,
      });

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          status,
          loginEnabled: status === 'ACTIVE',
          updatedAt: now,
        });
      }

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: status === 'ACTIVE' ? 'TEACHER_ENABLED' : 'TEACHER_DISABLED',
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
   * Soft disable a teacher (status = DISABLED)
   */
  async disableTeacher(uid: string, actorUid?: string, actorEmail?: string): Promise<void> {
    return this.updateTeacherStatus(uid, 'DISABLED', actorUid, actorEmail);
  },

  /**
   * Re-enable / activate a teacher (status = ACTIVE)
   */
  async enableTeacher(uid: string, actorUid?: string, actorEmail?: string): Promise<void> {
    return this.updateTeacherStatus(uid, 'ACTIVE', actorUid, actorEmail);
  },

  /**
   * Deactivate / Soft-delete teacher record while preserving historical records
   */
  async softDeleteTeacher(uid: string, actorUid?: string, actorEmail?: string): Promise<void> {
    // 1. Try backend endpoint
    try {
      const res = await fetch('/api/admin/teachers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          actorUid: actorUid || 'admin',
          actorEmail: actorEmail || 'admin@gpacademy.in',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return;
      }
    } catch (apiErr) {
      console.warn('[TeacherService] Backend delete failed, updating via Firestore:', apiErr);
    }

    // 2. Direct Firestore fallback
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: now,
        deletedBy: actorUid || 'admin',
        status: 'DISABLED',
        updatedAt: now,
      });

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          status: 'DISABLED',
          loginEnabled: false,
          updatedAt: now,
        });
      }

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'TEACHER_SOFT_DELETED',
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
   * Restore a soft-deleted teacher record
   */
  async restoreTeacher(uid: string, actorUid?: string): Promise<void> {
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

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          status: 'ACTIVE',
          loginEnabled: true,
          updatedAt: now,
        });
      }

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'TEACHER_RESTORED',
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
};

