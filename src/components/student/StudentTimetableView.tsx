import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  User,
  MapPin,
  BookOpen,
  Coffee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Timetable, TimetableEntry, DayOfWeek } from '../../types/timetable';

interface StudentTimetableViewProps {
  timetable: Timetable | null;
  entries: TimetableEntry[];
  studentClass: string;
  studentSection: string;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StudentTimetableView: React.FC<StudentTimetableViewProps> = ({
  timetable,
  entries,
  studentClass,
  studentSection,
}) => {
  // Default active day to today's day of week or Monday
  const getTodayDayOfWeek = (): DayOfWeek => {
    const dayIndex = new Date().getDay(); // 0 is Sunday
    const dayMap: Record<number, DayOfWeek> = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
    };
    return dayMap[dayIndex] || 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayOfWeek());

  // Filter entries for selected day and sort by periodNumber
  const dayEntries = entries
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#001c46]">
            <Clock className="w-6 h-6 text-[#FFC907]" />
            <h1 className="text-xl font-black">Class Schedule & Timetable</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Official daily subject schedule, class timing, assigned faculty, and room allocations.
          </p>
        </div>

        {timetable ? (
          <div className="flex items-center gap-2 bg-[#001c46] text-white px-4 py-2 rounded-2xl shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold">{timetable.className} ({timetable.section}) Schedule</span>
          </div>
        ) : (
          <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
            Published Timetable Pending
          </div>
        )}
      </div>

      {!timetable ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
          <Clock className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800">No Published Timetable Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            The official class timetable for <span className="font-bold">{studentClass} ({studentSection})</span> has not been published yet by GP Academy Administration.
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          {/* Day Selection Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-none">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const count = entries.filter((e) => e.day === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#001c46] text-[#FFC907] shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{day}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Daily Schedule List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-2 pb-1">
              <span>{selectedDay} Schedule</span>
              <span>{dayEntries.length} Periods Scheduled</span>
            </div>

            {dayEntries.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No periods scheduled for {selectedDay}.
              </div>
            ) : (
              <div className="space-y-3">
                {dayEntries.map((entry) => {
                  const isBreak = entry.isBreak;
                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isBreak
                          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                          : 'bg-white border-gray-200 hover:border-[#001c46] shadow-2xs'
                      }`}
                    >
                      {/* Time & Period Badge */}
                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isBreak
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-[#001c46] text-[#FFC907]'
                        }`}>
                          P{entry.periodNumber}
                        </div>
                        <div>
                          <div className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{entry.startTime} – {entry.endTime}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Period {entry.periodNumber}
                          </span>
                        </div>
                      </div>

                      {/* Subject Name / Break Label */}
                      <div className="flex-1">
                        {isBreak ? (
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                            <Coffee className="w-4 h-4 text-amber-600" />
                            <span>{entry.subjectName || 'Recess / Lunch Break'}</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#001c46]" />
                              <h4 className="font-black text-sm text-gray-900">{entry.subjectName}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-semibold">{entry.teacherName || 'Faculty Member'}</span>
                              </span>
                              {entry.roomNumber && (
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-gray-700">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  <span>Room {entry.roomNumber}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
