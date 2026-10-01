import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  MoreVertical,
  SkipForward,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Briefcase,
  GraduationCap,
  Palmtree,
  Home,
  AlertCircle
} from 'lucide-react';
import {
  TimetableTemplate,
  TimetableEvent,
  DateModeMapping,
  TimetableCategory
} from '../../../types';
import { sounds } from '../../../services/soundEffects';

interface TimetableModuleProps {
  templates: TimetableTemplate[];
  events: TimetableEvent[];
  dateModes: DateModeMapping[];
  onSaveTemplates: (templates: TimetableTemplate[]) => void;
  onSaveEvents: (events: TimetableEvent[]) => void;
  onSaveDateModes: (mappings: DateModeMapping[]) => void;
  onAwardXP: (amount: number, description: string, stat: 'discipline' | 'knowledge') => void;
}

export const TimetableModule: React.FC<TimetableModuleProps> = ({
  templates,
  events,
  dateModes,
  onSaveTemplates,
  onSaveEvents,
  onSaveDateModes,
  onAwardXP
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

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
  const [eventXp, setEventXp] = useState(20);

  // Handle switching entire day's mode in 1 click
  const handleSelectModeForDate = (templateId: string) => {
    sounds.playClick();
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
          onAwardXP(e.xpAwarded || 20, `Completed timetable block: ${e.title}`, 'discipline');
        } else {
          sounds.playClick();
        }
        return { ...e, isCompleted: nextCompleted, isSkipped: false };
      }
      return e;
    });
    onSaveEvents(updated);
  };

  const handleSkipEvent = (event: TimetableEvent) => {
    sounds.playClick();
    const updated = events.map(e => {
      if (e.id === event.id) {
        return { ...e, isSkipped: !e.isSkipped, isCompleted: false };
      }
      return e;
    });
    onSaveEvents(updated);
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setEventTitle('');
    setStartTime('10:00');
    setEndTime('11:00');
    setEventCategory(activeTemplate.category);
    setEventNotes('');
    setEventXp(20);
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: TimetableEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setEventCategory(event.category);
    setEventNotes(event.notes || '');
    setEventXp(event.xpAwarded || 20);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    sounds.playClick();
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
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Timetable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">Smart Timetable Engine</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Switch entire days with 1 click. Modifying a template updates all linked days automatically.
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

      {/* Mode Template Switcher Pills */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Apply Schedule Mode to {selectedDate === todayStr ? 'Today' : selectedDate}
          </label>
          <span className="text-[10px] text-cyan-400 font-semibold">
            Active: {activeTemplate.name}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map(tmpl => {
            const isSelected = tmpl.id === activeTemplate.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleSelectModeForDate(tmpl.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
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

      {/* Events Timeline */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {activeTemplate.name} Timeline ({currentEvents.length} Blocks)
            </h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Block
          </button>
        </div>

        {currentEvents.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl border-slate-800 text-slate-400 text-xs">
            <p>No schedule blocks in this mode yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 text-cyan-400 hover:underline font-bold"
            >
              + Create your first schedule block
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentEvents.map(event => (
              <div
                key={event.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-3 ${
                  event.isCompleted
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    : event.isSkipped
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-50'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(event)}
                    className="mt-0.5 sm:mt-0 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
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
                      {event.isSkipped && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                          Skipped
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Clock className="w-3 h-3" />
                        {event.startTime} - {event.endTime}
                      </span>
                      <span className="capitalize text-slate-400">
                        {event.category}
                      </span>
                      {event.notes && (
                        <span className="hidden md:inline italic text-slate-400 truncate max-w-xs">
                          {event.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                  <span className="text-xs font-extrabold px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                    +{event.xpAwarded || 20} XP
                  </span>

                  <button
                    onClick={() => handleSkipEvent(event)}
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    title={event.isSkipped ? 'Unskip' : 'Skip'}
                    aria-label="Skip event"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(event)}
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit block"
                    aria-label="Edit event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete block"
                    aria-label="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">
              {editingEvent ? 'Edit Timetable Block' : `New Block for ${activeTemplate.name}`}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. Physics Lecture, Deep Study Sprint..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={e => setEventCategory(e.target.value as TimetableCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  >
                    <option value="college">College</option>
                    <option value="exam">Exam</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">XP Reward</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={eventXp}
                    onChange={e => setEventXp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Notes / Location</label>
                <input
                  type="text"
                  value={eventNotes}
                  onChange={e => setEventNotes(e.target.value)}
                  placeholder="Optional notes or classroom..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
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
