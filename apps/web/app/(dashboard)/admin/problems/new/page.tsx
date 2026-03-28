'use client';

import { ProblemForm } from '@/components/admin/ProblemForm';

export default function NewProblemPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Problem</h1>
      <div className="card">
        <ProblemForm />
      </div>
    </div>
  );
}
