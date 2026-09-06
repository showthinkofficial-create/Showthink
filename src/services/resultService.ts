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
