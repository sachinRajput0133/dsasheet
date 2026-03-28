'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ percentage, size = 'md', className }: ProgressBarProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const clamped = Math.min(100, Math.max(0, percentage));

  const color =
    clamped >= 80
      ? 'bg-green-500'
      : clamped >= 50
        ? 'bg-brand-500'
        : clamped >= 25
          ? 'bg-yellow-400'
          : 'bg-red-400';

  return (
    <div
      className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        heights[size],
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
