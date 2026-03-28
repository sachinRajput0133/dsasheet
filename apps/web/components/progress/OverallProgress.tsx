'use client';

import { ProgressBar } from './ProgressBar';
import type { ProgressStats } from '@/lib/types';

export function OverallProgress({ stats }: { stats: ProgressStats }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {stats.completed} of {stats.total} problems solved
          </p>
        </div>
        <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
          {stats.percentage}%
        </div>
      </div>
      <ProgressBar percentage={stats.percentage} size="lg" />
    </div>
  );
}
