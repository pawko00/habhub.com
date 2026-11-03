import { Habit } from '@/types/habit';

// Kolory w stylu kropek języków na GitHubie (Primer, tryb ciemny)
export const HABIT_COLORS = [
  { value: '#f78166', label: 'Koralowy' },
  { value: '#ffa657', label: 'Pomarańczowy' },
  { value: '#d29922', label: 'Żółty' },
  { value: '#3fb950', label: 'Zielony' },
  { value: '#39c5cf', label: 'Turkusowy' },
  { value: '#58a6ff', label: 'Niebieski' },
  { value: '#a371f7', label: 'Fioletowy' },
  { value: '#db61a2', label: 'Różowy' },
] as const;

const VALID_COLORS = new Set<string>(HABIT_COLORS.map(c => c.value));

// Nawyki sprzed dodania koloru dostają stały kolor wyliczony z ID
export function getHabitColor(habit: Pick<Habit, 'id' | 'color'>): string {
  if (habit.color && VALID_COLORS.has(habit.color)) return habit.color;

  let hash = 0;
  for (const char of habit.id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return HABIT_COLORS[hash % HABIT_COLORS.length].value;
}
