'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupMutation } from '@/lib/store/api/authApi';
import { useAppDispatch } from '@/lib/store/hooks';
import { setCredentials } from '@/lib/store/authSlice';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signup(form).unwrap();
      dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
      document.cookie = `accessToken=${result.data.accessToken}; path=/; max-age=900; SameSite=Strict`;
      toast.success(`Account created! Welcome, ${result.data.user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message ?? 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name
        </label>
        <input
          type="text"
          className="input"
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          minLength={2}
          autoComplete="name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          className="input"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
          <span className="text-xs text-gray-400 ml-1">(min 8 characters)</span>
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className="input pr-10"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
