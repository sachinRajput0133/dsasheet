'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProblemMutation, useUpdateProblemMutation } from '@/lib/store/api/problemsApi';
import { useGetTopicsQuery } from '@/lib/store/api/topicsApi';
import type { Problem } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props {
  initialData?: Problem;
  problemId?: string;
}

export function ProblemForm({ initialData, problemId }: Props) {
  const router = useRouter();
  const { data: topicsData } = useGetTopicsQuery();
  const [create, { isLoading: creating }] = useCreateProblemMutation();
  const [update, { isLoading: updating }] = useUpdateProblemMutation();

  const [form, setForm] = useState({
    topicId: initialData?.topicId ?? '',
    title: initialData?.title ?? '',
    difficulty: (initialData?.difficulty ?? 'Easy') as 'Easy' | 'Medium' | 'Hard',
    tags: initialData?.tags?.join(', ') ?? '',
    youtubeLink: initialData?.youtubeLink ?? '',
    codingLink: initialData?.codingLink ?? '',
    articleLink: initialData?.articleLink ?? '',
    description: initialData?.description ?? '',
    order: initialData?.order ?? 0,
  });

  const isLoading = creating || updating;
  const topics = topicsData?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (problemId) {
        await update({ id: problemId, ...payload }).unwrap();
        toast.success('Problem updated');
      } else {
        await create(payload).unwrap();
        toast.success('Problem created');
      }
      router.push('/admin');
    } catch {
      toast.error('Failed to save problem');
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        className="input"
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Topic *
        </label>
        <select
          className="input"
          value={form.topicId}
          onChange={(e) => setForm({ ...form, topicId: e.target.value })}
          required
        >
          <option value="">Select topic...</option>
          {topics.map((t) => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>
      </div>

      {field('Title *', 'title')}

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Difficulty *
        </label>
        <select
          className="input"
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {field('Tags (comma-separated)', 'tags')}
      {field('YouTube Link', 'youtubeLink', 'url')}
      {field('LeetCode / Coding Link', 'codingLink', 'url')}
      {field('Article Link', 'articleLink', 'url')}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optional markdown)
        </label>
        <textarea
          className="input min-h-24 resize-y"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional problem description in markdown..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : problemId ? 'Update Problem' : 'Create Problem'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push('/admin')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
