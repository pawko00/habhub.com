'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckIcon, ChevronRightIcon, FlameIcon, PlusIcon } from '@primer/octicons-react';
import { Habit, HabitCompletion } from '@/types/habit';
import { calculateStreak, formatDate, parseDate } from '@/lib/utils';
import { getHabitColor, HABIT_COLORS } from '@/lib/habit-colors';
import { AddHabitForm } from '@/components/AddHabitForm';

interface HabitListProps {
  habits: Habit[];
  completions: HabitCompletion[];
  isSaving: boolean;
  onAdd: (name: string, color: string) => unknown;
  onToggleToday: (habitId: string) => void;
  onLoadDemo?: () => void;
}

function getLastDays(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) =>
    formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (count - 1 - i)))
  );
}

export function HabitList({ habits, completions, isSaving, onAdd, onToggleToday, onLoadDemo }: HabitListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const lastWeek = useMemo(() => getLastDays(7), []);
  const today = lastWeek[lastWeek.length - 1];

  const completedByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const c of completions) {
      if (!map.has(c.habitId)) map.set(c.habitId, new Set());
      map.get(c.habitId)!.add(c.date);
    }
    return map;
  }, [completions]);

  // Domyślnie pierwszy kolor, którego jeszcze nie ma na liście
  const nextColor = useMemo(() => {
    const used = new Set(habits.map(getHabitColor));
    return HABIT_COLORS.find(c => !used.has(c.value))?.value ?? HABIT_COLORS[0].value;
  }, [habits]);

  return (
    <section className="rounded-md border border-line">
      <div className="flex items-center justify-between gap-3 rounded-t-md bg-canvas-subtle px-4 py-2.5">
        <h2 className="text-sm font-semibold text-fg">Twoje nawyki</h2>
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-xs text-fg-muted">Zapisywanie…</span>}
          {onLoadDemo && (
            <button
              type="button"
              onClick={onLoadDemo}
              className="rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-canvas-overlay hover:text-fg-default"
            >
              Demo
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-success-emphasis px-3 py-1 text-sm font-medium text-white hover:bg-success-hover"
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Nowy nawyk</span>
            <span className="sr-only sm:hidden">Nowy nawyk</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <AddHabitForm initialColor={nextColor} onAdd={onAdd} onCancel={() => setIsAdding(false)} />
      )}

      {habits.length === 0 && !isAdding ? (
        <div className="border-t border-line-muted px-4 py-12 text-center">
          <p className="text-fg">Zacznij od pierwszego nawyku</p>
          <p className="mt-1 text-sm text-fg-muted">
            Codziennie odhaczaj wykonanie i patrz, jak mapa się zieleni.
          </p>
        </div>
      ) : (
        <ul>
          {habits.map(habit => {
            const done = completedByHabit.get(habit.id) ?? new Set<string>();
            const streak = calculateStreak([...done]);
            const isDoneToday = done.has(today);

            return (
              <li key={habit.id} className="flex items-center gap-3 border-t border-line-muted px-4 py-3 hover:bg-canvas-subtle/60">
                <button
                  type="button"
                  onClick={() => onToggleToday(habit.id)}
                  aria-pressed={isDoneToday}
                  aria-label={isDoneToday ? `Odznacz „${habit.name}” na dziś` : `Oznacz „${habit.name}” na dziś`}
                  title={isDoneToday ? 'Odznacz na dziś' : 'Oznacz na dziś'}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isDoneToday
                      ? 'border-success-emphasis bg-success-emphasis text-white'
                      : 'border-line hover:border-fg-muted'
                  }`}
                >
                  {isDoneToday && <CheckIcon size={14} />}
                </button>

                <Link href={`/habit/${habit.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: getHabitColor(habit) }} />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-fg group-hover:text-accent group-hover:underline">{habit.name}</span>
                    <span className="ml-2 hidden text-xs text-fg-muted sm:inline">
                      od {parseDate(habit.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                    </span>
                  </span>

                  <span className="hidden gap-[3px] sm:flex" aria-hidden="true">
                    {lastWeek.map(date => {
                      const inactive = date < habit.createdAt;
                      const isDone = done.has(date);
                      return (
                        <span
                          key={date}
                          className={`h-2.5 w-2.5 rounded-[2px] ${
                            inactive
                              ? 'bg-canvas'
                              : isDone
                                ? 'bg-contrib-3'
                                : 'bg-contrib-0 outline outline-1 -outline-offset-1 outline-line-muted'
                          }`}
                        />
                      );
                    })}
                  </span>

                  <span
                    className="flex w-11 flex-shrink-0 items-center justify-end gap-1 font-mono text-xs text-fg-muted"
                    title={streak > 0 ? `Seria: ${streak} dni z rzędu` : undefined}
                  >
                    {streak > 0 && (
                      <>
                        <FlameIcon size={14} className="text-attention" />
                        {streak}
                      </>
                    )}
                  </span>
                  <ChevronRightIcon size={16} className="flex-shrink-0 text-fg-subtle group-hover:text-fg-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
