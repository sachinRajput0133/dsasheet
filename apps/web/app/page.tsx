import { redirect } from 'next/navigation';

// Root page — middleware handles redirect, but keep as fallback
export default function RootPage() {
  redirect('/dashboard');
}
