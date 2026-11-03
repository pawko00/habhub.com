import { Habit, HabitCompletion } from '@/types/habit';
import { formatDate } from './utils';

function daysAgo(today: Date, days: number): Date {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
}

// Przykładowe nawyki tworzone względem dzisiejszej daty, żeby demo zawsze wyglądało świeżo
export function generateSampleData(today: Date = new Date()): {
  habits: Habit[];
  completions: HabitCompletion[];
} {
  const habits: Habit[] = [
    { id: 'habit-1', name: '🏃 Bieganie', createdAt: formatDate(daysAgo(today, 300)) },
    { id: 'habit-2', name: '📚 Czytanie 30 min', createdAt: formatDate(daysAgo(today, 200)) },
    { id: 'habit-3', name: '🧘 Medytacja', createdAt: formatDate(daysAgo(today, 120)) },
    { id: 'habit-4', name: '💧 8 szklanek wody', createdAt: formatDate(daysAgo(today, 60)) },
    { id: 'habit-5', name: '🛏️ Wstawanie o 6:00', createdAt: formatDate(daysAgo(today, 30)) },
  ];

  const completions: HabitCompletion[] = [];
  const end = daysAgo(today, 0);

  for (const habit of habits) {
    const [y, m, d] = habit.createdAt.split('-').map(Number);
    const current = new Date(y, m - 1, d);

    while (current <= end) {
      const ago = Math.round((end.getTime() - current.getTime()) / 86400000);
      let probability: number;

      switch (habit.id) {
        case 'habit-1': { // Bieganie - głównie w dni robocze
          const dayOfWeek = current.getDay();
          probability = dayOfWeek !== 0 && dayOfWeek !== 6 ? 0.7 : 0.3;
          break;
        }
        case 'habit-2': // Czytanie - bardzo regularnie
          probability = 0.85;
          break;
        case 'habit-3': // Medytacja - umiarkowanie
          probability = 0.6;
          break;
        case 'habit-4': // Woda - dobra passa ostatnio
          probability = ago < 14 ? 0.95 : 0.5;
          break;
        default: // Wstawanie - rozkręca się
          probability = ago < 7 ? 0.9 : ago < 14 ? 0.7 : 0.4;
      }

      if (Math.random() < probability) {
        completions.push({ habitId: habit.id, date: formatDate(current) });
      }

      current.setDate(current.getDate() + 1);
    }
  }

  return { habits, completions };
}
