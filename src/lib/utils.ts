import { DayStats, Habit, HabitCompletion } from '@/types/habit';

// Data w lokalnej strefie czasowej (toISOString() zwraca UTC i przesuwa dzień po północy)
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function getLast365Days(): string[] {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);
  
  return generateDateRange(start, end);
}

export function getWeeksArray(dates: string[]): string[][] {
  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  
  // Find the first date and pad to start of week (Sunday)
  if (dates.length > 0) {
    const firstDate = parseDate(dates[0]);
    const dayOfWeek = firstDate.getDay();
    
    // Add empty slots for days before the first date in the week
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push('');
    }
  }
  
  for (const date of dates) {
    currentWeek.push(date);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add remaining days
  if (currentWeek.length > 0) {
    // Pad to complete the week
    while (currentWeek.length < 7) {
      currentWeek.push('');
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

export function calculateStreak(completedDates: string[], fromDate: Date = new Date()): number {
  if (completedDates.length === 0) return 0;

  const done = new Set(completedDates);
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  // Streak jest aktualny, jeśli obejmuje dziś albo wczoraj (dzisiaj można jeszcze odhaczyć)
  if (!done.has(formatDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (done.has(formatDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function calculateLongestStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...new Set(completedDates)].sort();
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseDate(sortedDates[i - 1]);
    const currDate = parseDate(sortedDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

export function calculateDayStats(
  date: string,
  habits: Habit[],
  completions: HabitCompletion[]
): DayStats {
  // Only count habits that existed on this date
  const activeHabits = habits.filter(h => h.createdAt <= date);
  const total = activeHabits.length;
  
  if (total === 0) {
    return { date, completed: 0, total: 0, percentage: 0 };
  }
  
  const completedForDate = completions.filter(c => c.date === date);
  const completed = completedForDate.filter(c => 
    activeHabits.some(h => h.id === c.habitId)
  ).length;
  
  const percentage = Math.round((completed / total) * 100);
  
  return { date, completed, total, percentage };
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export interface ActivityStats {
  totalLastYear: number;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: number;
  todayTotal: number;
}

// Podsumowanie wszystkich nawyków: seria liczy dni z co najmniej jednym wykonaniem
export function calculateActivityStats(
  habits: Habit[],
  completions: HabitCompletion[],
  today: Date = new Date()
): ActivityStats {
  const habitIds = new Set(habits.map(h => h.id));
  const valid = completions.filter(c => habitIds.has(c.habitId));
  const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate() + 1);
  const from = formatDate(yearAgo);
  const todayStr = formatDate(today);
  const activeDays = [...new Set(valid.map(c => c.date))];
  const todayStats = calculateDayStats(todayStr, habits, valid);

  return {
    totalLastYear: valid.filter(c => c.date >= from && c.date <= todayStr).length,
    currentStreak: calculateStreak(activeDays, today),
    longestStreak: calculateLongestStreak(activeDays),
    todayCompleted: todayStats.completed,
    todayTotal: todayStats.total,
  };
}

// "1 dzień", "2 dni", "5 dni"
export function pluralizeDays(n: number): string {
  return n === 1 ? '1 dzień' : `${n} dni`;
}

// Polska odmiana: 1 wykonanie, 2-4 wykonania, 5+ wykonań (z wyjątkiem 12-14)
export function pluralizeCompletions(n: number): string {
  if (n === 1) return 'wykonanie';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'wykonania';
  return 'wykonań';
}
