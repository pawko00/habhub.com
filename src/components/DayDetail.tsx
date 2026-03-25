'use client';

import { Habit } from '@/types/habit';
import { formatDate } from '@/lib/utils';

interface DayDetailProps {
  date: string;
  habits: { habit: Habit; completed: boolean }[];
  onToggle: (habitId: string, date: string) => void;
  onClose: () => void;
}

export function DayDetail({ date, habits, onToggle, onClose }: DayDetailProps) {
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isFuture = date > formatDate(new Date());

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-md shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        style={{ 
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-4"
          style={{ borderBottom: '1px solid #21262d' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 
                className="text-base font-semibold capitalize"
                style={{ color: '#e6edf3' }}
              >
                {formattedDate}
              </h2>
              <p className="text-sm" style={{ color: '#8b949e' }}>
                {completedCount}/{totalCount} nawyków ({percentage}%)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md transition-colors"
              style={{ color: '#8b949e' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#21262d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div 
            className="mt-3 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: '#21262d' }}
          >
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: '#238636',
              }}
            />
          </div>
        </div>

        {/* Habits list */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {habits.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8b949e' }}>
              Brak aktywnych nawyków w tym dniu
            </p>
          ) : (
            <div className="space-y-2">
              {habits.map(({ habit, completed }) => (
                <button
                  key={habit.id}
                  onClick={() => !isFuture && onToggle(habit.id, date)}
                  disabled={isFuture}
                  className="w-full flex items-center gap-3 p-3 rounded-md transition-colors"
                  style={{
                    backgroundColor: completed ? 'rgba(35, 134, 54, 0.15)' : '#0d1117',
                    border: completed ? '1px solid #238636' : '1px solid #30363d',
                    opacity: isFuture ? 0.5 : 1,
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFuture) {
                      e.currentTarget.style.borderColor = '#8b949e';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = completed ? '#238636' : '#30363d';
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: completed ? '#238636' : 'transparent',
                      border: completed ? '2px solid #238636' : '2px solid #30363d',
                    }}
                  >
                    {completed && (
                      <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span 
                    className="flex-1 text-left font-medium"
                    style={{ color: completed ? '#3fb950' : '#e6edf3' }}
                  >
                    {habit.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {isFuture && (
            <p className="mt-4 text-center text-sm" style={{ color: '#8b949e' }}>
              Nie można oznaczać nawyków w przyszłości
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
