import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  SkipForward,
  Edit2,
  Trash2,
  Sparkles,
  Zap,
  Dumbbell,
  Brain,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  TimetableTemplate,
  TimetableEvent,
  DateModeMapping,
  TimetableCategory
} from '../../../types';
import { sounds } from '../../../services/soundEffects';
import { haptics } from '../../../services/hapticFeedback';

interface TimetableModuleProps {
  templates: TimetableTemplate[];
  events: TimetableEvent[];
  dateModes: DateModeMapping[];
  onSaveTemplates: (templates: TimetableTemplate[]) => void;
  onSaveEvents: (events: TimetableEvent[]) => void;
  onSaveDateModes: (mappings: DateModeMapping[]) => void;
  onAwardXP: (amount: number, description: string, stat: 'discipline' | 'knowledge') => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

// Convert "HH:mm" to total minutes from midnight
const toMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Format minutes into clean human-readable hours & minutes
const formatMinutes = (totalMins: number): string => {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Calculate suggested XP based on block duration
const calculateSuggestedXp = (start: string, end: string): number => {
  const durationMins = Math.max(15, toMinutes(end) - toMinutes(start));
  if (durationMins <= 30) return 15;
  if (durationMins <= 60) return 30;
  if (durationMins <= 90) return 45;
  return 60;
};

export const TimetableModule: React.FC<TimetableModuleProps> = ({
  templates,
  events,
  dateModes,
  onSaveTemplates,
  onSaveEvents,
  onSaveDateModes,
  onAwardXP,
  onNavigate
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const isToday = selectedDate === todayStr;

  // Real-time device clock (updated every 15s)
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter state (all | pending | completed)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Find active template for the selected date
  const dateMapping = dateModes.find(m => m.date === selectedDate);
  const defaultTemplate = templates.find(t => t.isDefault) || templates[0];
  const activeTemplateId = dateMapping ? dateMapping.templateId : defaultTemplate.id;
  const activeTemplate = templates.find(t => t.id === activeTemplateId) || defaultTemplate;

  // Filter events belonging to active template
  const currentEvents = events
    .filter(e => e.templateId === activeTemplate.id)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Modal states for creating/editing event
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<TimetableCategory>('college');
  const [eventNotes, setEventNotes] = useState('');
  const [eventXp, setEventXp] = useState(30);

  // Auto-adjust suggested XP when time changes
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setEventXp(calculateSuggestedXp(newStart, endTime));
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    setEventXp(calculateSuggestedXp(startTime, newEnd));
  };

  // Handle switching entire day's mode in 1 click
  const handleSelectModeForDate = (templateId: string) => {
    sounds.playClick();
    haptics.light();
    const existing = dateModes.filter(m => m.date !== selectedDate);
    const updated = [...existing, { date: selectedDate, templateId }];
    onSaveDateModes(updated);
  };

  const handleToggleComplete = (event: TimetableEvent) => {
    const updated = events.map(e => {
      if (e.id === event.id) {
        const nextCompleted = !e.isCompleted;
        if (nextCompleted) {
          sounds.playQuestComplete();
          haptics.medium();
          onAwardXP(e.xpAwarded || 30, `Completed timetable block: ${e.title}`, 'discipline');
        } else {
          sounds.playClick();
          haptics.light();
        }
        return { ...e, isCompleted: nextCompleted, isSkipped: false };
      }
      return e;
    });
    onSaveEvents(updated);
  };

  const handleSkipEvent = (event: TimetableEvent) => {
    sounds.playClick();
    haptics.light();
    const updated = events.map(e => {
      if (e.id === event.id) {
        return { ...e, isSkipped: !e.isSkipped, isCompleted: false };
      }
      return e;
    });
    onSaveEvents(updated);
  };

  const handleOpenAddModal = () => {
    sounds.playClick();
    setEditingEvent(null);
    setEventTitle('');
    setStartTime('10:00');
    setEndTime('11:00');
    setEventCategory(activeTemplate.category);
    setEventNotes('');
    setEventXp(30);
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: TimetableEvent) => {
    sounds.playClick();
    setEditingEvent(event);
    setEventTitle(event.title);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setEventCategory(event.category);
    setEventNotes(event.notes || '');
    setEventXp(event.xpAwarded || calculateSuggestedXp(event.startTime, event.endTime));
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    sounds.playClick();
    haptics.light();
    const updated = events.filter(e => e.id !== eventId);
    onSaveEvents(updated);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEvent) {
      const updated = events.map(ev => {
        if (ev.id === editingEvent.id) {
          return {
            ...ev,
            title: eventTitle.trim(),
            startTime,
            endTime,
            category: eventCategory,
            notes: eventNotes.trim(),
            xpAwarded: eventXp
          };
        }
        return ev;
      });
      onSaveEvents(updated);
    } else {
      const newEvent: TimetableEvent = {
        id: `evt_${Date.now()}`,
        templateId: activeTemplate.id,
        startTime,
        endTime,
        title: eventTitle.trim(),
        category: eventCategory,
        color: activeTemplate.color,
        icon: 'Clock',
        notes: eventNotes.trim(),
        xpAwarded: eventXp,
        isCompleted: false
      };
      onSaveEvents([...events, newEvent]);
    }

    sounds.playClick();
    haptics.medium();
    setIsEventModalOpen(false);
  };

  // ==========================================
  // REAL-TIME COMPUTATIONS: "MORE THAN XP"
  // ==========================================
  const nowMins = toMinutes(currentTime);

  // Active event happening right now
  const activeEvent = isToday
    ? currentEvents.find(e => toMinutes(e.startTime) <= nowMins && nowMins < toMinutes(e.endTime))
    : null;

  // Next upcoming event
  const upcomingEvent = isToday
    ? currentEvents.find(e => toMinutes(e.startTime) > nowMins && !e.isCompleted && !e.isSkipped)
    : null;

  // Calculations for active event progress
  const activeDuration = activeEvent ? Math.max(1, toMinutes(activeEvent.endTime) - toMinutes(activeEvent.startTime)) : 0;
  const activeElapsed = activeEvent ? Math.max(0, nowMins - toMinutes(activeEvent.startTime)) : 0;
  const activeRemaining = activeEvent ? Math.max(0, toMinutes(activeEvent.endTime) - nowMins) : 0;
  const activeProgress = activeEvent ? Math.min(100, Math.round((activeElapsed / activeDuration) * 100)) : 0;

  // Schedule Time Analytics
  const totalPlannedMinutes = currentEvents.reduce((acc, e) => acc + Math.max(0, toMinutes(e.endTime) - toMinutes(e.startTime)), 0);
  const totalCompletedMinutes = currentEvents
    .filter(e => e.isCompleted)
    .reduce((acc, e) => acc + Math.max(0, toMinutes(e.endTime) - toMinutes(e.startTime)), 0);
  const adherenceRate = totalPlannedMinutes > 0 ? Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100) : 0;

  // Filtered events
  const displayedEvents = currentEvents.filter(e => {
    if (statusFilter === 'pending') return !e.isCompleted && !e.isSkipped;
    if (statusFilter === 'completed') return e.isCompleted;
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Timetable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Smart Timetable & Time Budget</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time block tracker, schedule adherence analytics, and dynamic time-to-XP scaling.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-cyan-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs font-bold bg-transparent text-white focus:outline-none"
          />
        </div>
      </div>

      {/* ⚡ REAL-TIME "HAPPENING NOW" ACTIVE BLOCK TRACKER (MORE THAN XP) */}
      {isToday && activeEvent && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-2 border-cyan-500/50 shadow-xl shadow-cyan-950/30 animate-in fade-in space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                ACTIVE RIGHT NOW • {activeEvent.startTime} - {activeEvent.endTime}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeRemaining} mins remaining</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                {activeEvent.title}
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  {activeEvent.category}
                </span>
              </h3>
              {activeEvent.notes && (
                <p className="text-xs text-slate-400 mt-0.5">{activeEvent.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Contextual 1-Tap Connected Tool Actions */}
              {onNavigate && (activeEvent.category === 'college' || activeEvent.title.toLowerCase().includes('study') || activeEvent.title.toLowerCase().includes('code')) && (
                <button
                  onClick={() => onNavigate('focus')}
                  className="px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Start Pomodoro</span>
                </button>
              )}

              {onNavigate && (activeEvent.category === 'personal' || activeEvent.title.toLowerCase().includes('workout') || activeEvent.title.toLowerCase().includes('gym') || activeEvent.title.toLowerCase().includes('run')) && (
                <button
                  onClick={() => onNavigate('train', 'today')}
                  className="px-3.5 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Launch Workout</span>
                </button>
              )}

              <button
                onClick={() => handleToggleComplete(activeEvent)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  activeEvent.isCompleted
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{activeEvent.isCompleted ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>
          </div>

          {/* Block Live Elapsed Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{activeElapsed}m elapsed</span>
              <span>{activeProgress}% complete</span>
              <span>{formatMinutes(activeDuration)} total</span>
            </div>
          </div>
        </div>
      )}

      {/* Heads-up banner if no active block, but upcoming block exists */}
      {isToday && !activeEvent && upcomingEvent && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Next Up:</strong> {upcomingEvent.title} at {upcomingEvent.startTime} (in {toMinutes(upcomingEvent.startTime) - nowMins} mins)
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
            +{upcomingEvent.xpAwarded || 30} XP
          </span>
        </div>
      )}

      {/* 📊 TIME BUDGET & SCHEDULE ADHERENCE ANALYTICS (MORE THAN XP) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Planned Schedule
          </span>
          <span className="text-xl font-black text-white">{formatMinutes(totalPlannedMinutes)}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{currentEvents.length} blocks total</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Executed Focus
          </span>
          <span className="text-xl font-black text-emerald-400">{formatMinutes(totalCompletedMinutes)}</span>
          <span className="text-[10px] text-emerald-500/80 block mt-0.5">
            {currentEvents.filter(e => e.isCompleted).length} blocks finished
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Discipline Adherence
          </span>
          <span className="text-xl font-black text-cyan-400">{adherenceRate}%</span>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Discipline XP Bank
          </span>
          <span className="text-xl font-black text-amber-400">
            +{currentEvents.filter(e => e.isCompleted).reduce((acc, e) => acc + (e.xpAwarded || 30), 0)} XP
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            of +{currentEvents.reduce((acc, e) => acc + (e.xpAwarded || 30), 0)} XP potential
          </span>
        </div>
      </div>

      {/* Mode Template Switcher Pills */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Schedule Mode for {selectedDate === todayStr ? 'Today' : selectedDate}
          </label>
          <span className="text-[10px] text-cyan-400 font-semibold">
            Active Mode: {activeTemplate.name}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map(tmpl => {
            const isSelected = tmpl.id === activeTemplate.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleSelectModeForDate(tmpl.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{tmpl.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Timeline with Filter Controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {activeTemplate.name} Schedule ({currentEvents.length} Blocks)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                All ({currentEvents.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Pending ({currentEvents.filter(e => !e.isCompleted && !e.isSkipped).length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Done ({currentEvents.filter(e => e.isCompleted).length})
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Block
            </button>
          </div>
        </div>

        {displayedEvents.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl border-slate-800 text-slate-400 text-xs">
            <p>No schedule blocks match this view.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 text-cyan-400 hover:underline font-bold cursor-pointer"
            >
              + Create your schedule block
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedEvents.map(event => {
              const durationMins = Math.max(15, toMinutes(event.endTime) - toMinutes(event.startTime));
              const isCurrentlyActive = isToday && toMinutes(event.startTime) <= nowMins && nowMins < toMinutes(event.endTime);

              return (
                <div
                  key={event.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                    isCurrentlyActive
                      ? 'bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border-cyan-400/60 shadow-md ring-1 ring-cyan-500/30'
                      : event.isCompleted
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                      : event.isSkipped
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-50'
                      : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(event)}
                      className="mt-0.5 sm:mt-0 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      aria-label={event.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {event.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            event.isCompleted
                              ? 'line-through text-slate-400'
                              : event.isSkipped
                              ? 'line-through text-slate-500'
                              : 'text-white'
                          }`}
                        >
                          {event.title}
                        </span>
                        {isCurrentlyActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black uppercase tracking-wider animate-pulse">
                            Active
                          </span>
                        )}
                        {event.isSkipped && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                            Skipped
                          </span>
                        )}
                      </div>

                      <div className="flex items-center flex-wrap gap-2.5 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-cyan-400 font-semibold">
                          <Clock className="w-3 h-3" />
                          {event.startTime} - {event.endTime} ({formatMinutes(durationMins)})
                        </span>
                        <span className="capitalize text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px]">
                          {event.category}
                        </span>
                        {event.notes && (
                          <span className="italic text-slate-400 truncate max-w-xs">
                            • {event.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                    {/* Contextual Action: Jump to Focus or Workout */}
                    {onNavigate && !event.isCompleted && (event.category === 'college' || event.title.toLowerCase().includes('study') || event.title.toLowerCase().includes('code')) && (
                      <button
                        onClick={() => onNavigate('focus')}
                        className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Open Mind & Focus Pomodoro for this study block"
                      >
                        <Brain className="w-3 h-3 text-purple-400" />
                        <span>Focus</span>
                      </button>
                    )}

                    {onNavigate && !event.isCompleted && (event.category === 'personal' || event.title.toLowerCase().includes('workout') || event.title.toLowerCase().includes('gym')) && (
                      <button
                        onClick={() => onNavigate('train', 'today')}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Open Workout session"
                      >
                        <Dumbbell className="w-3 h-3 text-amber-400" />
                        <span>Workout</span>
                      </button>
                    )}

                    <span className="text-xs font-extrabold px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                      +{event.xpAwarded || calculateSuggestedXp(event.startTime, event.endTime)} XP
                    </span>

                    <button
                      onClick={() => handleSkipEvent(event)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={event.isSkipped ? 'Unskip' : 'Skip'}
                      aria-label="Skip event"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(event)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit block"
                      aria-label="Edit event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete block"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingEvent ? 'Edit Schedule Block' : `New Schedule Block (${activeTemplate.name})`}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. Data Structures Lecture, Deep Coding Sprint..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => handleStartTimeChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => handleEndTimeChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={e => setEventCategory(e.target.value as TimetableCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  >
                    <option value="college">College</option>
                    <option value="exam">Exam</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    XP Reward ({formatMinutes(Math.max(15, toMinutes(endTime) - toMinutes(startTime)))})
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={eventXp}
                    onChange={e => setEventXp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Notes / Location (Optional)</label>
                <input
                  type="text"
                  value={eventNotes}
                  onChange={e => setEventNotes(e.target.value)}
                  placeholder="Classroom, chapter or objectives..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
                >
                  Save Schedule Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
