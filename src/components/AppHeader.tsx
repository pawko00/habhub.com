'use client';

import Link from 'next/link';
import { CheckboxIcon } from '@primer/octicons-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthButton } from '@/components/Auth';

export function AppHeader() {
  const { user } = useAuth();
  const username = user ? user.displayName?.split(' ')[0] || user.email?.split('@')[0] : null;

  return (
    <header className="border-b border-line bg-canvas-inset">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-fg hover:text-fg-default">
          <CheckboxIcon size={24} />
          <span className="font-semibold">habhub</span>
        </Link>
        {username && (
          <span className="hidden truncate text-sm text-fg-muted sm:inline">/ {username}</span>
        )}
        <span className="flex-1" />
        <AuthButton />
      </div>
    </header>
  );
}
