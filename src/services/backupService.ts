import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auditService } from './auditService';

export interface DatabaseBackupSnapshot {
  version: string;
  generatedAt: string;
  generatedBy: {
    uid: string;
    role: string;
  };
  totalCollections: number;
  totalDocuments: number;
  collections: {
    students: any[];
    teachers: any[];
    users: any[];
    portalStudentLinks: any[];
    attendance: any[];
    feeStructures: any[];
    payments: any[];
    timetables: any[];
    timetableEntries: any[];
    notices: any[];
    galleryAlbums: any[];
    schoolSettings: any[];
    auditLogs: any[];
  };
}

export interface BackupVerificationResult {
  isValid: boolean;
  totalRecords: number;
  collectionsFound: string[];
  issues: string[];
  generatedAt?: string;
}

export const backupService = {
  /**
   * Export complete Firestore collections snapshot as a structured JSON object
   */
  async generateDatabaseSnapshot(adminUid: string, adminRole: string): Promise<DatabaseBackupSnapshot> {
    const collectionsToBackup = [
      'students',
      'teachers',
      'users',
      'portalStudentLinks',
      'attendance',
      'feeStructures',
      'payments',
      'examResults',
      'admissionEnquiries',
      'timetables',
      'timetableEntries',
      'notices',
      'galleryAlbums',
      'galleryMedia',
      'schoolSettings',
      'auditLogs',
    ];

    const snapshotData: Record<string, any[]> = {};
    let totalDocCount = 0;

    for (const colName of collectionsToBackup) {
      try {
        const snap = await getDocs(collection(db, colName));
        const items: any[] = [];
        snap.forEach((d) => {
          items.push({
            _id: d.id,
            ...d.data(),
          });
        });
        snapshotData[colName] = items;
        totalDocCount += items.length;
      } catch (err) {
        console.warn(`Could not snapshot collection ${colName}:`, err);
        snapshotData[colName] = [];
      }
    }

    const now = new Date().toISOString();
    const backupObj: DatabaseBackupSnapshot = {
      version: '1.0.0',
      generatedAt: now,
      generatedBy: {
        uid: adminUid,
        role: adminRole,
      },
      totalCollections: collectionsToBackup.length,
      totalDocuments: totalDocCount,
      collections: snapshotData as any,
    };

    // Log the backup action in audit trail
    await auditService.logAction({
      actorUid: adminUid,
      actorRole: adminRole,
      action: 'BACKUP_EXPORTED',
      targetType: 'BACKUP',
      targetName: `Full Database Snapshot (${totalDocCount} documents)`,
      success: true,
      metadata: {
        totalDocuments: totalDocCount,
        collectionsBackedUp: collectionsToBackup,
        generatedAt: now,
      },
    });

    return backupObj;
  },

  /**
   * Trigger direct browser download of the database JSON snapshot file
   */
  async downloadDatabaseBackup(adminUid: string, adminRole: string): Promise<boolean> {
    try {
      const snapshot = await this.generateDatabaseSnapshot(adminUid, adminRole);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `gp-academy-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (err) {
      console.error('Failed to download database backup:', err);
      return false;
    }
  },

  /**
   * Verify integrity of a database snapshot
   */
  verifySnapshotIntegrity(snapshot: any): BackupVerificationResult {
    const issues: string[] = [];
    if (!snapshot || typeof snapshot !== 'object') {
      return { isValid: false, totalRecords: 0, collectionsFound: [], issues: ['Invalid snapshot JSON format.'] };
    }

    if (!snapshot.collections || typeof snapshot.collections !== 'object') {
      issues.push('Missing collections mapping in backup.');
    }

    const collectionsFound = snapshot.collections ? Object.keys(snapshot.collections) : [];
    let totalRecords = 0;

    for (const key of collectionsFound) {
      const list = snapshot.collections[key];
      if (Array.isArray(list)) {
        totalRecords += list.length;
      } else {
        issues.push(`Collection "${key}" is not formatted as an array.`);
      }
    }

    return {
      isValid: issues.length === 0,
      totalRecords,
      collectionsFound,
      issues,
      generatedAt: snapshot.generatedAt,
    };
  },

  /**
   * Restore a soft-deleted record in any supported collection
   */
  async restoreSoftDeletedRecord(
    collectionName: string,
    docId: string,
    adminUid: string,
    adminRole: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        throw new Error(`Record ${docId} does not exist in collection ${collectionName}.`);
      }

      const now = new Date().toISOString();
      await updateDoc(docRef, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedAt: now,
      });

      await auditService.logAction({
        actorUid: adminUid,
        actorRole: adminRole,
        action: 'BACKUP_RESTORED',
        targetType: collectionName.toUpperCase() as any,
        targetId: docId,
        targetName: snap.data()?.name || snap.data()?.title || docId,
        success: true,
        metadata: {
          collection: collectionName,
          restoredAt: now,
        },
      });

      return true;
    } catch (err) {
      console.error(`Failed to restore soft-deleted record in ${collectionName}:`, err);
      return false;
    }
  },
};
