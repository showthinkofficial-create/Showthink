import React, { useState } from 'react';
import { Student } from '../../types/student';
import { Timetable, TimetableEntry } from '../../types/timetable';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  Coffee,
  Sun,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface ParentTimetableViewProps {
  student: Student | null;
  timetable: Timetable | null;
  entries: TimetableEntry[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ParentTimetableView: React.FC<ParentTimetableViewProps> = ({
  student,
  timetable,
  entries,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const dayIndex = new Date().getDay();
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysMap[dayIndex];
    return DAYS.includes(currentDay) ? currentDay : 'Monday';
  });

  if (!student) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
        Please select a child to view timetable.
      </div>
    );
  }

  const isChildDisabled = student.status === 'DISABLED';

  // Filter entries for the selected day and sort by periodNumber or startTime
  const dayEntries = entries
    .filter((e) => e.day.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#001c46]" />
            <h2 className="text-xl font-black text-[#001c46]">Class Schedule & Timetable</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Class: <span className="font-bold text-gray-800">{student.className} — Section {student.section}</span> • Board: {student.board || 'CBSE'}
          </p>
        </div>

        <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold self-start sm:self-auto">
          Academic Schedule 2026-2027
        </div>
      </div>

      {/* Inactive Student Banner */}
      {isChildDisabled && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>This student account is currently inactive. Viewing standard schedule for {student.className}.</span>
        </div>
      )}

      {/* Day Selector Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-[#001c46] text-[#FFC907] shadow-sm scale-102'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Timetable Period Schedule Cards */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider flex items-center gap-2">
            <span>Schedule for {selectedDay}</span>
            <span className="text-xs font-semibold text-gray-400">
              ({dayEntries.length} periods/events)
            </span>
          </h3>
        </div>

        {dayEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-gray-300" />
            <p className="font-medium">No periods scheduled for {selectedDay}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayEntries.map((period, idx) => {
              const isBreak = period.type === 'BREAK';
              const isAssembly = period.type === 'ASSEMBLY';

              return (
                <div
                  key={period.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isBreak
                      ? 'bg-amber-50/50 border-amber-200'
                      : isAssembly
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-gray-50/60 border-gray-200 hover:border-[#001c46]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isBreak
                          ? 'bg-amber-200 text-amber-900'
                          : isAssembly
                          ? 'bg-blue-200 text-blue-900'
                          : 'bg-[#001c46] text-white'
                      }`}
                    >
                      {isBreak ? 'Recess / Break' : isAssembly ? 'Assembly' : `Period ${period.periodNumber || idx + 1}`}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{period.startTime} — {period.endTime}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      {isBreak ? (
                        <Coffee className="w-4 h-4 text-amber-600" />
                      ) : isAssembly ? (
                        <Sun className="w-4 h-4 text-blue-600" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-[#001c46]" />
                      )}
                      <span>{period.subject}</span>
                    </h4>

                    {!isBreak && !isAssembly && (
                      <div className="space-y-1 text-xs text-gray-600 pt-1">
                        {period.teacherName && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-semibold">{period.teacherName}</span>
                          </div>
                        )}
                        {period.room && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>Room: {period.room}</span>
                          </div>
                        )}
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
  );
};
