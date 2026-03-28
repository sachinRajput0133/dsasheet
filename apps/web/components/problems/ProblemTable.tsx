'use client';

import { ProblemRow } from './ProblemRow';
import type { Problem } from '@/lib/types';

interface Props {
  problems: Problem[];
  progress: Record<string, boolean>;
}

export function ProblemTable({ problems, progress }: Props) {
  if (problems.length === 0) {
    return (
      <div className="card text-center text-gray-500 dark:text-gray-400 py-12">
        No problems found for this topic.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
              <th className="w-10 p-3 text-center">#</th>
              <th className="p-3 text-left font-semibold">Problem</th>
              <th className="p-3 text-center font-semibold hidden sm:table-cell">Difficulty</th>
              <th className="p-3 text-center font-semibold hidden md:table-cell">Tags</th>
              <th className="p-3 text-center font-semibold">Links</th>
              <th className="w-16 p-3 text-center font-semibold">Done</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {problems.map((problem, idx) => (
              <ProblemRow
                key={problem._id}
                problem={problem}
                index={idx + 1}
                completed={progress[problem._id] ?? false}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
