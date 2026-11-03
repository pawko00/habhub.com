'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CheckboxIcon, SignOutIcon } from '@primer/octicons-react';
import { useAuth } from '@/contexts/AuthContext';
import { isSilentAuthError, mapAuthError } from '@/lib/errors';

function GoogleIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#c9d1d9"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#c9d1d9"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#c9d1d9"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#c9d1d9"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthButton() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-line px-3 py-1 text-sm text-fg-default hover:border-fg-muted hover:text-fg"
      >
        Zaloguj się
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center rounded-full"
        aria-haspopup="menu"
        aria-expanded={showDropdown}
        aria-label="Menu konta"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element -- zewnętrzny avatar Google, next/image wymagałby konfiguracji domen
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full border border-line"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-emphasis text-xs font-medium text-white">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-md border border-line bg-canvas-subtle shadow-xl shadow-black/40"
          >
            <div className="border-b border-line px-4 py-2.5">
              <p className="text-xs text-fg-muted">Zalogowano jako</p>
              <p className="truncate text-sm font-semibold text-fg">{user.displayName || user.email}</p>
            </div>
            <button
              role="menuitem"
              onClick={async () => {
                setShowDropdown(false);
                try {
                  await signOut();
                } catch (err) {
                  console.error('Sign out failed:', err);
                }
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-fg-default hover:bg-accent-emphasis hover:text-white"
            >
              <SignOutIcon size={16} />
              Wyloguj się
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function LoginPage() {
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  // Błąd logowania przez redirect pojawia się dopiero po powrocie na tę stronę
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      if (!isSilentAuthError(err)) {
        console.error('Google redirect sign in failed:', err);
        setError(mapAuthError(err));
      }
    });
  }, []);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (!isSilentAuthError(err)) {
        console.error('Google sign in failed:', err);
        setError(mapAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      console.error('Email auth failed:', err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="animate-pulse text-sm text-fg-muted">Ładowanie…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-canvas px-4 pt-12 pb-8 sm:pt-20">
      <div className="w-full max-w-[340px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" className="text-fg" aria-label="Strona główna">
            <CheckboxIcon size={48} />
          </Link>
          <h1 className="mt-5 text-2xl font-light text-fg">
            {isSignUp ? 'Załóż konto w habhub' : 'Zaloguj się do habhub'}
          </h1>
        </div>

        <div className="rounded-md border border-line bg-canvas-subtle p-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-line bg-canvas-overlay px-4 py-1.5 text-sm font-medium text-fg-default transition-colors hover:border-fg-subtle disabled:opacity-50"
          >
            <GoogleIcon className="h-4 w-4" />
            Kontynuuj z Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-fg-muted">
            <span className="h-px flex-1 bg-line" />
            lub
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-fg">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-fg">
                Hasło
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md border border-white/10 bg-success-emphasis py-1.5 text-sm font-medium text-white transition-colors hover:bg-success-hover disabled:opacity-50"
            >
              {loading ? 'Ładowanie…' : isSignUp ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </form>

        </div>

        <p className="mt-4 rounded-md border border-line p-4 text-center text-sm text-fg-default">
            {isSignUp ? 'Masz już konto?' : 'Nie masz konta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-accent hover:underline"
            >
              {isSignUp ? 'Zaloguj się' : 'Załóż konto'}
            </button>
        </p>

        <p className="mt-6 text-center text-xs text-fg-muted">
          Możesz też{' '}
          <Link href="/" className="text-accent hover:underline">
            kontynuować bez logowania
          </Link>
          {' '}(dane lokalne)
        </p>
      </div>
    </div>
  );
}
