'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DayStats } from '@/types/habit';
import { formatDate, getLast365Days, getWeeksArray, parseDate } from '@/lib/utils';

const CELL = 10;
const MAX_CELL = 15;
const GAP = 3;
const DAY_LABEL_WIDTH = 28;
const MIN_WEEKS = 8;

const LEVEL_CLASSES = [
  'bg-contrib-0 outline outline-1 -outline-offset-1 outline-line-muted',
  'bg-contrib-1',
  'bg-contrib-2',
  'bg-contrib-3',
  'bg-contrib-4',
];

const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
// Tygodnie zaczynają się w niedzielę, etykiety jak na GitHubie: co drugi dzień
const DAY_LABELS = ['', 'Pn', '', 'Śr', '', 'Pt', ''];

export type DayCell =
  | { kind: 'level'; level: 0 | 1 | 2 | 3 | 4; title: string }
  | { kind: 'disabled'; title: string };

interface ContributionGraphProps {
  title: ReactNode;
  getCell: (date: string) => DayCell;
  onDayClick?: (date: string) => void;
  selectedDate?: string | null;
  hint?: ReactNode;
  legend?: ReactNode;
}

// Liczba tygodni dopasowana do szerokości ramki. Gdy mieści się cały rok,
// kwadraty rosną (do MAX_CELL), żeby wypełnić szerokość; gdy nie - ucinamy najstarsze tygodnie.
function useGridLayout(totalWeeks: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ visible: number; cell: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - DAY_LABEL_WIDTH;
      const fits = Math.floor((available + GAP) / (CELL + GAP));
      if (fits >= totalWeeks) {
        const cell = Math.min(MAX_CELL, Math.floor((available + GAP) / totalWeeks) - GAP);
        setLayout({ visible: totalWeeks, cell });
      } else {
        setLayout({ visible: Math.max(MIN_WEEKS, fits), cell: CELL });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [totalWeeks]);

  return { ref, layout };
}

export function ContributionGraph({
  title,
  getCell,
  onDayClick,
  selectedDate,
  hint,
  legend,
}: ContributionGraphProps) {
  const allWeeks = useMemo(() => getWeeksArray(getLast365Days()), []);
  const { ref, layout } = useGridLayout(allWeeks.length);
  const visible = layout?.visible ?? null;
  const cellSize = layout?.cell ?? CELL;
  const step = cellSize + GAP;
  const weeks = useMemo(
    () => (visible === null ? [] : allWeeks.slice(allWeeks.length - visible)),
    [allWeeks, visible]
  );
  const today = formatDate(new Date());

  const monthLabels = useMemo(() => {
    const months = weeks.map(week => {
      const first = week.find(d => d !== '');
      return first ? parseDate(first).getMonth() : -1;
    });
    const labels = months.map((month, i) =>
      month !== -1 && (i === 0 || month !== months[i - 1]) ? MONTHS[month] : ''
    );
    // Etykieta pierwszej kolumny nachodziłaby na następną, jeśli miesiąc zaraz się zmienia
    if (labels[0] && (labels[1] || labels[2])) labels[0] = '';
    return labels;
  }, [weeks]);

  const rangeLabel = visible === null ? '' : visible >= allWeeks.length ? 'Ostatni rok' : `Ostatnie ${visible} tyg.`;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] text-fg">{title}</h2>
        <span className="text-xs text-fg-muted">{rangeLabel}</span>
      </div>

      <div className="rounded-md border border-line px-3 py-3 sm:px-4">
        <div ref={ref} className="w-full">
          {/* Stała wysokość, żeby strona nie skakała przed pierwszym pomiarem */}
          <div className="flex justify-end" style={{ height: 7 * step + 18 }}>
            <div className="flex flex-col pr-1.5 pt-[18px] text-[10px] leading-[10px] text-fg-muted" style={{ width: DAY_LABEL_WIDTH, gap: GAP }}>
              {DAY_LABELS.map((label, i) => (
                <span key={i} className="flex items-center" style={{ height: cellSize }}>{label}</span>
              ))}
            </div>

            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, weekIdx) => (
                <div key={week.find(d => d) ?? weekIdx} className="flex flex-col" style={{ gap: GAP, width: cellSize }}>
                  <span className="h-[15px] overflow-visible whitespace-nowrap text-[10px] leading-[15px] text-fg-muted">
                    {monthLabels[weekIdx]}
                  </span>
                  {week.map((date, dayIdx) => {
                    if (!date) return <span key={`empty-${dayIdx}`} style={{ width: cellSize, height: cellSize }} />;

                    const cell = getCell(date);
                    const isSelected = selectedDate === date;
                    const isToday = date === today;
                    const ringClass = isSelected
                      ? 'outline outline-2 -outline-offset-1 outline-accent'
                      : isToday
                        ? 'outline outline-1 -outline-offset-1 outline-fg-muted'
                        : '';

                    if (cell.kind === 'disabled') {
                      return (
                        <span
                          key={date}
                          title={cell.title}
                          className="rounded-[2px] bg-canvas outline outline-1 -outline-offset-1 outline-line-muted/50"
                          style={{ width: cellSize, height: cellSize }}
                        />
                      );
                    }

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={onDayClick ? () => onDayClick(date) : undefined}
                        title={cell.title}
                        aria-label={cell.title}
                        className={`rounded-[2px] ${LEVEL_CLASSES[cell.level]} ${ringClass} ${onDayClick ? 'cursor-pointer hover:outline-2 hover:outline-accent' : 'cursor-default'}`}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs text-fg-muted">
          <span>{hint}</span>
          {legend ?? (
            <span className="flex items-center gap-[3px]">
              Mniej
              {LEVEL_CLASSES.map((cls, i) => (
                <span key={i} className={`mx-px rounded-[2px] ${cls}`} style={{ width: CELL, height: CELL }} />
              ))}
              Więcej
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function levelForPercentage(percentage: number): 0 | 1 | 2 | 3 | 4 {
  if (percentage === 0) return 0;
  if (percentage <= 25) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 75) return 3;
  return 4;
}

function formatLongDate(date: string): string {
  return parseDate(date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface GlobalHeatmapProps {
  title: ReactNode;
  dayStats: Map<string, DayStats>;
  onDayClick: (date: string) => void;
  selectedDate?: string | null;
}

export function GlobalHeatmap({ title, dayStats, onDayClick, selectedDate }: GlobalHeatmapProps) {
  const getCell = (date: string): DayCell => {
    const stats = dayStats.get(date);
    const percentage = stats?.percentage ?? 0;
    return {
      kind: 'level',
      level: levelForPercentage(percentage),
      title: stats && stats.total > 0
        ? `${formatLongDate(date)}: ${stats.completed} z ${stats.total} nawyków`
        : `${formatLongDate(date)}: brak nawyków`,
    };
  };

  return (
    <ContributionGraph
      title={title}
      getCell={getCell}
      onDayClick={onDayClick}
      selectedDate={selectedDate}
      hint="Kolor to procent nawyków wykonanych danego dnia"
    />
  );
}

interface HabitHeatmapProps {
  title: ReactNode;
  completedDates: string[];
  createdAt: string;
  onDayClick: (date: string) => void;
}

export function HabitHeatmap({ title, completedDates, createdAt, onDayClick }: HabitHeatmapProps) {
  const completed = useMemo(() => new Set(completedDates), [completedDates]);
  const today = formatDate(new Date());

  const getCell = (date: string): DayCell => {
    if (date < createdAt) return { kind: 'disabled', title: `${formatLongDate(date)}: przed utworzeniem nawyku` };
    if (date > today) return { kind: 'disabled', title: formatLongDate(date) };
    const done = completed.has(date);
    return {
      kind: 'level',
      level: done ? 4 : 0,
      title: `${formatLongDate(date)}: ${done ? 'wykonano' : 'nie wykonano'}`,
    };
  };

  return (
    <ContributionGraph
      title={title}
      getCell={getCell}
      onDayClick={onDayClick}
      hint="Kliknij dzień, aby oznaczyć wykonanie"
      legend={
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`rounded-[2px] ${LEVEL_CLASSES[0]}`} style={{ width: CELL, height: CELL }} />
            Nie wykonano
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`rounded-[2px] ${LEVEL_CLASSES[4]}`} style={{ width: CELL, height: CELL }} />
            Wykonano
          </span>
        </span>
      }
    />
  );
}
