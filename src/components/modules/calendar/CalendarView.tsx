import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Brain,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  TimetableEvent,
  WorkoutLog,
  FocusSession,
  ConfidenceQuest,
  Note,
  Reminder
} from '../../../types';
import { sounds } from '../../../services/soundEffects';

interface CalendarViewProps {
  events: TimetableEvent[];
  workoutLogs: WorkoutLog[];
  focusSessions: FocusSession[];
  confidenceQuests: ConfidenceQuest[];
  notes: Note[];
  reminders: Reminder[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  workoutLogs,
  focusSessions,
  confidenceQuests,
  notes,
  reminders
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    sounds.playClick();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    sounds.playClick();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Activities on selected date
  const dayWorkouts = workoutLogs.filter(w => w.date === selectedDate);
  const dayFocus = focusSessions.filter(f => f.date === selectedDate);
  const dayReminders = reminders.filter(r => r.dueDate === selectedDate);
  const dayNotes = notes.filter(n => n.createdAt.startsWith(selectedDate));

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-500/30">
              <CalendarDays className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Daily Archive & Calendar</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Select any day on the calendar to inspect historical timetable events, workouts, and focus sessions.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white min-w-28 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Calendar Grid */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/30 opacity-20" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              // Check if activities exist on this date
              const hasWorkout = workoutLogs.some(w => w.date === dateStr);
              const hasFocus = focusSessions.some(f => f.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDate(dateStr);
                  }}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-sm shadow-cyan-500/20'
                      : isToday
                      ? 'border-slate-700 bg-slate-800/80'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-cyan-300' : isToday ? 'text-white font-black' : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" />
                    )}
                  </div>

                  {/* Indicator dots */}
                  <div className="flex gap-1 mt-auto">
                    {hasWorkout && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                    {hasFocus && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 span): Day Activity Inspector */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              Day Record
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{selectedDate}</h3>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {/* Workouts */}
            <div>
              <h5 className="text-xs font-bold text-orange-400 flex items-center gap-1 mb-1.5">
                <Dumbbell className="w-3 h-3" /> Workouts Logged ({dayWorkouts.length})
              </h5>
              {dayWorkouts.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No workouts on this date.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayWorkouts.map(w => (
                    <div key={w.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                      <span className="font-bold text-white">{w.exerciseName}</span>
                      <p className="text-slate-400">{w.sets.length} sets completed · +{w.xpEarned} XP</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Focus Sessions */}
            <div className="pt-2 border-t border-slate-800/80">
              <h5 className="text-xs font-bold text-purple-400 flex items-center gap-1 mb-1.5">
                <Brain className="w-3 h-3" /> Focus Sessions ({dayFocus.length})
              </h5>
              {dayFocus.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No focus sessions logged.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayFocus.map(f => (
                    <div key={f.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                      <span className="font-bold text-white">{f.durationMinutes}m {f.type}</span>
                      <p className="text-slate-400">{f.distractionsCount} distractions · +{f.xpEarned} XP</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reminders */}
            <div className="pt-2 border-t border-slate-800/80">
              <h5 className="text-xs font-bold text-cyan-400 flex items-center gap-1 mb-1.5">
                <Clock className="w-3 h-3" /> Reminders ({dayReminders.length})
              </h5>
              {dayReminders.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No reminders scheduled.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayReminders.map(r => (
                    <div key={r.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                      <span className="font-bold text-white">{r.title}</span>
                      <p className="text-slate-400">{r.dueTime} · {r.isCompleted ? 'Done' : 'Pending'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
