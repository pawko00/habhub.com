'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { HabitHeatmap } from '@/components/Heatmap';
import Link from 'next/link';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  const {
    isLoaded,
    getHabitWithStats,
    toggleCompletion,
    removeHabit,
    updateHabitName,
  } = useHabits();

  const habitWithStats = useMemo(
    () => (isLoaded ? getHabitWithStats(habitId) : null),
    [isLoaded, getHabitWithStats, habitId]
  );

  useEffect(() => {
    if (habitWithStats && !isEditing) {
      setEditedName(habitWithStats.name);
    }
  }, [habitWithStats, isEditing]);

  const handleDayClick = (date: string) => {
    toggleCompletion(habitId, date);
  };

  const handleDelete = () => {
    if (habitWithStats && confirm(`Czy na pewno chcesz usunąć nawyk "${habitWithStats.name}"?`)) {
      removeHabit(habitId);
      router.push('/');
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim() && editedName !== habitWithStats?.name) {
      await updateHabitName(habitId, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(habitWithStats?.name || '');
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0d1117' }}
      >
        <div className="animate-pulse" style={{ color: '#8b949e' }}>Ładowanie...</div>
      </div>
    );
  }

  if (!habitWithStats) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0d1117' }}
      >
        <div className="text-center">
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ color: '#e6edf3' }}
          >
            Nawyk nie został znaleziony
          </h1>
          <Link
            href="/"
            style={{ color: '#58a6ff' }}
            className="hover:underline"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 transition-colors"
          style={{ color: '#8b949e' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e6edf3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8b949e';
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Powrót
        </Link>

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-2 py-1 text-2xl font-semibold rounded-md outline-none"
                    style={{ 
                      backgroundColor: '#0d1117',
                      color: '#e6edf3',
                      border: '1px solid #58a6ff'
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1 text-sm rounded-md"
                    style={{ 
                      backgroundColor: '#238636',
                      color: '#ffffff'
                    }}
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(habitWithStats.name);
                    }}
                    className="px-3 py-1 text-sm rounded-md"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#8b949e',
                      border: '1px solid #30363d'
                    }}
                  >
                    Anuluj
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1 group">
                  <h1 
                    className="text-2xl font-semibold"
                    style={{ color: '#e6edf3' }}
                  >
                    {habitWithStats.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity"
                    style={{ color: '#8b949e' }}
                    title="Edytuj nazwę"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <p style={{ color: '#8b949e' }}>
                od {new Date(habitWithStats.createdAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{ 
                color: '#f85149',
                border: '1px solid #30363d',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.1)';
                e.currentTarget.style.borderColor = '#f85149';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#30363d';
              }}
            >
              Usuń nawyk
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className="p-4 rounded-md"
            style={{ 
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-md"
                style={{ backgroundColor: 'rgba(187, 128, 9, 0.15)' }}
              >
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8b949e' }}>Aktualny streak</p>
                <p 
                  className="text-xl font-semibold"
                  style={{ color: '#e6edf3' }}
                >
                  {habitWithStats.currentStreak} dni
                </p>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-md"
            style={{ 
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-md"
                style={{ backgroundColor: 'rgba(187, 128, 9, 0.15)' }}
              >
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8b949e' }}>Najdłuższy streak</p>
                <p 
                  className="text-xl font-semibold"
                  style={{ color: '#e6edf3' }}
                >
                  {habitWithStats.longestStreak} dni
                </p>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-md"
            style={{ 
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-md"
                style={{ backgroundColor: 'rgba(35, 134, 54, 0.15)' }}
              >
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8b949e' }}>Łącznie wykonań</p>
                <p 
                  className="text-xl font-semibold"
                  style={{ color: '#e6edf3' }}
                >
                  {habitWithStats.completedDates.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <section 
          className="p-4 rounded-md"
          style={{ 
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
          }}
        >
          <h2 
            className="text-base font-semibold mb-1"
            style={{ color: '#e6edf3' }}
          >
            Historia aktywności
          </h2>
          <p className="text-sm mb-4" style={{ color: '#8b949e' }}>
            Kliknij dzień, aby oznaczyć wykonanie nawyku.
          </p>
          <HabitHeatmap
            completedDates={habitWithStats.completedDates}
            onDayClick={handleDayClick}
            createdAt={habitWithStats.createdAt}
          />
        </section>
      </div>
    </div>
  );
}
