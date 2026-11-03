import { ReactNode } from 'react';

export interface StatCardItem {
  icon: ReactNode;
  label: string;
  value: string;
}

export function StatCards({ items }: { items: StatCardItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(item => (
        <div key={item.label} className="min-w-0 rounded-md border border-line px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-start gap-1.5 text-xs leading-4 text-fg-muted">
            <span className="mt-px hidden flex-shrink-0 sm:inline">{item.icon}</span>
            {item.label}
          </div>
          <div className="mt-1 truncate font-mono text-base text-fg sm:text-xl">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
