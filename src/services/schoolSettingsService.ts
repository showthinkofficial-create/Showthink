import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestorePayload } from '../lib/firebase';
import { auditService } from './auditService';

export interface SchoolSettings {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hoursWeekday: string;
  hoursWeekend: string;
  aboutSchool: string;
  principalMessage: string;
  logoUrl?: string;
  faviconUrl?: string;
  admissionCycle: string;
  admissionOffers: {
    admission: string;
    extras: string;
    referral: string;
    duration: string;
  };
  updatedAt: string;
}

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  id: 'general',
  name: 'GP Academy',
  tagline: 'Knowledge Is the biggest money',
  address: 'Bhangel, Goyal Colony, Salarpur Khadar, Noida, Uttar Pradesh — 201304',
  phone: '9818776563',
  email: 'admissions@gpacademy.edu.in',
  hoursWeekday: 'Monday–Saturday: 8:00 AM – 3:00 PM',
  hoursWeekend: 'Sunday: 9:00 AM – 2:00 PM',
  aboutSchool: 'GP Academy is a dedicated educational institution in Noida providing comprehensive schooling from Nursery to Class 12. We offer a robust CBSE curriculum across all foundational and middle grades, along with flexible CBSE and UP Board tracks for senior classes, backed by specialized in-house coaching.',
  principalMessage: 'Welcome to GP Academy. We believe that true knowledge is the most enduring wealth a student can acquire. Our disciplined environment, dedicated faculty, and focus on both academic fundamentals and moral character prepare every child to excel in board examinations and beyond.',
  admissionCycle: 'Academic Session 2026-27 (June to August)',
  admissionOffers: {
    admission: 'Admission Free',
    extras: 'Tie & Belt Free',
    referral: 'If 3 students are admitted together during the applicable admission period (June to August): Fee Free for 3 months.',
    duration: 'June to August'
  },
  updatedAt: new Date().toISOString()
};

const SETTINGS_DOC_ID = 'general';
const COLLECTION_NAME = 'schoolSettings';

export const schoolSettingsService = {
  /**
   * Get current school settings from Firestore or fallback to default
   */
  async getSettings(): Promise<SchoolSettings> {
    try {
      const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<SchoolSettings>;
        return {
          ...DEFAULT_SCHOOL_SETTINGS,
          ...data,
          admissionOffers: {
            ...DEFAULT_SCHOOL_SETTINGS.admissionOffers,
            ...(data.admissionOffers || {})
          }
        };
      }
    } catch (err) {
      console.warn('Using default school settings due to offline/fetch error:', err);
    }
    return DEFAULT_SCHOOL_SETTINGS;
  },

  /**
   * Update school settings in Firestore (Admin only)
   */
  async updateSettings(newSettings: Partial<SchoolSettings>, actorUid?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const now = new Date().toISOString();
    const payload: Record<string, any> = {
      ...newSettings,
      id: SETTINGS_DOC_ID,
      updatedAt: now
    };

    try {
      await setDoc(docRef, sanitizeFirestorePayload(payload), { merge: true });

      if (actorUid) {
        await auditService.logAction({
          actorUid,
          actorRole: 'ADMIN',
          action: 'SETTINGS_CHANGED',
          targetType: 'SETTINGS',
          targetId: SETTINGS_DOC_ID,
          targetName: 'General School Settings',
          success: true,
          metadata: {
            updatedFields: Object.keys(newSettings),
          },
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${SETTINGS_DOC_ID}`);
      throw error;
    }
  },

  /**
   * Subscribe to real-time school settings updates
   */
  subscribeSettings(callback: (settings: SchoolSettings) => void): () => void {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SchoolSettings>;
          callback({
            ...DEFAULT_SCHOOL_SETTINGS,
            ...data,
            admissionOffers: {
              ...DEFAULT_SCHOOL_SETTINGS.admissionOffers,
              ...(data.admissionOffers || {})
            }
          });
        } else {
          callback(DEFAULT_SCHOOL_SETTINGS);
        }
      },
      (err) => {
        console.warn('Settings subscription warning:', err);
        callback(DEFAULT_SCHOOL_SETTINGS);
      }
    );
  }
};
