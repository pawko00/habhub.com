'use client';

import { useState, useMemo } from 'react';
import { FlameIcon, GoalIcon, TrophyIcon } from '@primer/octicons-react';
import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalHeatmap } from '@/components/Heatmap';
import { HabitList } from '@/components/HabitList';
import { DayDetail } from '@/components/DayDetail';
import { AppHeader } from '@/components/AppHeader';
import { StatCards } from '@/components/StatCards';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingScreen } from '@/components/LoadingScreen';
import {
  calculateActivityStats,
  formatDate,
  pluralizeCompletions,
  pluralizeDays,
} from '@/lib/utils';

export default function Home() {
  const { user } = useAuth();
  const {
    habits,
    completions,
    isLoaded,
    isLoading,
    error,
    clearError,
    addHabit,
    toggleCompletion,
    getAllDayStats,
    getHabitsForDate,
    loadSampleData,
  } = useHabits();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dayStats = useMemo(() => getAllDayStats(), [getAllDayStats]);
  const activity = useMemo(() => calculateActivityStats(habits, completions), [habits, completions]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  const handleLoadDemo = () => {
    if (confirm('Załadować przykładowe dane? To nadpisze obecne nawyki zapisane w tej przeglądarce.')) {
      loadSampleData();
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-8">
        <ErrorBanner message={error} onClose={clearError} />

        <GlobalHeatmap
          title={
            <>
              <span className="font-mono">{activity.totalLastYear}</span>{' '}
              {pluralizeCompletions(activity.totalLastYear)} w ostatnim roku
            </>
          }
          dayStats={dayStats}
          onDayClick={setSelectedDate}
          selectedDate={selectedDate}
        />

        <StatCards
          items={[
            {
              icon: <FlameIcon size={14} className="text-attention" />,
              label: 'Aktualna seria',
              value: pluralizeDays(activity.currentStreak),
            },
            {
              icon: <TrophyIcon size={14} />,
              label: 'Najdłuższa seria',
              value: pluralizeDays(activity.longestStreak),
            },
            {
              icon: <GoalIcon size={14} />,
              label: 'Dziś',
              value: `${activity.todayCompleted} / ${activity.todayTotal}`,
            },
          ]}
        />

        <HabitList
          habits={habits}
          completions={completions}
          isSaving={isLoading}
          onAdd={addHabit}
          onToggleToday={(habitId) => toggleCompletion(habitId, formatDate(new Date()))}
          onLoadDemo={user ? undefined : handleLoadDemo}
        />
      </main>

      {selectedDate && (
        <DayDetail
          date={selectedDate}
          habits={getHabitsForDate(selectedDate)}
          onToggle={toggleCompletion}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
