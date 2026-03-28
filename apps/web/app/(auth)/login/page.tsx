import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata = { title: 'Login — DSA Sheet' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">DSA Sheet</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Track your DSA problem progress</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
