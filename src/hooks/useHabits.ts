'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Habit, HabitCompletion, HabitPatch, HabitWithStats, DayStats } from '@/types/habit';
import { storage } from '@/lib/storage';
import { firestoreStorage } from '@/lib/firestore-storage';
import { mapDataError } from '@/lib/errors';
import { useAuth } from '@/contexts/AuthContext';
import {
  formatDate,
  calculateStreak,
  calculateLongestStreak,
  calculateDayStats,
  generateId,
  getLast365Days
} from '@/lib/utils';

// Klucz źródła danych: uid zalogowanego użytkownika albo 'local'
type SourceKey = string;

export function useHabits() {
  const { user, loading: authLoading } = useAuth();
  const sourceKey: SourceKey | null = authLoading ? null : user ? user.uid : 'local';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loadedKey, setLoadedKey] = useState<SourceKey | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Aktualne wykonania dla handlerów, bez przebudowywania callbacków przy każdej zmianie
  const completionsRef = useRef(completions);
  useEffect(() => {
    completionsRef.current = completions;
  }, [completions]);

  // Kliknięcia w trakcie zapisu tego samego dnia są ignorowane (podwójny klik)
  const pendingToggles = useRef(new Set<string>());

  const isLoaded = sourceKey !== null && loadedKey === sourceKey;

  // Load data based on auth state
  useEffect(() => {
    if (sourceKey === null) return;
    let cancelled = false;

    const loadData = async () => {
      let nextHabits: Habit[] = [];
      let nextCompletions: HabitCompletion[] = [];
      let nextError: string | null = null;

      try {
        if (sourceKey === 'local') {
          nextHabits = storage.getHabits();
          nextCompletions = storage.getCompletions();
        } else {
          [nextHabits, nextCompletions] = await Promise.all([
            firestoreStorage.getHabits(sourceKey),
            firestoreStorage.getCompletions(sourceKey),
          ]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        nextError = mapDataError(err);
      }

      // Użytkownik zdążył się przelogować - ignorujemy nieaktualną odpowiedź
      if (cancelled) return;
      setHabits(nextHabits);
      setCompletions(nextCompletions);
      setError(nextError);
      setLoadedKey(sourceKey);
    };

    // Odkładamy start na mikrozadanie, żeby nie wywoływać setState synchronicznie w efekcie
    Promise.resolve().then(loadData);

    return () => {
      cancelled = true;
    };
  }, [sourceKey]);

  // Wspólna obsługa zapisu: licznik "Zapisywanie...", przechwycenie błędu, rollback
  const persist = useCallback(async (
    write: () => Promise<void> | void,
    rollback?: () => void
  ): Promise<boolean> => {
    setPendingCount(n => n + 1);
    try {
      await write();
      return true;
    } catch (err) {
      console.error('Error saving data:', err);
      rollback?.();
      setError(mapDataError(err));
      return false;
    } finally {
      setPendingCount(n => n - 1);
    }
  }, []);

  const addHabit = useCallback(async (name: string, color?: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      createdAt: formatDate(new Date()),
      ...(color ? { color } : {}),
    };

    setHabits(prev => [...prev, newHabit]);
    const ok = await persist(
      () => (user ? firestoreStorage.addHabit(user.uid, newHabit) : storage.addHabit(newHabit)),
      () => setHabits(prev => prev.filter(h => h.id !== newHabit.id))
    );
    return ok ? newHabit : null;
  }, [user, persist]);

  const removeHabit = useCallback(async (habitId: string) => {
    const ok = await persist(() =>
      user ? firestoreStorage.removeHabit(user.uid, habitId) : storage.removeHabit(habitId)
    );
    if (ok) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
      setCompletions(prev => prev.filter(c => c.habitId !== habitId));
    }
    return ok;
  }, [user, persist]);

  const updateHabit = useCallback(async (habitId: string, patch: HabitPatch) => {
    const previous = habits.find(h => h.id === habitId);
    setHabits(prev => prev.map(h => (h.id === habitId ? { ...h, ...patch } : h)));

    return persist(
      () => (user
        ? firestoreStorage.updateHabit(user.uid, habitId, patch)
        : storage.updateHabit(habitId, patch)),
      () => setHabits(prev => prev.map(h => (h.id === habitId && previous ? previous : h)))
    );
  }, [user, habits, persist]);

  const toggleCompletion = useCallback(async (habitId: string, date: string) => {
    const key = `${habitId}_${date}`;
    if (pendingToggles.current.has(key)) return;
    pendingToggles.current.add(key);

    const wasCompleted = completionsRef.current.some(
      c => c.habitId === habitId && c.date === date
    );
    const completed = !wasCompleted;

    const apply = (value: boolean) => setCompletions(prev => {
      const others = prev.filter(c => !(c.habitId === habitId && c.date === date));
      return value ? [...others, { habitId, date }] : others;
    });

    apply(completed);
    try {
      await persist(
        () => (user
          ? firestoreStorage.setCompletion(user.uid, habitId, date, completed)
          : storage.setCompletion(habitId, date, completed)),
        () => apply(wasCompleted)
      );
    } finally {
      pendingToggles.current.delete(key);
    }
  }, [user, persist]);

  const isCompleted = useCallback((habitId: string, date: string): boolean => {
    return completions.some(c => c.habitId === habitId && c.date === date);
  }, [completions]);

  const getHabitWithStats = useCallback((habitId: string): HabitWithStats | null => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;

    const completedDates = completions
      .filter(c => c.habitId === habitId)
      .map(c => c.date);

    return {
      ...habit,
      currentStreak: calculateStreak(completedDates),
      longestStreak: calculateLongestStreak(completedDates),
      completedDates,
    };
  }, [habits, completions]);

  const getDayStats = useCallback((date: string): DayStats => {
    return calculateDayStats(date, habits, completions);
  }, [habits, completions]);

  const getAllDayStats = useCallback((): Map<string, DayStats> => {
    const dates = getLast365Days();
    const statsMap = new Map<string, DayStats>();

    for (const date of dates) {
      statsMap.set(date, calculateDayStats(date, habits, completions));
    }

    return statsMap;
  }, [habits, completions]);

  const getHabitsForDate = useCallback((date: string): { habit: Habit; completed: boolean }[] => {
    const activeHabits = habits.filter(h => h.createdAt <= date);

    return activeHabits.map(habit => ({
      habit,
      completed: completions.some(c => c.habitId === habit.id && c.date === date),
    }));
  }, [habits, completions]);

  // Demo tylko dla danych lokalnych - nie nadpisujemy danych w chmurze
  const loadSampleData = useCallback(async () => {
    if (user) return;
    const ok = await persist(() => storage.seedSampleData());
    if (ok) {
      setHabits(storage.getHabits());
      setCompletions(storage.getCompletions());
    }
  }, [user, persist]);

  const clearError = useCallback(() => setError(null), []);

  return {
    habits,
    completions,
    isLoaded,
    isLoading: pendingCount > 0,
    error,
    clearError,
    addHabit,
    removeHabit,
    updateHabit,
    toggleCompletion,
    isCompleted,
    getHabitWithStats,
    getDayStats,
    getAllDayStats,
    getHabitsForDate,
    loadSampleData,
  };
}
