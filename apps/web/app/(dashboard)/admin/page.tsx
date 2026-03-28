'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { useGetProblemsQuery } from '@/lib/store/api/problemsApi';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AdminPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: problemsData } = useGetProblemsQuery({});

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied. Admin only.</p>
      </div>
    );
  }

  const problems = problemsData?.data?.problems ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage problems and topics</p>
        </div>
        <Link href="/admin/problems/new" className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Problem
        </Link>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">All Problems ({problems.length})</h2>
        <div className="divide-y dark:divide-gray-800">
          {problems.map((p) => (
            <div key={p._id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">{p.difficulty}</p>
              </div>
              <Link
                href={`/admin/problems/${p._id}/edit`}
                className="text-sm text-brand-600 hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
