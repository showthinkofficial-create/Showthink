import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student, StudentFormData, formatStudentId, getClassDigitOrCode, generateStudentDocId } from '../types/student';
import { auditService } from './auditService';

const COLLECTION_NAME = 'students';

/**
 * Utility helper to remove undefined fields from Firestore payloads
 */
function sanitizeFirestorePayload<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export const studentService = {
  /**
   * Real-time listener for student records in Firestore
   */
  subscribeStudents(callback: (students: Student[]) => void): Unsubscribe {
    const studentsCol = collection(db, COLLECTION_NAME);
    return onSnapshot(
      studentsCol,
      (snapshot) => {
        const students: Student[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Student;
          students.push({
            ...data,
            uid: data.uid || docSnap.id,
          });
        });
        students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(students);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      }
    );
  },

  /**
   * Fetch all student records from Firestore
   */
  async getStudents(): Promise<Student[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const students: Student[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Student;
        students.push({
          ...data,
          uid: data.uid || docSnap.id,
        });
      });
      // Sort by createdAt descending
      return students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching students:', error);
      return [];
    }
  },

  /**
   * Fetch a single student profile by UID
   */
  async getStudentByUid(uid: string): Promise<Student | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Student;
      }
      return null;
    } catch (error) {
      console.warn('Warning/offline fetching student by UID:', error);
      return null;
    }
  },

  /**
   * Fetch a student profile using the authenticated user's UID or Email without fetching all records
   */
  async getStudentByAuthUser(authUid: string, email?: string): Promise<Student | null> {
    try {
      // 1. Direct document read by ID
      const docRef = doc(db, COLLECTION_NAME, authUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Student;
      }

      // 2. Query where 'uid' == authUid
      const qUid = query(collection(db, COLLECTION_NAME), where('uid', '==', authUid));
      const snapUid = await getDocs(qUid);
      if (!snapUid.empty) {
        return snapUid.docs[0].data() as Student;
      }

      // 3. Query where 'email' == email
      if (email) {
        const qEmail = query(collection(db, COLLECTION_NAME), where('email', '==', email.toLowerCase().trim()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          return snapEmail.docs[0].data() as Student;
        }
      }

      return null;
    } catch (error) {
      console.warn('Warning/offline fetching student by Auth user:', error);
      return null;
    }
  },

  /**
   * Automatically generate the next Student ID in [ClassDigit]GP[3-digit Roll] format (e.g., 10GP014, 5GP014, 1GP014)
   * If rollNumber is provided (e.g. 14), it generates 10GP014 for Class 10, 5GP014 for Class 5, etc.
   */
  async generateNextStudentId(className?: string, rollNumber?: string): Promise<string> {
    const cleanRoll = rollNumber?.trim();
    if (cleanRoll) {
      const parsedRoll = parseInt(cleanRoll.replace(/\D/g, ''), 10);
      if (!isNaN(parsedRoll) && parsedRoll > 0) {
        return formatStudentId(className || 'Class 1', parsedRoll);
      }
    }
    
    try {
      const students = await this.getStudents();
      const targetClassCode = getClassDigitOrCode(className || 'Class 1');
      let maxRollInClass = 0;

      students.forEach((std) => {
        const stdClassCode = getClassDigitOrCode(std.className);
        if (stdClassCode === targetClassCode) {
          // Check rollNumber
          if (std.rollNumber) {
            const parsed = parseInt(std.rollNumber.replace(/\D/g, ''), 10);
            if (!isNaN(parsed) && parsed > maxRollInClass) {
              maxRollInClass = parsed;
            }
          }
          // Check studentId suffix after GP
          if (std.studentId) {
            const match = std.studentId.match(/GP(\d{1,4})$/i);
            if (match) {
              const parsed = parseInt(match[1], 10);
              if (!isNaN(parsed) && parsed > maxRollInClass && parsed < 1000) {
                maxRollInClass = parsed;
              }
            }
          }
        }
      });

      const nextNum = maxRollInClass + 1;
      return formatStudentId(className || 'Class 1', nextNum);
    } catch (err) {
      console.warn('Could not compute max student ID, defaulting to format', err);
      return formatStudentId(className || 'Class 1', 1);
    }
  },

  /**
   * Add a new student record to Firestore
   */
  async addStudent(formData: StudentFormData): Promise<Student> {
    // Generate Student ID strictly in [ClassDigit]GP[3-digit Roll] format (e.g. 10GP014, 5GP014, 1GP014)
    let newStudentId = '';
    const cleanRoll = formData.rollNumber?.trim();
    if (cleanRoll) {
      const parsedRoll = parseInt(cleanRoll.replace(/\D/g, ''), 10);
      if (!isNaN(parsedRoll) && parsedRoll > 0) {
        newStudentId = formatStudentId(formData.className, parsedRoll);
      }
    }

    if (!newStudentId) {
      newStudentId = await this.generateNextStudentId(formData.className);
    }

    // Document Name in Firestore using the student's name
    let docId = generateStudentDocId(formData.name);

    // If a document with this candidate name already exists, append the student ID to prevent overwriting
    try {
      const existingSnap = await getDoc(doc(db, COLLECTION_NAME, docId));
      if (existingSnap.exists()) {
        docId = `${docId}_${newStudentId}`;
      }
    } catch (checkErr) {
      console.warn('Document existence check note:', checkErr);
    }

    const uid = docId;
    const now = new Date().toISOString();

    const rawRecord: Student = {
      uid,
      studentId: newStudentId,
      name: formData.name.trim(),
      email: formData.email?.trim() || undefined,
      className: formData.className,
      section: (formData.section || 'A').toUpperCase().trim(),
      rollNumber: formData.rollNumber.trim() || '',
      board: formData.board,
      parentName: formData.parentName.trim(),
      phone: formData.phone.trim(),
      alternatePhone: formData.alternatePhone?.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address?.trim() || undefined,
      previousSchool: formData.previousSchool?.trim() || undefined,
      admissionDate: formData.admissionDate || now.split('T')[0],
      profilePhoto: formData.profilePhoto?.trim() || undefined,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    const studentRecord = sanitizeFirestorePayload(rawRecord) as Student;
    const docRef = doc(db, COLLECTION_NAME, uid);

    try {
      await setDoc(docRef, studentRecord);

      // Audit log
      await auditService.logAction({
        actorUid: (studentRecord as any).createdBy || 'admin',
        actorRole: 'ADMIN',
        action: 'STUDENT_CREATED',
        targetType: 'STUDENT',
        targetId: uid,
        targetName: studentRecord.name,
        success: true,
        metadata: {
          studentId: studentRecord.studentId,
          className: studentRecord.className,
          section: studentRecord.section,
        },
      });

      return rawRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Update an existing student record in Firestore
   */
  async updateStudent(uid: string, formData: Partial<StudentFormData>, actorUid?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const now = new Date().toISOString();

    const rawPayload: Record<string, any> = {
      updatedAt: now,
    };

    if (formData.name !== undefined) rawPayload.name = formData.name.trim();
    if (formData.email !== undefined) rawPayload.email = formData.email.trim();
    if (formData.className !== undefined) rawPayload.className = formData.className;
    if (formData.section !== undefined) rawPayload.section = formData.section.toUpperCase().trim();
    if (formData.rollNumber !== undefined) {
      rawPayload.rollNumber = formData.rollNumber.trim();
      const parsedRoll = parseInt(formData.rollNumber.replace(/\D/g, ''), 10);
      if (!isNaN(parsedRoll) && parsedRoll > 0) {
        rawPayload.studentId = formatStudentId(formData.className, parsedRoll);
      }
    } else if (formData.className !== undefined) {
      // If only class changed, update studentId if possible
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const curData = snap.data() as Student;
          if (curData.rollNumber) {
            const parsedRoll = parseInt(curData.rollNumber.replace(/\D/g, ''), 10);
            if (!isNaN(parsedRoll) && parsedRoll > 0) {
              rawPayload.studentId = formatStudentId(formData.className, parsedRoll);
            }
          }
        }
      } catch (e) {
        console.warn('Could not auto-update student ID on class change:', e);
      }
    }
    if (formData.board !== undefined) rawPayload.board = formData.board;
    if (formData.parentName !== undefined) rawPayload.parentName = formData.parentName.trim();
    if (formData.phone !== undefined) rawPayload.phone = formData.phone.trim();
    if (formData.alternatePhone !== undefined) rawPayload.alternatePhone = formData.alternatePhone.trim();
    if (formData.dateOfBirth !== undefined) rawPayload.dateOfBirth = formData.dateOfBirth;
    if (formData.address !== undefined) rawPayload.address = formData.address.trim();
    if (formData.previousSchool !== undefined) rawPayload.previousSchool = formData.previousSchool.trim();
    if (formData.admissionDate !== undefined) rawPayload.admissionDate = formData.admissionDate;
    if (formData.profilePhoto !== undefined) rawPayload.profilePhoto = formData.profilePhoto.trim();

    const updatePayload = sanitizeFirestorePayload(rawPayload);

    try {
      await updateDoc(docRef, updatePayload);

      // Audit log
      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'STUDENT_UPDATED',
          targetType: 'STUDENT',
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
   * Soft disable a student (status = DISABLED)
   */
  async disableStudent(uid: string, actorUid?: string): Promise<void> {
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
          action: 'STUDENT_DISABLED',
          targetType: 'STUDENT',
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
   * Re-enable / activate a student (status = ACTIVE)
   */
  async enableStudent(uid: string, actorUid?: string): Promise<void> {
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
          action: 'STUDENT_ENABLED',
          targetType: 'STUDENT',
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
   * Soft-delete student record (protects historical attendance, fees, receipts)
   */
  async softDeleteStudent(uid: string, actorUid: string): Promise<void> {
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
        action: 'STUDENT_SOFT_DELETED',
        targetType: 'STUDENT',
        targetId: uid,
        success: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },

  /**
   * Restore a soft-deleted student record
   */
  async restoreStudent(uid: string, actorUid: string): Promise<void> {
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
        action: 'STUDENT_RESTORED',
        targetType: 'STUDENT',
        targetId: uid,
        success: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
      throw error;
    }
  },
};
