import { Habit, HabitCompletion, HabitPatch } from '@/types/habit';
import { generateSampleData } from './sample-data';

const HABITS_KEY = 'habit-tracker-habits';
const COMPLETIONS_KEY = 'habit-tracker-completions';

function readJson<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    const parsed: unknown = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    // Uszkodzone dane lub zablokowany localStorage (tryb prywatny) - zaczynamy od zera
    console.error(`Failed to read ${key} from localStorage:`, error);
    return [];
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getHabits: (): Habit[] => readJson<Habit>(HABITS_KEY),

  saveHabits: (habits: Habit[]): void => writeJson(HABITS_KEY, habits),

  getCompletions: (): HabitCompletion[] => readJson<HabitCompletion>(COMPLETIONS_KEY),

  saveCompletions: (completions: HabitCompletion[]): void => writeJson(COMPLETIONS_KEY, completions),

  addHabit: (habit: Habit): void => {
    storage.saveHabits([...storage.getHabits(), habit]);
  },

  removeHabit: (habitId: string): void => {
    storage.saveHabits(storage.getHabits().filter(h => h.id !== habitId));
    storage.saveCompletions(storage.getCompletions().filter(c => c.habitId !== habitId));
  },

  updateHabit: (habitId: string, patch: HabitPatch): void => {
    storage.saveHabits(storage.getHabits().map(h => (h.id === habitId ? { ...h, ...patch } : h)));
  },

  setCompletion: (habitId: string, date: string, completed: boolean): void => {
    const others = storage.getCompletions().filter(
      c => !(c.habitId === habitId && c.date === date)
    );
    storage.saveCompletions(completed ? [...others, { habitId, date }] : others);
  },

  seedSampleData: (): void => {
    const { habits, completions } = generateSampleData();
    storage.saveHabits(habits);
    storage.saveCompletions(completions);
  },
};
