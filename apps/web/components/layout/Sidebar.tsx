'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, AlertCircle } from 'lucide-react';
import { useGetTopicsQuery } from '@/lib/store/api/topicsApi';
import { useGetProgressQuery, useGetProgressStatsQuery } from '@/lib/store/api/progressApi';
import { useGetProblemsQuery } from '@/lib/store/api/problemsApi';
import { useAppSelector } from '@/lib/store/hooks';
import { ProgressBar } from '../progress/ProgressBar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
  const { data: topicsData, isLoading: topicsLoading, isError: topicsError } = useGetTopicsQuery();
  const { data: progressData } = useGetProgressQuery();
  const { data: statsData } = useGetProgressStatsQuery();

  const topics = topicsData?.data ?? [];
  const progress: Record<string, boolean> = progressData?.data ?? {};
  const stats = statsData?.data;

  return (
    <aside
      className={cn(
        'sidebar z-30 flex flex-col',
        !isOpen && '-translate-x-full',
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-brand-600 text-lg">
          DSA Sheet
        </Link>
      </div>

      {/* Overall progress bar */}
      {stats && (
        <div className="px-4 py-3 border-b">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span className="font-semibold text-brand-600">{stats.percentage}%</span>
          </div>
          <ProgressBar percentage={stats.percentage} size="sm" />
          <p className="text-xs text-gray-400 mt-1">
            {stats.completed}/{stats.total} problems
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          active={pathname === '/dashboard'}
        />

        <div className="px-3 mt-4 mb-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Topics</p>
        </div>

        {/* Loading skeleton */}
        {topicsLoading && (
          <div className="px-3 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {topicsError && !topicsLoading && (
          <div className="mx-3 mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">API unreachable</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                Make sure the API server is running on port 3001
              </p>
            </div>
          </div>
        )}

        {/* Empty state (loaded but no seed data) */}
        {!topicsLoading && !topicsError && topics.length === 0 && (
          <div className="mx-3 mt-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">No topics found</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">
              Run <code className="font-mono bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">make seed</code> to populate the database
            </p>
          </div>
        )}

        {/* Topic list */}
        {topics.map((topic) => (
          <TopicNavItem
            key={topic._id}
            topic={topic}
            progress={progress}
            active={pathname.startsWith(`/topics/${topic._id}`)}
          />
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="px-3 mt-4 mb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            <NavItem
              href="/admin"
              icon={<Shield className="w-4 h-4" />}
              label="Admin Panel"
              active={pathname.startsWith('/admin')}
            />
          </>
        )}
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function TopicNavItem({
  topic,
  progress,
  active,
}: {
  topic: { _id: string; title: string };
  progress: Record<string, boolean>;
  active: boolean;
}) {
  const { data: problemsData } = useGetProblemsQuery({ topicId: topic._id });
  const problems = problemsData?.data?.problems ?? [];
  const completed = problems.filter((p) => progress[p._id]).length;
  const total = problems.length;

  return (
    <Link
      href={`/topics/${topic._id}`}
      className={cn(
        'flex items-center justify-between mx-2 px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
      )}
    >
      <span className="font-medium truncate">{topic.title}</span>
      {total > 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
          {completed}/{total}
        </span>
      )}
    </Link>
  );
}
