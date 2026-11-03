'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  FlameIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
} from '@primer/octicons-react';
import { useHabits } from '@/hooks/useHabits';
import { HabitHeatmap } from '@/components/Heatmap';
import { ErrorBanner } from '@/components/ErrorBanner';
import { AppHeader } from '@/components/AppHeader';
import { StatCards } from '@/components/StatCards';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ColorPicker } from '@/components/AddHabitForm';
import { getHabitColor } from '@/lib/habit-colors';
import { formatDate, parseDate, pluralizeCompletions, pluralizeDays } from '@/lib/utils';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedColor, setEditedColor] = useState('');

  const {
    isLoaded,
    error,
    clearError,
    getHabitWithStats,
    toggleCompletion,
    removeHabit,
    updateHabit,
  } = useHabits();

  const habit = useMemo(
    () => (isLoaded ? getHabitWithStats(habitId) : null),
    [isLoaded, getHabitWithStats, habitId]
  );

  const lastYearCount = useMemo(() => {
    if (!habit) return 0;
    const now = new Date();
    const from = formatDate(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1));
    return habit.completedDates.filter(d => d >= from).length;
  }, [habit]);

  const handleDelete = async () => {
    if (habit && confirm(`Czy na pewno chcesz usunąć nawyk „${habit.name}”? Tej operacji nie można cofnąć.`)) {
      const ok = await removeHabit(habitId);
      if (ok) router.push('/');
    }
  };

  const startEditing = () => {
    if (!habit) return;
    setEditedName(habit.name);
    setEditedColor(getHabitColor(habit));
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit) return;
    const name = editedName.trim();
    setIsEditing(false);
    const patch = {
      ...(name && name !== habit.name ? { name } : {}),
      ...(editedColor !== getHabitColor(habit) ? { color: editedColor } : {}),
    };
    if (Object.keys(patch).length > 0) {
      await updateHabit(habitId, patch);
    }
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-canvas">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-xl text-fg">Nie znaleziono nawyku</h1>
          <p className="mt-2 text-sm text-fg-muted">Mógł zostać usunięty albo należy do innego konta.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">
            Wróć do listy nawyków
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent">
          <ArrowLeftIcon size={16} />
          Wszystkie nawyki
        </Link>

        <ErrorBanner message={error} onClose={clearError} />

        <header className="border-b border-line pb-4">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
                maxLength={100}
                autoFocus
                aria-label="Nazwa nawyku"
                className="w-full rounded-md border border-line bg-canvas px-3 py-1.5 text-xl text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 sm:max-w-md"
              />
              <div className="flex flex-wrap items-center gap-3">
                <ColorPicker value={editedColor} onChange={setEditedColor} />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md border border-white/10 bg-success-emphasis px-3 py-1 text-sm font-medium text-white hover:bg-success-hover"
                  >
                    Zapisz
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-md border border-line bg-canvas-overlay px-3 py-1 text-sm text-fg-default hover:border-fg-subtle"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: getHabitColor(habit) }} />
                  <h1 className="break-words text-xl text-fg sm:text-2xl">{habit.name}</h1>
                </div>
                <p className="mt-1 text-sm text-fg-muted">
                  Śledzony od{' '}
                  {parseDate(habit.createdAt).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas-overlay px-3 py-1 text-sm text-fg-default hover:border-fg-subtle"
                >
                  <PencilIcon size={16} />
                  Edytuj
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas-overlay px-3 py-1 text-sm text-danger hover:border-danger hover:bg-danger hover:text-white"
                >
                  <TrashIcon size={16} />
                  Usuń
                </button>
              </div>
            </div>
          )}
        </header>

        <StatCards
          items={[
            {
              icon: <FlameIcon size={14} className="text-attention" />,
              label: 'Aktualna seria',
              value: pluralizeDays(habit.currentStreak),
            },
            {
              icon: <TrophyIcon size={14} />,
              label: 'Najdłuższa seria',
              value: pluralizeDays(habit.longestStreak),
            },
            {
              icon: <CheckCircleIcon size={14} />,
              label: 'Łącznie wykonań',
              value: String(habit.completedDates.length),
            },
          ]}
        />

        <HabitHeatmap
          title={
            <>
              <span className="font-mono">{lastYearCount}</span> {pluralizeCompletions(lastYearCount)} w ostatnim roku
            </>
          }
          completedDates={habit.completedDates}
          createdAt={habit.createdAt}
          onDayClick={(date) => toggleCompletion(habitId, date)}
        />
      </main>
    </div>
  );
}
