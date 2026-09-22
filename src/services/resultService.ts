import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ExamResult, ResultSummaryStats } from '../types/result';
import { auditService } from './auditService';

const COLLECTION_NAME = 'examResults';

export const resultService = {
  /**
   * Fetch all exam results from Firestore
   */
  async getExamResults(): Promise<ExamResult[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const results: ExamResult[] = [];
      snapshot.forEach((docSnap) => {
        results.push({
          id: docSnap.id,
          ...(docSnap.data() as ExamResult),
        });
      });
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching exam results:', error);
      return [];
    }
  },

  /**
   * Fetch exam results for a student
   */
  async getStudentExamResults(studentUid: string): Promise<ExamResult[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('studentUid', '==', studentUid));
      const snapshot = await getDocs(q);
      const results: ExamResult[] = [];
      snapshot.forEach((docSnap) => {
        results.push({
          id: docSnap.id,
          ...(docSnap.data() as ExamResult),
        });
      });
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Warning/offline fetching student exam results:', error);
      return [];
    }
  },

  /**
   * Add new exam result doc
   */
  async addExamResult(
    result: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt'>,
    actorUid?: string
  ): Promise<ExamResult> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...result,
      createdAt: now,
      updatedAt: now,
    });

    if (actorUid) {
      await auditService.logAction({
        actorUid,
        actorRole: 'TEACHER',
        action: 'RESULT_PUBLISHED',
        targetType: 'RESULT',
        targetId: docRef.id,
        targetName: `${result.examName} (${result.studentId || result.studentUid})`,
        success: true,
        metadata: {
          examName: result.examName,
          percentage: result.percentage,
          status: result.status,
        },
      });
    }

    return {
      id: docRef.id,
      ...result,
      createdAt: now,
      updatedAt: now,
    };
  },

  /**
   * Update existing result
   */
  async updateExamResult(id: string, data: Partial<ExamResult>, actorUid?: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: now,
      });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'TEACHER',
          action: 'RESULT_UPDATED',
          targetType: 'RESULT',
          targetId: id,
          success: true,
          metadata: {
            updatedFields: Object.keys(data),
          },
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw err;
    }
  },

  /**
   * Delete exam result
   */
  async deleteExamResult(id: string, actorUid?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'RESULT_DELETED',
          targetType: 'RESULT',
          targetId: id,
          success: true,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      throw err;
    }
  },

  /**
   * Helper to calculate letter grade from percentage
   */
  calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  },

  /**
   * Save or update marks entered by teacher for a class & subject
   */
  async saveSubjectMarksBatch(
    entries: {
      studentUid: string;
      studentId: string;
      studentName: string;
      rollNumber?: string;
      className: string;
      section: string;
      board?: string;
      marksObtained: number;
      remarks?: string;
    }[],
    metadata: {
      examName: string;
      academicSession: string;
      subject: string;
      maxMarks: number;
      date: string;
      teacherId?: string;
      teacherUid?: string;
      teacherName?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    
    // Fetch all existing results for this exam & session to minimize queries
    const q = query(
      collection(db, COLLECTION_NAME),
      where('examName', '==', metadata.examName),
      where('academicSession', '==', metadata.academicSession)
    );
    const existingSnap = await getDocs(q);
    const existingMap = new Map<string, { id: string; data: ExamResult }>();
    existingSnap.forEach((d) => {
      const data = d.data() as ExamResult;
      existingMap.set(data.studentUid || data.studentId, { id: d.id, data });
    });

    for (const entry of entries) {
      const existing = existingMap.get(entry.studentUid) || existingMap.get(entry.studentId);

      if (existing) {
        // Update existing exam record with this subject
        const currentSubjects: any[] = Array.isArray(existing.data.subjects)
          ? [...existing.data.subjects]
          : [];
        
        const subIndex = currentSubjects.findIndex(
          (s) => (s.subject || s.subjectName || '').toLowerCase() === metadata.subject.toLowerCase()
        );

        const newSubItem = {
          subject: metadata.subject,
          subjectName: metadata.subject,
          marksObtained: Number(entry.marksObtained),
          maxMarks: Number(metadata.maxMarks),
          grade: resultService.calculateGrade((Number(entry.marksObtained) / Number(metadata.maxMarks)) * 100),
          remarks: entry.remarks || '',
        };

        if (subIndex >= 0) {
          currentSubjects[subIndex] = newSubItem;
        } else {
          currentSubjects.push(newSubItem);
        }

        const totalObtained = currentSubjects.reduce((sum, s) => sum + Number(s.marksObtained || 0), 0);
        const totalMax = currentSubjects.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);
        const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
        const status = percentage >= 33 ? 'PASSED' : 'FAILED';
        const grade = resultService.calculateGrade(percentage);

        await updateDoc(doc(db, COLLECTION_NAME, existing.id), {
          subjects: currentSubjects,
          totalObtained,
          totalMarksObtained: totalObtained,
          totalMax,
          totalMaxMarks: totalMax,
          percentage,
          grade,
          status,
          resultStatus: status,
          remarks: entry.remarks || existing.data.remarks || '',
          date: metadata.date,
          teacherId: metadata.teacherId || existing.data.teacherId || '',
          teacherUid: metadata.teacherUid || existing.data.teacherUid || '',
          teacherName: metadata.teacherName || existing.data.teacherName || '',
          updatedAt: now,
        });

      } else {
        // Create new exam record
        const percentage = metadata.maxMarks > 0
          ? Math.round((Number(entry.marksObtained) / Number(metadata.maxMarks)) * 1000) / 10
          : 0;
        const status = percentage >= 33 ? 'PASSED' : 'FAILED';
        const grade = resultService.calculateGrade(percentage);

        const newResultData = {
          studentUid: entry.studentUid,
          studentId: entry.studentId,
          studentName: entry.studentName,
          rollNumber: entry.rollNumber || '',
          className: entry.className,
          section: entry.section,
          board: entry.board || 'CBSE',
          examName: metadata.examName,
          academicSession: metadata.academicSession,
          subject: metadata.subject,
          subjects: [
            {
              subject: metadata.subject,
              subjectName: metadata.subject,
              marksObtained: Number(entry.marksObtained),
              maxMarks: Number(metadata.maxMarks),
              grade,
              remarks: entry.remarks || '',
            },
          ],
          totalObtained: Number(entry.marksObtained),
          totalMarksObtained: Number(entry.marksObtained),
          totalMax: Number(metadata.maxMarks),
          totalMaxMarks: Number(metadata.maxMarks),
          percentage,
          grade,
          status,
          resultStatus: status,
          date: metadata.date,
          teacherId: metadata.teacherId || '',
          teacherUid: metadata.teacherUid || '',
          teacherName: metadata.teacherName || '',
          remarks: entry.remarks || '',
          createdAt: now,
          updatedAt: now,
        };

        await addDoc(collection(db, COLLECTION_NAME), newResultData);
      }
    }

    if (metadata.teacherUid) {
      await auditService.logAction({
        actorUid: metadata.teacherUid,
        actorRole: 'TEACHER',
        action: 'RESULT_PUBLISHED',
        targetType: 'RESULT',
        targetName: `${metadata.examName} - ${metadata.subject} (${entries.length} students)`,
        success: true,
        metadata: {
          examName: metadata.examName,
          subject: metadata.subject,
          studentCount: entries.length,
          teacherId: metadata.teacherId,
        },
      });
    }
  },

  /**
   * Compute stats for a list of ExamResult objects
   */
  computeResultStats(results: ExamResult[]): ResultSummaryStats {
    if (!results.length) {
      return {
        studentsAppeared: 0,
        passed: 0,
        failed: 0,
        passPercentage: 0,
        averagePercentage: 0,
        highestPercentage: 0,
        lowestPercentage: 0,
      };
    }

    const studentsAppeared = results.length;
    let passed = 0;
    let failed = 0;
    let sumPercentage = 0;
    let highest = -1;
    let lowest = 101;

    results.forEach((r) => {
      const pct = Number(r.percentage || 0);
      sumPercentage += pct;
      if (pct > highest) highest = pct;
      if (pct < lowest) lowest = pct;

      if (r.status === 'PASSED' || pct >= 33) {
        passed++;
      } else {
        failed++;
      }
    });

    const averagePercentage = Math.round((sumPercentage / studentsAppeared) * 10) / 10;
    const passPercentage = Math.round((passed / studentsAppeared) * 1000) / 10;

    return {
      studentsAppeared,
      passed,
      failed,
      passPercentage,
      averagePercentage,
      highestPercentage: highest < 0 ? 0 : Math.round(highest * 10) / 10,
      lowestPercentage: lowest > 100 ? 0 : Math.round(lowest * 10) / 10,
    };
  },
};
