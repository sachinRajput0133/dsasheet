'use client';

import { useGetTopicsQuery } from '@/lib/store/api/topicsApi';
import { useGetProgressStatsQuery, useGetTopicStatsQuery } from '@/lib/store/api/progressApi';
import { OverallProgress } from '@/components/progress/OverallProgress';
import { TopicProgressCard } from '@/components/progress/TopicProgressCard';
import { AlertCircle, Terminal } from 'lucide-react';

export default function DashboardPage() {
  const { data: topicsData, isLoading, isError } = useGetTopicsQuery();
  const { data: statsData } = useGetProgressStatsQuery();
  const { data: topicStatsData } = useGetTopicStatsQuery();

  const topics = topicsData?.data ?? [];
  const stats = statsData?.data;
  const topicStats: Array<{ _id: string; completedCount: number }> = topicStatsData?.data ?? [];
  const topicStatsMap = new Map(topicStats.map((s) => [s._id, s.completedCount]));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your DSA progress overview</p>
      </div>

      {/* API error banner */}
      {isError && (
        <div className="card border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">Cannot connect to API</p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
              Make sure the API server is running: <code className="font-mono bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">make api</code>
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton for overall progress */}
      {isLoading && !stats && (
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
        </div>
      )}

      {/* Overall progress */}
      {stats && <OverallProgress stats={stats} />}

      {/* Per-topic progress grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Progress by Topic</h2>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* No data — seed needed */}
        {!isLoading && !isError && topics.length === 0 && (
          <div className="card border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 flex items-start gap-3">
            <Terminal className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-400">No topics found</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                Seed the database to get started:
              </p>
              <code className="mt-2 block font-mono text-xs bg-yellow-100 dark:bg-yellow-900/40 px-3 py-2 rounded">
                make seed
              </code>
            </div>
          </div>
        )}

        {/* Topic cards */}
        {!isLoading && topics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicProgressCard
                key={topic._id}
                topic={topic}
                completedCount={topicStatsMap.get(topic._id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
