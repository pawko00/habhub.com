'use client';

import { AlertIcon, XIcon } from '@primer/octicons-react';

interface ErrorBannerProps {
  message: string | null;
  onClose: () => void;
}

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-fg"
    >
      <AlertIcon size={16} className="mt-0.5 flex-shrink-0 text-danger" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-fg-muted hover:text-fg"
        aria-label="Zamknij komunikat"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
