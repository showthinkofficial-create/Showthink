import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success';
  note?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  note,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isSuccess = variant === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001c46]/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl border ${
            isSuccess 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {isSuccess ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-[#001c46] tracking-tight">{title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
        </div>

        {note ? (
          <div className={`p-3.5 rounded-2xl border text-[11px] font-medium ${
            isSuccess
              ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
          }`}>
            <p className="font-bold">Note:</p>
            <p>{note}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 ${
              isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
