import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AdmissionEnquiry,
  AdmissionEnquiryNote,
  AdmissionEnquiryStatus,
  AdmissionSubmittedFormData
} from '../types/admission';
import { auditService } from './auditService';

const COLLECTION_NAME = 'admissionEnquiries';

export const admissionService = {
  /**
   * Automatically generate the next Admission Enquiry ID (Format: GP-ENQ-2026-00001)
   */
  async generateNextEnquiryId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GP-ENQ-${year}-`;

    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      let maxNum = 0;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as AdmissionEnquiry;
        if (data.enquiryId && data.enquiryId.startsWith(prefix)) {
          const numStr = data.enquiryId.replace(prefix, '');
          const parsed = parseInt(numStr, 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        }
      });

      const nextNum = maxNum + 1;
      const formattedNum = String(nextNum).padStart(5, '0');
      return `${prefix}${formattedNum}`;
    } catch (err) {
      console.warn('Could not compute max enquiry ID, defaulting to GP-ENQ-2026-00001', err);
      return `${prefix}00001`;
    }
  },

  /**
   * Submit a public admission enquiry into Firestore
   */
  async submitPublicEnquiry(formData: AdmissionSubmittedFormData): Promise<string> {
    const generatedEnquiryId = await this.generateNextEnquiryId();
    const docId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newRecord: AdmissionEnquiry = {
      id: docId,
      enquiryId: generatedEnquiryId,
      submittedFormData: {
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        phone: formData.phone.trim(),
        previousSchool: formData.previousSchool?.trim() || '',
        grade: formData.grade,
        board: formData.board,
        studentAge: formData.studentAge.trim(),
        remarks: formData.remarks?.trim() || '',
      },
      // Top level fields for easy querying/filtering/searching
      studentName: formData.studentName.trim(),
      parentName: formData.parentName.trim(),
      phone: formData.phone.trim(),
      grade: formData.grade,
      board: formData.board,
      studentAge: formData.studentAge.trim(),
      previousSchool: formData.previousSchool?.trim() || '',
      remarks: formData.remarks?.trim() || '',
      status: 'NEW',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = doc(db, COLLECTION_NAME, docId);
    try {
      await setDoc(docRef, newRecord);
      return generatedEnquiryId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
      throw error;
    }
  },

  /**
   * Fetch all admission enquiries (Admin only)
   */
  async getEnquiries(): Promise<AdmissionEnquiry[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const enquiries: AdmissionEnquiry[] = [];
      querySnapshot.forEach((docSnap) => {
        enquiries.push(docSnap.data() as AdmissionEnquiry);
      });
      return enquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching admission enquiries:', error);
      return [];
    }
  },

  /**
   * Fetch a single admission enquiry by doc ID
   */
  async getEnquiryById(id: string): Promise<AdmissionEnquiry | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AdmissionEnquiry;
      }
      return null;
    } catch (error) {
      console.warn('Warning/offline fetching admission enquiry by ID:', error);
      return null;
    }
  },

  /**
   * Update status (and optional follow-up data) of an enquiry
   */
  async updateStatus(
    id: string,
    status: AdmissionEnquiryStatus,
    followUpData?: { followUpDate?: string; followUpNote?: string },
    actorUid?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();

    const payload: Record<string, any> = {
      status,
      updatedAt: now,
    };

    if (status === 'FOLLOW_UP' && followUpData) {
      if (followUpData.followUpDate !== undefined) payload.followUpDate = followUpData.followUpDate;
      if (followUpData.followUpNote !== undefined) payload.followUpNote = followUpData.followUpNote;
    }

    try {
      await updateDoc(docRef, payload);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'ADMISSION_STATUS_UPDATED',
          targetType: 'ADMISSION',
          targetId: id,
          success: true,
          metadata: {
            status,
            ...followUpData,
          },
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  },

  /**
   * Add internal admin note to subcollection admissionEnquiries/{enquiryId}/notes/{noteId}
   */
  async addNote(enquiryId: string, noteText: string, createdBy: string): Promise<AdmissionEnquiryNote> {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const noteRecord: AdmissionEnquiryNote = {
      id: noteId,
      enquiryId,
      note: noteText.trim(),
      createdBy,
      createdAt: now,
    };

    const noteRef = doc(db, COLLECTION_NAME, enquiryId, 'notes', noteId);
    try {
      await setDoc(noteRef, noteRecord);
      return noteRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${enquiryId}/notes/${noteId}`);
      throw error;
    }
  },

  /**
   * Get all internal notes for an enquiry
   */
  async getNotes(enquiryId: string): Promise<AdmissionEnquiryNote[]> {
    const notesCollRef = collection(db, COLLECTION_NAME, enquiryId, 'notes');
    try {
      const querySnapshot = await getDocs(notesCollRef);
      const notes: AdmissionEnquiryNote[] = [];
      querySnapshot.forEach((docSnap) => {
        notes.push(docSnap.data() as AdmissionEnquiryNote);
      });
      return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching enquiry notes:', error);
      return [];
    }
  },

  /**
   * Link converted student ID and update status to ADMISSION_CONFIRMED
   */
  async linkConvertedStudent(enquiryId: string, studentId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, enquiryId);
    const now = new Date().toISOString();

    try {
      await updateDoc(docRef, {
        status: 'ADMISSION_CONFIRMED',
        convertedStudentId: studentId,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${enquiryId}`);
      throw error;
    }
  },

  /**
   * Delete enquiry (for SUPER_ADMIN only)
   */
  async deleteEnquiry(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  },
};
