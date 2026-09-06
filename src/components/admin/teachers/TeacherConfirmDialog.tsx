import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Teacher } from '../../../types/teacher';

interface TeacherConfirmDialogProps {
  isOpen: boolean;
  teacher: Teacher | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TeacherConfirmDialog({
  isOpen,
  teacher,
  onConfirm,
  onCancel,
  isLoading = false,
}: TeacherConfirmDialogProps) {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
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
            Are you sure you want to disable this teacher?
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Disabling <span className="font-bold text-gray-800">{teacher.name}</span> ({teacher.teacherId}) will revoke their access to the Teacher Panel. Their historical records will remain intact in Firestore.
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
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Disabling...</span>
              </>
            ) : (
              <span>Confirm Disable</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
