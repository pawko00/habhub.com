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

export function getColorForPercentage(percentage: number): string {
  // GitHub contribution graph colors
  if (percentage === 0) return 'gh-contrib-0';
  if (percentage <= 25) return 'gh-contrib-1';
  if (percentage <= 50) return 'gh-contrib-2';
  if (percentage <= 75) return 'gh-contrib-3';
  return 'gh-contrib-4';
}

export function getColorForCompletion(completed: boolean): string {
  return completed ? 'gh-contrib-4' : 'gh-contrib-0';
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export function getMonthLabels(dates: string[]): { month: string; weekIndex: number }[] {
  const labels: { month: string; weekIndex: number }[] = [];
  const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  
  let lastMonth = -1;
  const weeks = getWeeksArray(dates);
  
  weeks.forEach((week, weekIndex) => {
    const firstValidDate = week.find(d => d !== '');
    if (firstValidDate) {
      const date = parseDate(firstValidDate);
      const month = date.getMonth();
      
      if (month !== lastMonth) {
        labels.push({ month: monthNames[month], weekIndex });
        lastMonth = month;
      }
    }
  });
  
  return labels;
}
