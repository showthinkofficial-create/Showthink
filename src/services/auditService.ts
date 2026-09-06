import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditLogEntry, AuditFilterOptions, AuditAction, AuditTargetType } from '../types/audit';

const COLLECTION_NAME = 'auditLogs';

// Helper to recursively sanitize metadata and strip any password/token/key fields
function sanitizeMetadata(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMetadata(item));
  }

  const clean: Record<string, any> = {};
  const forbiddenPatterns = [/password/i, /token/i, /secret/i, /private/i, /apikey/i, /auth/i, /credential/i];

  for (const [key, value] of Object.entries(obj)) {
    const isForbidden = forbiddenPatterns.some((pattern) => pattern.test(key));
    if (isForbidden) {
      clean[key] = '[REDACTED_FOR_SECURITY]';
    } else if (value && typeof value === 'object') {
      clean[key] = sanitizeMetadata(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export const auditService = {
  /**
   * Securely record an audit log entry.
   * Append-only; fail-safe so operational flows are not interrupted if network fails.
   */
  async logAction(entry: {
    actorUid: string;
    actorEmail?: string;
    actorRole: string;
    action: AuditAction;
    targetType: AuditTargetType;
    targetId?: string;
    targetName?: string;
    success?: boolean;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): Promise<string | null> {
    try {
      if (!entry.actorUid) {
        console.warn('AuditLog skipped: actorUid missing.');
        return null;
      }

      const now = new Date().toISOString();
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const logRef = doc(db, COLLECTION_NAME, logId);

      const sanitizedMeta = entry.metadata ? sanitizeMetadata(entry.metadata) : undefined;

      const payload: AuditLogEntry = {
        id: logId,
        actorUid: entry.actorUid,
        actorEmail: entry.actorEmail || 'unknown',
        actorRole: entry.actorRole || 'UNKNOWN',
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId || undefined,
        targetName: entry.targetName || undefined,
        timestamp: now,
        success: entry.success !== false,
        metadata: sanitizedMeta,
        ipAddress: entry.ipAddress || undefined,
      };

      await setDoc(logRef, payload);
      return logId;
    } catch (err) {
      console.warn('Audit logging non-fatal notice:', err);
      return null;
    }
  },

  /**
   * Fetch recent audit logs for administrators (SUPER_ADMIN and authorized ADMIN)
   */
  async getAuditLogs(limitCount: number = 100): Promise<AuditLogEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snap = await getDocs(q);
      const logs: AuditLogEntry[] = [];
      snap.forEach((d) => {
        logs.push(d.data() as AuditLogEntry);
      });

      return logs;
    } catch (err) {
      console.warn('Warning fetching audit logs:', err);
      return [];
    }
  },

  /**
   * Filter audit logs by specific criteria
   */
  async queryAuditLogs(filters: AuditFilterOptions, limitCount: number = 100): Promise<AuditLogEntry[]> {
    try {
      const logs = await this.getAuditLogs(limitCount * 2);

      return logs.filter((log) => {
        if (filters.action && log.action !== filters.action) return false;
        if (filters.targetType && log.targetType !== filters.targetType) return false;
        if (filters.actorRole && log.actorRole !== filters.actorRole) return false;
        if (filters.actorEmail && !log.actorEmail?.toLowerCase().includes(filters.actorEmail.toLowerCase())) return false;
        if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate + 'T23:59:59.999Z')) return false;

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matches =
            log.action.toLowerCase().includes(q) ||
            log.targetType.toLowerCase().includes(q) ||
            (log.targetName && log.targetName.toLowerCase().includes(q)) ||
            (log.targetId && log.targetId.toLowerCase().includes(q)) ||
            (log.actorEmail && log.actorEmail.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      }).slice(0, limitCount);
    } catch (err) {
      console.warn('Warning querying audit logs:', err);
      return [];
    }
  },
};
