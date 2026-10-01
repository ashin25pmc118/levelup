import React, { useState, useMemo } from 'react';
import { Flame, Calendar, Sparkles } from 'lucide-react';
import { XPTransaction } from '../../types';

interface ConsistencyHeatmapProps {
  transactions: XPTransaction[];
  currentStreak?: number;
}

interface DayData {
  dateStr: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  xp: number;
  count: number;
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  transactions,
  currentStreak = 0
}) => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Group XP by YYYY-MM-DD
  const xpByDate = useMemo(() => {
    const map = new Map<string, { xp: number; count: number }>();
    for (const tx of transactions) {
      const d = tx.timestamp.split('T')[0];
      const existing = map.get(d) || { xp: 0, count: 0 };
      existing.xp += tx.amount;
      existing.count += 1;
      map.set(d, existing);
    }
    return map;
  }, [transactions]);

  // Generate 52 weeks (364 days) leading up to today
  const { weeks, totalActiveDays, maxDailyXp, totalYearXp } = useMemo(() => {
    const today = new Date();
    const days: DayData[] = [];

    let totalActive = 0;
    let maxXp = 0;
    let totalXp = 0;

    // Build 364 days backwards to today
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const record = xpByDate.get(dateStr);
      const xp = record ? record.xp : 0;
      const count = record ? record.count : 0;

      if (xp > 0) {
        totalActive += 1;
        totalXp += xp;
        if (xp > maxXp) maxXp = xp;
      }

      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      days.push({
        dateStr,
        dayOfWeek: d.getDay(),
        xp,
        count
      });
    }

    // Group into 52 columns of 7 days (aligning Monday-Sunday)
    // To keep layout uniform, group into 52 columns of 7 cells
    const cols: DayData[][] = [];
    let currentCol: DayData[] = [];

    // Adjust leading offset so row 0 is Monday
    for (const day of days) {
      currentCol.push(day);
      if (currentCol.length === 7) {
        cols.push(currentCol);
        currentCol = [];
      }
    }
    if (currentCol.length > 0) {
      cols.push(currentCol);
    }

    return {
      weeks: cols,
      totalActiveDays: totalActive,
      maxDailyXp: maxXp,
      totalYearXp: totalXp
    };
  }, [xpByDate]);

  const getColorClass = (xp: number) => {
    if (xp === 0) return 'bg-slate-900/90 border-slate-800/60 hover:border-slate-600';
    if (xp <= 50) return 'bg-cyan-950 border-cyan-800/50 hover:border-cyan-400';
    if (xp <= 150) return 'bg-cyan-700 border-cyan-500/60 hover:border-cyan-300';
    if (xp <= 250) return 'bg-cyan-500 border-cyan-300 hover:border-white shadow-sm shadow-cyan-500/40';
    return 'bg-emerald-400 border-emerald-200 hover:border-white shadow-sm shadow-emerald-400/60';
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl space-y-4">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              365-Day Consistency Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every active day banks discipline and shapes your character radar.
          </p>
        </div>

        {/* Quick metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span className="font-extrabold text-white">{currentStreak}</span>
            <span className="text-slate-400 text-[11px]">streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-cyan-400 font-extrabold">{totalActiveDays}</span>
            <span className="text-slate-400 text-[11px]">active days</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-extrabold text-white">+{totalYearXp.toLocaleString()}</span>
            <span className="text-slate-400 text-[11px]">XP</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[680px]">
          {/* Weekday indicators & columns */}
          <div className="flex gap-1.5 items-start">
            <div className="flex flex-col justify-between text-[9px] font-bold text-slate-500 pr-1 h-[88px] select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map(day => (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setSelectedDay(day)}
                      className={`w-3 h-3 rounded-[3px] border transition-all cursor-pointer ${getColorClass(
                        day.xp
                      )} ${selectedDay?.dateStr === day.dateStr ? 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-950' : ''}`}
                      title={`${formatDate(day.dateStr)}: ${day.xp} XP (${day.count} activities)`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
        <div className="min-h-[20px] font-medium">
          {selectedDay ? (
            <span className="text-slate-200">
              <strong className="text-cyan-400 font-bold">{formatDate(selectedDay.dateStr)}:</strong>{' '}
              {selectedDay.xp > 0 ? (
                <>
                  <span className="font-extrabold text-white">+{selectedDay.xp} XP</span> earned across{' '}
                  <span className="text-slate-300 font-bold">{selectedDay.count} activities</span>
                </>
              ) : (
                'No recorded activities on this day'
              )}
            </span>
          ) : (
            <span>Hover or tap any square to inspect details</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto select-none text-[10px]">
          <span className="text-slate-500">Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-cyan-950 border border-cyan-800/50" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-cyan-700 border border-cyan-500/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-cyan-500 border border-cyan-300" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-200" />
          <span className="text-slate-500">More</span>
        </div>
      </div>
    </div>
  );
};
