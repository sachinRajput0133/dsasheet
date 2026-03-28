import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export const metadata = { title: 'Sign Up — DSA Sheet' };

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-700 dark:text-brand-400">DSA Sheet</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Start your DSA journey today</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Create your account</h2>
          <SignupForm />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
