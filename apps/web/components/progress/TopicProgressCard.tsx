'use client';

import Link from 'next/link';
import { ProgressBar } from './ProgressBar';
import { useGetProblemsQuery } from '@/lib/store/api/problemsApi';
import type { Topic } from '@/lib/types';

interface Props {
  topic: Topic;
  completedCount: number;
}

export function TopicProgressCard({ topic, completedCount }: Props) {
  const { data: problemsData } = useGetProblemsQuery({ topicId: topic._id });
  const total = problemsData?.data?.total ?? 0;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <Link
      href={`/topics/${topic._id}`}
      className="card hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm group-hover:text-brand-600 transition-colors">
          {topic.title}
        </h3>
        <span className="text-xs font-bold text-brand-600">{percentage}%</span>
      </div>
      <ProgressBar percentage={percentage} size="sm" />
      <p className="text-xs text-gray-400 mt-2">
        {completedCount}/{total} problems
      </p>
    </Link>
  );
}
