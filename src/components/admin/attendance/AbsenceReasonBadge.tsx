import React from 'react';
import { ABSENCE_REASONS, AbsenceReasonKey } from '../../../types/attendance';

interface AbsenceReasonBadgeProps {
  reasonKey?: string;
  note?: string;
  showHindi?: boolean;
  size?: 'sm' | 'md';
}

export const AbsenceReasonBadge: React.FC<AbsenceReasonBadgeProps> = ({
  reasonKey,
  note,
  showHindi = true,
  size = 'md',
}) => {
  if (!reasonKey) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        <span>❓</span>
        <span>Not Specified</span>
      </span>
    );
  }

  const option = ABSENCE_REASONS.find(
    (r) =>
      r.key === reasonKey ||
      r.label.toLowerCase() === reasonKey.toLowerCase() ||
      r.shortLabel.toLowerCase() === reasonKey.toLowerCase()
  );

  const icon = option?.icon || '💬';
  const label = option?.shortLabel || reasonKey;
  const hindiLabel = option?.hindiLabel;
  const bg = option?.badgeBg || 'bg-purple-50';
  const text = option?.badgeText || 'text-purple-700';
  const border = option?.badgeBorder || 'border-purple-200';

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        title={note ? `${option?.description || label} - Note: ${note}` : option?.description || label}
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold border ${bg} ${text} ${border} ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <span>{icon}</span>
        <span className="font-extrabold">{label}</span>
      </span>
      {showHindi && hindiLabel && (
        <span className="text-[10px] text-gray-500 font-medium pl-1">
          {hindiLabel}
        </span>
      )}
      {note && (
        <span className="text-[10px] text-gray-600 italic bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 mt-0.5 max-w-xs truncate">
          "{note}"
        </span>
      )}
    </div>
  );
};
