'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitCompletion, HabitWithStats, DayStats } from '@/types/habit';
import { storage } from '@/lib/storage';
import { firestoreStorage } from '@/lib/firestore-storage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  formatDate, 
  calculateStreak, 
  calculateLongestStreak, 
  calculateDayStats,
  generateId,
  getLast365Days
} from '@/lib/utils';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load data based on auth state
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Load from Firestore
          const [firestoreHabits, firestoreCompletions] = await Promise.all([
            firestoreStorage.getHabits(user.uid),
            firestoreStorage.getCompletions(user.uid),
          ]);
          setHabits(firestoreHabits);
          setCompletions(firestoreCompletions);
        } else {
          // Load from localStorage
          setHabits(storage.getHabits());
          setCompletions(storage.getCompletions());
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    loadData();
  }, [user]);

  const addHabit = useCallback(async (name: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      createdAt: formatDate(new Date()),
    };

    if (user) {
      await firestoreStorage.addHabit(user.uid, newHabit);
    } else {
      storage.addHabit(newHabit);
    }
    
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, [user]);

  const removeHabit = useCallback(async (habitId: string) => {
    if (user) {
      await firestoreStorage.removeHabit(user.uid, habitId);
    } else {
      storage.removeHabit(habitId);
    }
    
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setCompletions(prev => prev.filter(c => c.habitId !== habitId));
  }, [user]);

  const updateHabitName = useCallback(async (habitId: string, name: string) => {
    if (user) {
      await firestoreStorage.updateHabitName(user.uid, habitId, name);
    } else {
      storage.updateHabitName(habitId, name);
    }
    
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, name } : h));
  }, [user]);

  const toggleCompletion = useCallback(async (habitId: string, date: string) => {
    let isNowCompleted: boolean;

    if (user) {
      isNowCompleted = await firestoreStorage.toggleCompletion(user.uid, habitId, date);
    } else {
      isNowCompleted = storage.toggleCompletion(habitId, date);
    }
    
    setCompletions(prev => {
      if (isNowCompleted) {
        return [...prev, { habitId, date }];
      } else {
        return prev.filter(c => !(c.habitId === habitId && c.date === date));
      }
    });
    
    return isNowCompleted;
  }, [user]);

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

  const loadSampleData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        await firestoreStorage.seedSampleData(user.uid);
        const [firestoreHabits, firestoreCompletions] = await Promise.all([
          firestoreStorage.getHabits(user.uid),
          firestoreStorage.getCompletions(user.uid),
        ]);
        setHabits(firestoreHabits);
        setCompletions(firestoreCompletions);
      } else {
        storage.seedSampleData();
        setHabits(storage.getHabits());
        setCompletions(storage.getCompletions());
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    habits,
    completions,
    isLoaded,
    isLoading,
    addHabit,
    removeHabit,
    updateHabitName,
    toggleCompletion,
    isCompleted,
    getHabitWithStats,
    getDayStats,
    getAllDayStats,
    getHabitsForDate,
    loadSampleData,
  };
}
