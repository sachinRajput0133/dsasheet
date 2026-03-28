'use client';

import { use } from 'react';
import { useGetTopicQuery } from '@/lib/store/api/topicsApi';
import { useGetProblemsQuery } from '@/lib/store/api/problemsApi';
import { useGetProgressQuery } from '@/lib/store/api/progressApi';
import { ProblemTable } from '@/components/problems/ProblemTable';
import { ProgressBar } from '@/components/progress/ProgressBar';

interface Props {
  params: Promise<{ topicId: string }>;
}

export default function TopicPage({ params }: Props) {
  const { topicId } = use(params);
  const { data: topicData, isLoading: topicLoading } = useGetTopicQuery(topicId);
  const { data: problemsData, isLoading: problemsLoading } = useGetProblemsQuery({ topicId });
  const { data: progressData } = useGetProgressQuery();

  const topic = topicData?.data;
  const problems = problemsData?.data?.problems ?? [];
  const progress: Record<string, boolean> = progressData?.data ?? {};

  const completedCount = problems.filter((p) => progress[p._id]).length;
  const percentage = problems.length > 0 ? Math.round((completedCount / problems.length) * 100) : 0;

  if (topicLoading || problemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{topic?.title}</h1>
        {topic?.description && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
        )}
      </div>

      {/* Progress for this topic */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedCount} / {problems.length} solved
          </span>
          <span className="text-sm font-semibold text-brand-600">{percentage}%</span>
        </div>
        <ProgressBar percentage={percentage} />
      </div>

      {/* Problems table */}
      <ProblemTable problems={problems} progress={progress} />
    </div>
  );
}
