'use client';

import { useToggleProgressMutation } from '@/lib/store/api/progressApi';
import type { Problem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Youtube, Code2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  problem: Problem;
  index: number;
  completed: boolean;
}

const difficultyClass = {
  Easy: 'difficulty-badge difficulty-easy',
  Medium: 'difficulty-badge difficulty-medium',
  Hard: 'difficulty-badge difficulty-hard',
};

export function ProblemRow({ problem, index, completed }: Props) {
  const [toggle, { isLoading }] = useToggleProgressMutation();

  const handleToggle = async () => {
    try {
      await toggle({ problemId: problem._id, completed: !completed }).unwrap();
    } catch {
      toast.error('Failed to update progress');
    }
  };

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30',
        completed && 'bg-green-50/50 dark:bg-green-900/5',
      )}
    >
      {/* Index */}
      <td className="p-3 text-center text-gray-400 text-xs">{index}</td>

      {/* Title */}
      <td className="p-3">
        <span className={cn('font-medium', completed && 'line-through text-gray-400')}>
          {problem.title}
        </span>
      </td>

      {/* Difficulty */}
      <td className="p-3 text-center hidden sm:table-cell">
        <span className={difficultyClass[problem.difficulty]}>{problem.difficulty}</span>
      </td>

      {/* Tags */}
      <td className="p-3 hidden md:table-cell">
        <div className="flex flex-wrap gap-1 justify-center">
          {problem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{problem.tags.length - 3}</span>
          )}
        </div>
      </td>

      {/* Links */}
      <td className="p-3">
        <div className="flex items-center justify-center gap-2">
          {problem.youtubeLink && (
            <a
              href={problem.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-600 transition-colors"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {problem.codingLink && (
            <a
              href={problem.codingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-600 transition-colors"
              title="Coding Platform"
            >
              <Code2 className="w-4 h-4" />
            </a>
          )}
          {problem.articleLink && (
            <a
              href={problem.articleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-600 transition-colors"
              title="Article"
            >
              <BookOpen className="w-4 h-4" />
            </a>
          )}
        </div>
      </td>

      {/* Checkbox */}
      <td className="p-3 text-center">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all',
            completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400',
            isLoading && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </td>
    </tr>
  );
}
