'use client';

import { useState } from 'react';

interface AddHabitFormProps {
  onAdd: (name: string) => unknown;
}

export function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{ 
          backgroundColor: '#238636',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2ea043';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#238636';
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nowy nawyk
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nazwa nawyku..."
        maxLength={100}
        aria-label="Nazwa nawyku"
        autoFocus
        className="flex-1 min-w-0 px-3 py-1.5 rounded-md text-sm outline-none"
        style={{
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          color: '#e6edf3',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#58a6ff';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88, 166, 255, 0.3)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#30363d';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{ 
          backgroundColor: '#238636',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2ea043';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#238636';
        }}
      >
        Dodaj
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: '#21262d',
          color: '#c9d1d9',
          border: '1px solid #30363d',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#30363d';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#21262d';
        }}
      >
        Anuluj
      </button>
    </form>
  );
}
