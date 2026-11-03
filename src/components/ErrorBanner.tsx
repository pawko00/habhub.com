'use client';

interface ErrorBannerProps {
  message: string | null;
  onClose: () => void;
}

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-3 rounded-md px-4 py-3 text-sm"
      style={{
        backgroundColor: 'rgba(248, 81, 73, 0.1)',
        border: '1px solid rgba(248, 81, 73, 0.4)',
        color: '#f85149',
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-80 hover:opacity-100"
        aria-label="Zamknij komunikat"
      >
        ✕
      </button>
    </div>
  );
}
