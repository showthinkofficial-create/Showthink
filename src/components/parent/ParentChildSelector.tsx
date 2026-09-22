import React from 'react';
import { Student } from '../../types/student';
import { Users, User, ChevronDown, Check, AlertCircle } from 'lucide-react';

interface ParentChildSelectorProps {
  childrenList: Student[];
  selectedChild: Student | null;
  onSelectChild: (child: Student) => void;
  compact?: boolean;
}

export const ParentChildSelector: React.FC<ParentChildSelectorProps> = ({
  childrenList,
  selectedChild,
  onSelectChild,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (childrenList.length <= 1 && !compact) {
    if (childrenList.length === 1 && selectedChild) {
      return (
        <div className="flex items-center gap-3 bg-white/90 border border-gray-200/80 rounded-2xl px-4 py-2.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#001c46] text-[#FFC907] font-black text-xs flex items-center justify-center shrink-0">
            {selectedChild.name.charAt(0)}
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#001c46] truncate max-w-[140px] sm:max-w-[200px]">
                {selectedChild.name}
              </span>
              <span className="text-[10px] bg-blue-50 text-[#001c46] font-bold px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                {selectedChild.className} — {selectedChild.section}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold block">
              ID: {selectedChild.studentId} • Roll: {selectedChild.rollNumber || 'N/A'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 sm:gap-3 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-2xl transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#001c46]/20 ${
          compact ? 'px-2.5 py-1.5' : 'px-2.5 sm:px-4 py-1.5 sm:py-2.5'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-left">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#001c46] text-[#FFC907] font-black text-xs flex items-center justify-center shrink-0">
            {selectedChild ? selectedChild.name.charAt(0) : <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-tight">
              Active Child
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xs font-black text-[#001c46] truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[160px]">
                {selectedChild ? selectedChild.name : 'Select Child'}
              </span>
              {selectedChild && (
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 bg-gray-100 px-1 sm:px-1.5 py-0.2 rounded shrink-0">
                  {selectedChild.className}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-scaleIn">
          <div className="px-4 py-2 border-b border-gray-100">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
              Switch Linked Child ({childrenList.length})
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 p-1">
            {childrenList.map((child) => {
              const isSelected = selectedChild?.uid === child.uid;
              const isDisabled = child.status === 'DISABLED';

              return (
                <button
                  key={child.uid}
                  type="button"
                  onClick={() => {
                    onSelectChild(child);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected ? 'bg-amber-50/80 border border-amber-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#001c46] text-[#FFC907]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {child.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-[#001c46] truncate">
                          {child.name}
                        </span>
                        {isDisabled && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium block">
                        {child.className} - {child.section} • ID: {child.studentId}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#001c46] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
