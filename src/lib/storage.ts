import { Habit, HabitCompletion } from '@/types/habit';

const HABITS_KEY = 'habit-tracker-habits';
const COMPLETIONS_KEY = 'habit-tracker-completions';

export const storage = {
  getHabits: (): Habit[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveHabits: (habits: Habit[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  getCompletions: (): HabitCompletion[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COMPLETIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCompletions: (completions: HabitCompletion[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
  },

  addHabit: (habit: Habit): void => {
    const habits = storage.getHabits();
    habits.push(habit);
    storage.saveHabits(habits);
  },

  removeHabit: (habitId: string): void => {
    const habits = storage.getHabits().filter(h => h.id !== habitId);
    storage.saveHabits(habits);
    // Also remove completions for this habit
    const completions = storage.getCompletions().filter(c => c.habitId !== habitId);
    storage.saveCompletions(completions);
  },

  toggleCompletion: (habitId: string, date: string): boolean => {
    const completions = storage.getCompletions();
    const existingIndex = completions.findIndex(
      c => c.habitId === habitId && c.date === date
    );

    if (existingIndex >= 0) {
      completions.splice(existingIndex, 1);
      storage.saveCompletions(completions);
      return false;
    } else {
      completions.push({ habitId, date });
      storage.saveCompletions(completions);
      return true;
    }
  },

  isCompleted: (habitId: string, date: string): boolean => {
    const completions = storage.getCompletions();
    return completions.some(c => c.habitId === habitId && c.date === date);
  },

  getCompletionsForDate: (date: string): HabitCompletion[] => {
    return storage.getCompletions().filter(c => c.date === date);
  },

  getCompletionsForHabit: (habitId: string): string[] => {
    return storage.getCompletions()
      .filter(c => c.habitId === habitId)
      .map(c => c.date);
  },

  seedSampleData: (): void => {
    if (typeof window === 'undefined') return;
    
    // Clear existing data
    localStorage.removeItem(HABITS_KEY);
    localStorage.removeItem(COMPLETIONS_KEY);

    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    // Sample habits with different creation dates
    const habits: Habit[] = [
      { id: 'habit-1', name: '🏃 Bieganie', createdAt: '2025-06-01' },
      { id: 'habit-2', name: '📚 Czytanie 30 min', createdAt: '2025-09-15' },
      { id: 'habit-3', name: '🧘 Medytacja', createdAt: '2025-11-01' },
      { id: 'habit-4', name: '💧 8 szklanek wody', createdAt: '2026-01-01' },
      { id: 'habit-5', name: '🛏️ Wstawanie o 6:00', createdAt: '2026-01-15' },
    ];

    const completions: HabitCompletion[] = [];

    // Generate completions for each habit with different patterns
    habits.forEach((habit) => {
      const startDate = new Date(habit.createdAt);
      const current = new Date(startDate);
      
      while (current <= today) {
        const dateStr = formatDate(current);
        let shouldComplete = false;

        // Different completion patterns for each habit
        switch (habit.id) {
          case 'habit-1': // Bieganie - mostly weekdays, ~70%
            const dayOfWeek1 = current.getDay();
            if (dayOfWeek1 !== 0 && dayOfWeek1 !== 6) {
              shouldComplete = Math.random() < 0.7;
            } else {
              shouldComplete = Math.random() < 0.3;
            }
            break;
          case 'habit-2': // Czytanie - very consistent, ~85%
            shouldComplete = Math.random() < 0.85;
            break;
          case 'habit-3': // Medytacja - moderate, ~60%
            shouldComplete = Math.random() < 0.6;
            break;
          case 'habit-4': // Woda - good streak recently
            const daysAgo4 = Math.floor((today.getTime() - current.getTime()) / 86400000);
            if (daysAgo4 < 14) {
              shouldComplete = Math.random() < 0.95; // Last 2 weeks very good
            } else {
              shouldComplete = Math.random() < 0.5;
            }
            break;
          case 'habit-5': // Wstawanie - building up
            const daysAgo5 = Math.floor((today.getTime() - current.getTime()) / 86400000);
            if (daysAgo5 < 7) {
              shouldComplete = Math.random() < 0.9;
            } else if (daysAgo5 < 14) {
              shouldComplete = Math.random() < 0.7;
            } else {
              shouldComplete = Math.random() < 0.4;
            }
            break;
        }

        if (shouldComplete) {
          completions.push({ habitId: habit.id, date: dateStr });
        }

        current.setDate(current.getDate() + 1);
      }
    });

    storage.saveHabits(habits);
    storage.saveCompletions(completions);
    
    console.log('Sample data loaded:', habits.length, 'habits,', completions.length, 'completions');
  }
};
