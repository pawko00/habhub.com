'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getErrorCode } from '@/lib/errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect działa tylko, gdy authDomain to domena aplikacji (proxy /__/auth w next.config.ts).
  // Przy authDomain na *.firebaseapp.com przeglądarki blokują storage innej domeny
  // i logowanie po przekierowaniu cicho się nie udaje - wtedy zostaje sam popup.
  const signInWithGoogle = async () => {
    const canRedirect = auth.config.authDomain === window.location.host;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    // Na telefonach popupy są często blokowane lub otwierane jako nowa karta - od razu redirect
    if (canRedirect && isTouchDevice) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (canRedirect && getErrorCode(error) === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
