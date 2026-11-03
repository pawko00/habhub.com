'use client';

import Link from 'next/link';
import { Habit } from '@/types/habit';
import { calculateStreak, formatDate, parseDate } from '@/lib/utils';

interface HabitListProps {
  habits: Habit[];
  completions: { habitId: string; date: string }[];
  onRemove: (habitId: string) => void;
  onToggleToday: (habitId: string) => void;
}

export function HabitList({ habits, completions, onRemove, onToggleToday }: HabitListProps) {
  const today = formatDate(new Date());

  if (habits.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: '#8b949e' }}>
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-lg">Brak nawyków</p>
        <p className="text-sm mt-1">Dodaj swój pierwszy nawyk, aby rozpocząć śledzenie!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit) => {
        const habitCompletions = completions
          .filter(c => c.habitId === habit.id)
          .map(c => c.date);
        const streak = calculateStreak(habitCompletions);
        const isCompletedToday = habitCompletions.includes(today);

        return (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-4 rounded-md transition-colors"
            style={{ 
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b949e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#30363d';
            }}
          >
            {/* Today's checkbox */}
            <button
              onClick={() => onToggleToday(habit.id)}
              className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
              style={{
                backgroundColor: isCompletedToday ? '#238636' : 'transparent',
                border: isCompletedToday ? '2px solid #238636' : '2px solid #30363d',
              }}
              title={isCompletedToday ? 'Odznacz na dziś' : 'Oznacz na dziś'}
              aria-label={isCompletedToday ? `Odznacz "${habit.name}" na dziś` : `Oznacz "${habit.name}" na dziś`}
              aria-pressed={isCompletedToday}
            >
              {isCompletedToday && (
                <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Habit info */}
            <Link 
              href={`/habit/${habit.id}`}
              className="flex-1 flex items-center gap-3 min-w-0"
            >
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-medium truncate"
                  style={{ color: '#e6edf3' }}
                >
                  {habit.name}
                </h3>
                <p className="text-sm" style={{ color: '#8b949e' }}>
                  od {parseDate(habit.createdAt).toLocaleDateString('pl-PL')}
                </p>
              </div>
              
              {/* Streak badge */}
              {streak > 0 && (
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: 'rgba(187, 128, 9, 0.15)',
                    color: '#d29922',
                  }}
                >
                  <span>🔥</span>
                  <span>{streak}</span>
                </div>
              )}

              {/* Arrow icon */}
              <svg 
                className="w-4 h-4 flex-shrink-0" 
                fill="none" 
                stroke="#8b949e" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Czy na pewno chcesz usunąć nawyk "${habit.name}"?`)) {
                  onRemove(habit.id);
                }
              }}
              className="flex-shrink-0 p-2 rounded-md transition-colors"
              style={{ color: '#8b949e' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f85149';
                e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8b949e';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Usuń nawyk"
              aria-label={`Usuń nawyk "${habit.name}"`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
