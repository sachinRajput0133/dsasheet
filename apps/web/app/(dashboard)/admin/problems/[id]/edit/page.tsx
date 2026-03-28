'use client';

import { use } from 'react';
import { ProblemForm } from '@/components/admin/ProblemForm';
import { useGetProblemQuery } from '@/lib/store/api/problemsApi';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProblemPage({ params }: Props) {
  const { id } = use(params);
  const { data, isLoading } = useGetProblemQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Problem</h1>
      <div className="card">
        <ProblemForm initialData={data?.data} problemId={id} />
      </div>
    </div>
  );
}
