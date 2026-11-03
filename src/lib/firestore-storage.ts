import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  DocumentReference,
} from 'firebase/firestore';
import { db } from './firebase';
import { Habit, HabitCompletion } from '@/types/habit';

// Firestore collection names
const HABITS_COLLECTION = 'habits';
const COMPLETIONS_COLLECTION = 'completions';

// Limit Firestore to 500 operacji na batch
const MAX_BATCH = 500;

const habitDoc = (userId: string, habitId: string) =>
  doc(db, 'users', userId, HABITS_COLLECTION, habitId);

// Deterministyczne ID - jedno wykonanie na nawyk i dzień
const completionDoc = (userId: string, habitId: string, date: string) =>
  doc(db, 'users', userId, COMPLETIONS_COLLECTION, `${habitId}_${date}`);

async function deleteInBatches(refs: DocumentReference[]): Promise<void> {
  for (let i = 0; i < refs.length; i += MAX_BATCH) {
    const batch = writeBatch(db);
    refs.slice(i, i + MAX_BATCH).forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}

export const firestoreStorage = {
  // Habits
  getHabits: async (userId: string): Promise<Habit[]> => {
    const snapshot = await getDocs(collection(db, 'users', userId, HABITS_COLLECTION));
    return snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as Habit))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  addHabit: async (userId: string, habit: Habit): Promise<void> => {
    await setDoc(habitDoc(userId, habit.id), {
      name: habit.name,
      createdAt: habit.createdAt,
    });
  },

  updateHabitName: async (userId: string, habitId: string, name: string): Promise<void> => {
    await setDoc(habitDoc(userId, habitId), { name }, { merge: true });
  },

  removeHabit: async (userId: string, habitId: string): Promise<void> => {
    const completionsRef = collection(db, 'users', userId, COMPLETIONS_COLLECTION);
    const snapshot = await getDocs(query(completionsRef, where('habitId', '==', habitId)));

    // Najpierw wykonania, na końcu sam nawyk - przy przerwaniu nie zostają osierocone dane
    await deleteInBatches(snapshot.docs.map(d => d.ref));
    await deleteDoc(habitDoc(userId, habitId));
  },

  // Completions
  getCompletions: async (userId: string): Promise<HabitCompletion[]> => {
    const snapshot = await getDocs(collection(db, 'users', userId, COMPLETIONS_COLLECTION));
    return snapshot.docs.map(d => d.data() as HabitCompletion);
  },

  setCompletion: async (
    userId: string,
    habitId: string,
    date: string,
    completed: boolean
  ): Promise<void> => {
    const ref = completionDoc(userId, habitId, date);
    if (completed) {
      await setDoc(ref, { habitId, date });
    } else {
      await deleteDoc(ref);
    }
  },
};
