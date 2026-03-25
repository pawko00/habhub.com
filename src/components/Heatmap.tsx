'use client';

import { useMemo } from 'react';
import { DayStats } from '@/types/habit';
import { 
  getLast365Days, 
  getWeeksArray, 
  formatDate
} from '@/lib/utils';

// GitHub contribution graph colors
const CONTRIB_COLORS = {
  0: '#21262d',  // Slightly lighter than section background for visibility
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

function getContribColor(percentage: number): string {
  if (percentage === 0) return CONTRIB_COLORS[0];
  if (percentage <= 25) return CONTRIB_COLORS[1];
  if (percentage <= 50) return CONTRIB_COLORS[2];
  if (percentage <= 75) return CONTRIB_COLORS[3];
  return CONTRIB_COLORS[4];
}

interface GlobalHeatmapProps {
  dayStats: Map<string, DayStats>;
  onDayClick: (date: string) => void;
  selectedDate?: string | null;
}

export function GlobalHeatmap({ dayStats, onDayClick, selectedDate }: GlobalHeatmapProps) {
  const dates = useMemo(() => getLast365Days(), []);
  const weeks = useMemo(() => getWeeksArray(dates), [dates]);

  const dayLabels = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

  // Create month labels positioned correctly above each week
  const monthLabelsMap = useMemo(() => {
    const map = new Map<number, string>();
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDate = week.find(d => d !== '');
      if (firstValidDate) {
        const date = new Date(firstValidDate + 'T00:00:00');
        const month = date.getMonth();
        
        if (month !== lastMonth) {
          map.set(weekIndex, monthNames[month]);
          lastMonth = month;
        }
      }
    });
    
    return map;
  }, [weeks]);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-max">
        {/* Month labels - positioned above grid */}
        <div className="flex mb-2 ml-8 text-xs" style={{ color: '#8b949e' }}>
          {weeks.map((_, weekIdx) => (
            <div 
              key={weekIdx} 
              style={{ width: '11px', marginRight: '3px', flexShrink: 0 }}
            >
              {monthLabelsMap.get(weekIdx) || ''}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2 text-xs" style={{ color: '#8b949e', gap: '3px' }}>
            {dayLabels.map((day, idx) => (
              <div 
                key={day} 
                className="h-[11px] leading-[11px]"
                style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex" style={{ gap: '3px' }}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col" style={{ gap: '3px' }}>
                {week.map((date, dayIdx) => {
                  if (!date) {
                    return <div key={dayIdx} className="w-[11px] h-[11px]" />;
                  }

                  const stats = dayStats.get(date);
                  const percentage = stats?.percentage || 0;
                  const bgColor = getContribColor(percentage);
                  const isSelected = selectedDate === date;
                  const isToday = date === formatDate(new Date());

                  return (
                    <button
                      key={date}
                      onClick={() => onDayClick(date)}
                      className="w-[11px] h-[11px] rounded-[2px] transition-all"
                      style={{
                        backgroundColor: bgColor,
                        outline: isSelected ? '2px solid #58a6ff' : isToday ? '1px solid #8b949e' : '1px solid rgba(27, 31, 35, 0.5)',
                        outlineOffset: '-1px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.outline = '2px solid #58a6ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.outline = isSelected ? '2px solid #58a6ff' : isToday ? '1px solid #8b949e' : '1px solid rgba(27, 31, 35, 0.5)';
                      }}
                      title={`${date}: ${stats?.completed || 0}/${stats?.total || 0} (${percentage}%)`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: '#8b949e' }}>
          <span>Mniej</span>
          <div className="flex" style={{ gap: '3px' }}>
            {Object.values(CONTRIB_COLORS).map((color, idx) => (
              <div 
                key={idx}
                className="w-[11px] h-[11px] rounded-[2px]" 
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>Więcej</span>
        </div>
      </div>
    </div>
  );
}

interface HabitHeatmapProps {
  completedDates: string[];
  onDayClick: (date: string) => void;
  createdAt: string;
}

export function HabitHeatmap({ completedDates, onDayClick, createdAt }: HabitHeatmapProps) {
  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);
  const dates = useMemo(() => getLast365Days(), []);
  const weeks = useMemo(() => getWeeksArray(dates), [dates]);

  const dayLabels = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

  // Create month labels positioned correctly above each week
  const monthLabelsMap = useMemo(() => {
    const map = new Map<number, string>();
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDate = week.find(d => d !== '');
      if (firstValidDate) {
        const date = new Date(firstValidDate + 'T00:00:00');
        const month = date.getMonth();
        
        if (month !== lastMonth) {
          map.set(weekIndex, monthNames[month]);
          lastMonth = month;
        }
      }
    });
    
    return map;
  }, [weeks]);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-max">
        {/* Month labels - positioned above grid */}
        <div className="flex mb-2 ml-8 text-xs" style={{ color: '#8b949e' }}>
          {weeks.map((_, weekIdx) => (
            <div 
              key={weekIdx} 
              style={{ width: '11px', marginRight: '3px', flexShrink: 0 }}
            >
              {monthLabelsMap.get(weekIdx) || ''}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2 text-xs" style={{ color: '#8b949e', gap: '3px' }}>
            {dayLabels.map((day, idx) => (
              <div 
                key={day} 
                className="h-[11px] leading-[11px]"
                style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex" style={{ gap: '3px' }}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col" style={{ gap: '3px' }}>
                {week.map((date, dayIdx) => {
                  if (!date) {
                    return <div key={dayIdx} className="w-[11px] h-[11px]" />;
                  }

                  const isBeforeCreation = date < createdAt;
                  const isFuture = date > formatDate(new Date());
                  const isCompleted = completedSet.has(date);
                  const isToday = date === formatDate(new Date());
                  
                  const bgColor = isBeforeCreation || isFuture
                    ? '#0d1117'
                    : isCompleted ? CONTRIB_COLORS[4] : CONTRIB_COLORS[0];

                  return (
                    <button
                      key={date}
                      onClick={() => !isBeforeCreation && !isFuture && onDayClick(date)}
                      disabled={isBeforeCreation || isFuture}
                      className="w-[11px] h-[11px] rounded-[2px] transition-all"
                      style={{
                        backgroundColor: bgColor,
                        opacity: isBeforeCreation || isFuture ? 0.3 : 1,
                        outline: isToday ? '1px solid #8b949e' : 'none',
                        cursor: isBeforeCreation || isFuture ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isBeforeCreation && !isFuture) {
                          e.currentTarget.style.outline = '2px solid #58a6ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.outline = isToday ? '1px solid #8b949e' : 'none';
                      }}
                      title={
                        isBeforeCreation ? 'Przed utworzeniem nawyku' 
                        : isFuture ? 'Przyszły dzień'
                        : `${date}: ${isCompleted ? 'Wykonano' : 'Niewykonano'}`
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: '#8b949e' }}>
          <div className="flex items-center gap-1">
            <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: CONTRIB_COLORS[0] }} />
            <span>Niewykonano</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: CONTRIB_COLORS[4] }} />
            <span>Wykonano</span>
          </div>
        </div>
      </div>
    </div>
  );
}
