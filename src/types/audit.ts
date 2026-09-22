export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'STUDENT_CREATED'
  | 'STUDENT_UPDATED'
  | 'STUDENT_DISABLED'
  | 'STUDENT_ENABLED'
  | 'STUDENT_SOFT_DELETED'
  | 'STUDENT_RESTORED'
  | 'STUDENT_DELETED'
  | 'TEACHER_CREATED'
  | 'TEACHER_UPDATED'
  | 'TEACHER_DISABLED'
  | 'TEACHER_ENABLED'
  | 'TEACHER_SOFT_DELETED'
  | 'TEACHER_RESTORED'
  | 'TEACHER_DELETED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PORTAL_USER_CREATED'
  | 'PORTAL_USER_DISABLED'
  | 'PORTAL_USER_ENABLED'
  | 'PORTAL_STUDENT_LINKED'
  | 'PORTAL_STUDENT_UNLINKED'
  | 'FEE_STRUCTURE_CREATED'
  | 'FEE_STRUCTURE_UPDATED'
  | 'FEE_STRUCTURE_DELETED'
  | 'FEE_CREATED'
  | 'FEE_UPDATED'
  | 'FEE_DELETED'
  | 'PAYMENT_RECORDED'
  | 'PAYMENT_VERIFIED'
  | 'FEE_REFUND_RECORDED'
  | 'RESULT_PUBLISHED'
  | 'RESULT_UPDATED'
  | 'RESULT_DELETED'
  | 'ATTENDANCE_MARKED'
  | 'ATTENDANCE_MODIFIED'
  | 'ATTENDANCE_DELETED'
  | 'NOTICE_CREATED'
  | 'NOTICE_UPDATED'
  | 'NOTICE_DELETED'
  | 'GALLERY_ALBUM_CREATED'
  | 'GALLERY_ALBUM_UPDATED'
  | 'GALLERY_ALBUM_DELETED'
  | 'GALLERY_MEDIA_UPLOADED'
  | 'GALLERY_MEDIA_DELETED'
  | 'SETTINGS_UPDATED'
  | 'SETTINGS_CHANGED'
  | 'ADMISSION_CREATED'
  | 'ADMISSION_UPDATED'
  | 'ADMISSION_STATUS_UPDATED'
  | 'BACKUP_EXPORTED'
  | 'BACKUP_RESTORED'
  | 'PRIVILEGED_OP_FAILED';

export type AuditTargetType =
  | 'STUDENT'
  | 'TEACHER'
  | 'PORTAL_USER'
  | 'PORTAL_LINK'
  | 'FEE'
  | 'PAYMENT'
  | 'ATTENDANCE'
  | 'RESULT'
  | 'NOTICE'
  | 'GALLERY'
  | 'SETTINGS'
  | 'ADMISSION'
  | 'BACKUP'
  | 'AUTH';

export interface AuditLogEntry {
  id?: string;
  actorUid: string;
  actorEmail?: string;
  actorRole: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  targetName?: string;
  timestamp: string; // ISO 8601 string
  success: boolean;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface AuditFilterOptions {
  action?: string;
  targetType?: string;
  actorRole?: string;
  actorEmail?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
