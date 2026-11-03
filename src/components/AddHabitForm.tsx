'use client';

import { useState } from 'react';
import { HABIT_COLORS } from '@/lib/habit-colors';

interface AddHabitFormProps {
  initialColor: string;
  onAdd: (name: string, color: string) => unknown;
  onCancel: () => void;
}

export function AddHabitForm({ initialColor, onAdd, onCancel }: AddHabitFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(initialColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-line-muted px-4 py-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        placeholder="Czytanie 20 minut"
        maxLength={100}
        autoFocus
        aria-label="Nazwa nawyku"
        className="w-full rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ColorPicker value={color} onChange={setColor} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-line bg-canvas-overlay px-3 py-1 text-sm text-fg-default hover:border-fg-subtle"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="rounded-md border border-white/10 bg-success-emphasis px-3 py-1 text-sm font-medium text-white hover:bg-success-hover"
          >
            Dodaj nawyk
          </button>
        </div>
      </div>
    </form>
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Kolor nawyku" className="flex items-center gap-1.5">
      {HABIT_COLORS.map(c => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          aria-label={c.label}
          title={c.label}
          onClick={() => onChange(c.value)}
          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
            value === c.value ? 'border-fg-muted' : 'border-transparent hover:border-line'
          }`}
        >
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.value }} />
        </button>
      ))}
    </div>
  );
}
