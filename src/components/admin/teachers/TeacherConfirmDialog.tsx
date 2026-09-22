import React from 'react';
import { AlertTriangle, X, KeyRound, UserCheck, Trash2, Mail } from 'lucide-react';
import { Teacher } from '../../../types/teacher';

export type DialogActionType = 'disable' | 'enable' | 'reset-password' | 'delete';

interface TeacherConfirmDialogProps {
  isOpen: boolean;
  teacher: Teacher | null;
  actionType?: DialogActionType;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TeacherConfirmDialog({
  isOpen,
  teacher,
  actionType = 'disable',
  onConfirm,
  onCancel,
  isLoading = false,
}: TeacherConfirmDialogProps) {
  if (!isOpen || !teacher) return null;

  const config = {
    disable: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-700',
      title: 'Disable Teacher Account?',
      description: `Disabling faculty member ${teacher.name} (${teacher.teacherId}) will immediately revoke their ability to log into the Teacher Portal. Their data and records will be preserved safely.`,
      confirmText: 'Disable Account',
      confirmBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      loadingText: 'Disabling...',
    },
    enable: {
      icon: UserCheck,
      iconBg: 'bg-emerald-100 text-emerald-700',
      title: 'Re-enable Teacher Account?',
      description: `Activating ${teacher.name} (${teacher.teacherId}) will restore their full access to the GP Academy Teacher Portal.`,
      confirmText: 'Re-enable Account',
      confirmBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      loadingText: 'Activating...',
    },
    'reset-password': {
      icon: KeyRound,
      iconBg: 'bg-blue-100 text-blue-700',
      title: 'Dispatch Password Reset Link?',
      description: `Send an official Firebase password reset email to ${teacher.email}? The teacher will receive a secure one-time link to create or update their password.`,
      confirmText: 'Send Reset Email',
      confirmBg: 'bg-[#001c46] hover:bg-[#001c46]/90 text-white',
      loadingText: 'Sending Email...',
    },
    delete: {
      icon: Trash2,
      iconBg: 'bg-rose-100 text-rose-700',
      title: 'Delete Faculty Record?',
      description: `Are you sure you want to delete ${teacher.name} (${teacher.teacherId})? Their Firebase Authentication login will be disabled and their record will be soft-deleted in accordance with school data governance rules.`,
      confirmText: 'Delete Record',
      confirmBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      loadingText: 'Deleting...',
    },
  }[actionType];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900">
            {config.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 ${config.confirmBg}`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{config.loadingText}</span>
              </>
            ) : (
              <span>{config.confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

