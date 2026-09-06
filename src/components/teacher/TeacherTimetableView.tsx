import React, { useState, useEffect } from 'react';
import { TimetableEntry } from '../../types/timetable';
import { timetableService } from '../../services/timetableService';
import { Teacher } from '../../types/teacher';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Filter,
  Users
} from 'lucide-react';

interface TeacherTimetableViewProps {
  teacher: Teacher | null;
  assignedClasses: string[];
}

export const TeacherTimetableView: React.FC<TeacherTimetableViewProps> = ({
  teacher,
  assignedClasses,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayIndex = new Date().getDay();
  const defaultDay = todayDayIndex >= 1 && todayDayIndex <= 6 ? days[todayDayIndex - 1] : 'Monday';

  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      // Get entries matching teacher name or teacher ID or assigned classes
      const allEntries = await timetableService.getTimetableEntries();
      
      const teacherName = teacher?.name?.toLowerCase().trim() || '';
      const teacherUid = teacher?.uid || '';
      const teacherId = teacher?.teacherId?.toLowerCase().trim() || '';

      const teacherEntries = allEntries.filter((e) => {
        if (e.teacherId && (e.teacherId === teacherUid || e.teacherId.toLowerCase() === teacherId)) {
          return true;
        }
        if (e.teacherName && e.teacherName.toLowerCase().trim() === teacherName) {
          return true;
        }
        // If entry matches teacher's subject and class
        if (teacher?.subjects && teacher.subjects.includes(e.subject)) {
          if (assignedClasses.length > 0) {
            return assignedClasses.some((ac) => ac.includes(e.className));
          }
        }
        return false;
      });

      setEntries(teacherEntries);
    } catch (err) {
      console.error('Error fetching timetable entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [teacher]);

  const filteredEntries = entries.filter((e) => e.day === selectedDay);
  filteredEntries.sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Day Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#001c46]">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-black">My Personal Faculty Timetable</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Weekly class routine and subject teaching slots assigned to your faculty profile.
            </p>
          </div>

          <span className="px-3.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-extrabold text-xs">
            Today: {days[todayDayIndex >= 1 && todayDayIndex <= 6 ? todayDayIndex - 1 : 0]}
          </span>
        </div>

        {/* Day Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {days.map((day) => {
            const isToday = day === days[todayDayIndex >= 1 && todayDayIndex <= 6 ? todayDayIndex - 1 : 0];
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#001c46] text-[#FFC907] shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-[#FFC907]"></span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Schedule Entries View */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#001c46] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Syncing schedule timetable...</p>
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-gray-50/90 border border-gray-200 space-y-3 hover:border-blue-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full font-black bg-[#001c46] text-[#FFC907] text-[11px]">
                    Period {entry.periodNumber}
                  </span>
                  <span className="font-mono text-gray-600 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {entry.startTime} - {entry.endTime}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-[#001c46] text-base">{entry.subject}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      Class {entry.className} ({entry.section})
                    </span>
                    {entry.room && (
                      <span className="flex items-center gap-1 text-gray-500 font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        Room {entry.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-extrabold text-gray-800">No Scheduled Periods on {selectedDay}</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are no class teaching slots scheduled for your profile on {selectedDay}. Select another day from the bar above.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
