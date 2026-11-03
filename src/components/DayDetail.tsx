'use client';

import { useEffect } from 'react';
import { CheckIcon, XIcon } from '@primer/octicons-react';
import { Habit } from '@/types/habit';
import { formatDate, parseDate } from '@/lib/utils';
import { getHabitColor } from '@/lib/habit-colors';

interface DayDetailProps {
  date: string;
  habits: { habit: Habit; completed: boolean }[];
  onToggle: (habitId: string, date: string) => void;
  onClose: () => void;
}

export function DayDetail({ date, habits, onToggle, onClose }: DayDetailProps) {
  const formattedDate = parseDate(date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFuture = date > formatDate(new Date());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-detail-title"
        className="max-h-[85vh] w-full overflow-hidden rounded-t-xl border border-line bg-canvas-subtle shadow-2xl shadow-black/50 sm:max-w-md sm:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 id="day-detail-title" className="font-semibold text-fg first-letter:uppercase">{formattedDate}</h2>
            <p className="mt-0.5 text-sm text-fg-muted">
              {totalCount > 0
                ? <><span className="font-mono">{completedCount}/{totalCount}</span> wykonanych ({percentage}%)</>
                : 'Brak nawyków w tym dniu'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-md p-1.5 text-fg-muted hover:bg-canvas-overlay hover:text-fg"
          >
            <XIcon size={16} />
          </button>
        </div>

        {totalCount > 0 && (
          <div className="h-1 bg-canvas-overlay">
            <div className="h-full bg-success-emphasis transition-all duration-300" style={{ width: `${percentage}%` }} />
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto">
          {habits.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-fg-muted">
              Żaden nawyk nie istniał jeszcze tego dnia.
            </p>
          ) : (
            <ul>
              {habits.map(({ habit, completed }) => (
                <li key={habit.id} className="border-b border-line-muted last:border-b-0">
                  <button
                    onClick={() => onToggle(habit.id, date)}
                    disabled={isFuture}
                    aria-pressed={completed}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas-overlay/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                        completed ? 'border-success-emphasis bg-success-emphasis text-white' : 'border-line'
                      }`}
                    >
                      {completed && <CheckIcon size={14} />}
                    </span>
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: getHabitColor(habit) }} />
                    <span className={`flex-1 truncate ${completed ? 'text-fg' : 'text-fg-default'}`}>{habit.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isFuture && (
            <p className="border-t border-line-muted px-4 py-3 text-center text-xs text-fg-muted">
              Nie można oznaczać nawyków w przyszłości
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
