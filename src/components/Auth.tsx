'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
        className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors text-sm text-[#c9d1d9]"
      >
        Zaloguj się
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors"
        aria-haspopup="menu"
        aria-expanded={showDropdown}
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element -- zewnętrzny avatar Google, next/image wymagałby konfiguracji domen
          <img
            src={user.photoURL}
            alt="Avatar"
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#238636] flex items-center justify-center text-xs font-medium text-white">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-sm text-[#c9d1d9] hidden sm:inline">
          {user.displayName || user.email?.split('@')[0]}
        </span>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg z-20"
          >
            <div className="px-4 py-2 border-b border-[#30363d]">
              <p className="text-sm text-[#c9d1d9] truncate">{user.email}</p>
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
              className="w-full text-left px-4 py-2 text-sm text-[#f85149] hover:bg-[#21262d] transition-colors"
            >
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
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-pulse text-[#8b949e]">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#c9d1d9] mb-2">Habit Tracker</h1>
          <p className="text-[#8b949e]">Śledź swoje nawyki jak na GitHubie</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors mb-6 disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5" />
            <span className="text-[#c9d1d9] font-medium">Kontynuuj z Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#30363d]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#161b22] text-[#8b949e]">lub</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-[#c9d1d9] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#c9d1d9] mb-1.5">
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
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#f85149]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Ładowanie...' : isSignUp ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[#8b949e]">
            {isSignUp ? 'Masz już konto?' : 'Nie masz konta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-[#58a6ff] hover:underline"
            >
              {isSignUp ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#8b949e]">
          Możesz też{' '}
          <Link href="/" className="text-[#58a6ff] hover:underline">
            kontynuować bez logowania
          </Link>
          {' '}(dane lokalne)
        </p>
      </div>
    </div>
  );
}
