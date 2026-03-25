'use client';

import { useState, useMemo } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalHeatmap } from '@/components/Heatmap';
import { AddHabitForm } from '@/components/AddHabitForm';
import { HabitList } from '@/components/HabitList';
import { DayDetail } from '@/components/DayDetail';
import { AuthButton } from '@/components/Auth';
import { formatDate } from '@/lib/utils';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    habits,
    completions,
    isLoaded,
    isLoading,
    addHabit,
    removeHabit,
    toggleCompletion,
    getAllDayStats,
    getHabitsForDate,
    loadSampleData,
  } = useHabits();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dayStats = useMemo(() => getAllDayStats(), [getAllDayStats]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseDetail = () => {
    setSelectedDate(null);
  };

  const handleToggleInDetail = (habitId: string, date: string) => {
    toggleCompletion(habitId, date);
  };

  const handleToggleToday = (habitId: string) => {
    toggleCompletion(habitId, formatDate(new Date()));
  };

  if (authLoading || !isLoaded) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0d1117' }}
      >
        <div className="animate-pulse" style={{ color: '#8b949e' }}>Ładowanie...</div>
      </div>
    );
  }

  const habitsForSelectedDate = selectedDate ? getHabitsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 
              className="text-2xl font-semibold mb-1"
              style={{ color: '#e6edf3' }}
            >
              Habit Tracker
            </h1>
            <p style={{ color: '#8b949e' }}>
              {user 
                ? `Zalogowany jako ${user.displayName || user.email?.split('@')[0]}`
                : 'Śledź swoje codzienne nawyki i buduj dobre przyzwyczajenia'
              }
            </p>
          </div>
          <AuthButton />
        </header>

        {/* Global Heatmap Section */}
        <section 
          className="mb-6 p-4 rounded-md"
          style={{ 
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
          }}
        >
          <h2 
            className="text-base font-semibold mb-1"
            style={{ color: '#e6edf3' }}
          >
            Mapa aktywności
          </h2>
          <p className="text-sm mb-4" style={{ color: '#8b949e' }}>
            Kolor dnia zależy od procentu wykonanych nawyków. Kliknij dzień, aby zobaczyć szczegóły.
          </p>
          <GlobalHeatmap
            dayStats={dayStats}
            onDayClick={handleDayClick}
            selectedDate={selectedDate}
          />
        </section>

        {/* Habits Section */}
        <section 
          className="p-4 rounded-md"
          style={{ 
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-base font-semibold"
              style={{ color: '#e6edf3' }}
            >
              Twoje nawyki
            </h2>
            <div className="flex items-center gap-2">
              {isLoading && (
                <span className="text-sm" style={{ color: '#8b949e' }}>
                  Zapisywanie...
                </span>
              )}
              <button
                onClick={() => {
                  if (confirm('Czy załadować przykładowe dane? To nadpisze obecne nawyki.')) {
                    loadSampleData();
                  }
                }}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50"
                style={{ 
                  color: '#8b949e',
                  border: '1px solid #30363d',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8b949e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#30363d';
                }}
              >
                Załaduj demo
              </button>
              <AddHabitForm onAdd={addHabit} />
            </div>
          </div>
          <HabitList
            habits={habits}
            completions={completions}
            onRemove={removeHabit}
            onToggleToday={handleToggleToday}
          />
        </section>

        {/* Day Detail Modal */}
        {selectedDate && (
          <DayDetail
            date={selectedDate}
            habits={habitsForSelectedDate}
            onToggle={handleToggleInDetail}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}
