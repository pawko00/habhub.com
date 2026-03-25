import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Habit, HabitCompletion } from '@/types/habit';

// Firestore collection names
const HABITS_COLLECTION = 'habits';
const COMPLETIONS_COLLECTION = 'completions';

export const firestoreStorage = {
  // Habits
  getHabits: async (userId: string): Promise<Habit[]> => {
    const habitsRef = collection(db, 'users', userId, HABITS_COLLECTION);
    const snapshot = await getDocs(habitsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  },

  addHabit: async (userId: string, habit: Habit): Promise<void> => {
    const habitRef = doc(db, 'users', userId, HABITS_COLLECTION, habit.id);
    await setDoc(habitRef, {
      name: habit.name,
      createdAt: habit.createdAt,
    });
  },

  removeHabit: async (userId: string, habitId: string): Promise<void> => {
    // Delete habit
    const habitRef = doc(db, 'users', userId, HABITS_COLLECTION, habitId);
    await deleteDoc(habitRef);

    // Delete all completions for this habit
    const completionsRef = collection(db, 'users', userId, COMPLETIONS_COLLECTION);
    const q = query(completionsRef, where('habitId', '==', habitId));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  },

  // Completions
  getCompletions: async (userId: string): Promise<HabitCompletion[]> => {
    const completionsRef = collection(db, 'users', userId, COMPLETIONS_COLLECTION);
    const snapshot = await getDocs(completionsRef);
    return snapshot.docs.map(doc => doc.data() as HabitCompletion);
  },

  toggleCompletion: async (
    userId: string,
    habitId: string,
    date: string
  ): Promise<boolean> => {
    const completionId = `${habitId}_${date}`;
    const completionRef = doc(db, 'users', userId, COMPLETIONS_COLLECTION, completionId);
    
    // Check if exists
    const completionsRef = collection(db, 'users', userId, COMPLETIONS_COLLECTION);
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Remove completion
      await deleteDoc(snapshot.docs[0].ref);
      return false;
    } else {
      // Add completion
      await setDoc(completionRef, { habitId, date });
      return true;
    }
  },

  isCompleted: async (
    userId: string,
    habitId: string,
    date: string
  ): Promise<boolean> => {
    const completionsRef = collection(db, 'users', userId, COMPLETIONS_COLLECTION);
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  // Seed sample data
  seedSampleData: async (userId: string): Promise<void> => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const habits: Habit[] = [
      { id: 'habit-1', name: '🏃 Bieganie', createdAt: '2025-06-01' },
      { id: 'habit-2', name: '📚 Czytanie 30 min', createdAt: '2025-09-15' },
      { id: 'habit-3', name: '🧘 Medytacja', createdAt: '2025-11-01' },
      { id: 'habit-4', name: '💧 8 szklanek wody', createdAt: '2026-01-01' },
      { id: 'habit-5', name: '🛏️ Wstawanie o 6:00', createdAt: '2026-01-15' },
    ];

    // Delete existing data first
    const existingHabits = await firestoreStorage.getHabits(userId);
    for (const habit of existingHabits) {
      await firestoreStorage.removeHabit(userId, habit.id);
    }

    // Add habits
    for (const habit of habits) {
      await firestoreStorage.addHabit(userId, habit);
    }

    // Generate and add completions
    const batch = writeBatch(db);
    let batchCount = 0;
    const MAX_BATCH = 500;

    for (const habit of habits) {
      const startDate = new Date(habit.createdAt);
      const current = new Date(startDate);

      while (current <= today) {
        const dateStr = formatDate(current);
        let shouldComplete = false;

        switch (habit.id) {
          case 'habit-1':
            const dayOfWeek1 = current.getDay();
            if (dayOfWeek1 !== 0 && dayOfWeek1 !== 6) {
              shouldComplete = Math.random() < 0.7;
            } else {
              shouldComplete = Math.random() < 0.3;
            }
            break;
          case 'habit-2':
            shouldComplete = Math.random() < 0.85;
            break;
          case 'habit-3':
            shouldComplete = Math.random() < 0.6;
            break;
          case 'habit-4':
            const daysAgo4 = Math.floor(
              (today.getTime() - current.getTime()) / 86400000
            );
            shouldComplete = daysAgo4 < 14 ? Math.random() < 0.95 : Math.random() < 0.5;
            break;
          case 'habit-5':
            const daysAgo5 = Math.floor(
              (today.getTime() - current.getTime()) / 86400000
            );
            if (daysAgo5 < 7) shouldComplete = Math.random() < 0.9;
            else if (daysAgo5 < 14) shouldComplete = Math.random() < 0.7;
            else shouldComplete = Math.random() < 0.4;
            break;
        }

        if (shouldComplete) {
          const completionId = `${habit.id}_${dateStr}`;
          const completionRef = doc(
            db,
            'users',
            userId,
            COMPLETIONS_COLLECTION,
            completionId
          );
          batch.set(completionRef, { habitId: habit.id, date: dateStr });
          batchCount++;

          // Firestore batch limit is 500
          if (batchCount >= MAX_BATCH) {
            await batch.commit();
            batchCount = 0;
          }
        }

        current.setDate(current.getDate() + 1);
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
  },
};
