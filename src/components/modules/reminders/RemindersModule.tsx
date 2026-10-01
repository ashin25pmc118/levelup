import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  BellRing,
  RotateCw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Reminder } from '../../../types';
import { sounds } from '../../../services/soundEffects';

interface RemindersModuleProps {
  reminders: Reminder[];
  onSaveReminders: (reminders: Reminder[]) => void;
  onAwardXP: (amount: number, description: string, stat: 'discipline') => void;
}

export const RemindersModule: React.FC<RemindersModuleProps> = ({
  reminders,
  onSaveReminders,
  onAwardXP
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [recurringType, setRecurringType] = useState<'none' | 'daily' | 'weekly'>('none');
  const [notes, setNotes] = useState('');

  const handleToggleComplete = (rem: Reminder) => {
    const updated = reminders.map(r => {
      if (r.id === rem.id) {
        const nextCompleted = !r.isCompleted;
        if (nextCompleted) {
          sounds.playQuestComplete();
          onAwardXP(15, `Completed reminder: ${r.title}`, 'discipline');
        } else {
          sounds.playClick();
        }
        return { ...r, isCompleted: nextCompleted };
      }
      return r;
    });
    onSaveReminders(updated);
  };

  const handleDelete = (id: string) => {
    sounds.playClick();
    onSaveReminders(reminders.filter(r => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder: Reminder = {
      id: `rem_${Date.now()}`,
      title: title.trim(),
      dueDate,
      dueTime,
      recurringType,
      isCompleted: false,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    sounds.playClick();
    onSaveReminders([newReminder, ...reminders]);
    setIsModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const requestNotificationPermission = async () => {
    sounds.playClick();
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Level Up — Better Me', {
          body: 'System notifications activated. You will receive quest & reminder prompts.',
          icon: '/favicon.ico'
        });
      }
    } else {
      alert('Browser notifications not supported on this browser.');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Bell className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-white">System Reminders & Habit Signals</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Reliable alerts for hydration, reviews, bedtime, and timetable events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5" /> Enable Browser Alerts
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Reminder
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Active Reminders ({reminders.length})
        </h3>

        {reminders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active reminders.</p>
        ) : (
          <div className="space-y-2.5">
            {reminders.map(rem => (
              <div
                key={rem.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  rem.isCompleted
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-500/30 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(rem)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {rem.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <span
                      className={`text-xs font-bold ${
                        rem.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {rem.title}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Clock className="w-3 h-3" /> {rem.dueTime}
                      </span>
                      <span>{rem.dueDate}</span>
                      {rem.recurringType !== 'none' && (
                        <span className="flex items-center gap-1 text-purple-400 capitalize">
                          <RotateCw className="w-2.5 h-2.5" /> {rem.recurringType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                    +15 XP
                  </span>
                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-3">Create System Reminder</h3>

            <form onSubmit={handleAddReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Reminder</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drink water, Prep tomorrow's study books..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Recurrence</label>
                <select
                  value={recurringType}
                  onChange={e => setRecurringType(e.target.value as typeof recurringType)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="none">One-time only</option>
                  <option value="daily">Repeat Every Day</option>
                  <option value="weekly">Repeat Every Week</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
