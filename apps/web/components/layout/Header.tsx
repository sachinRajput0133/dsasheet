'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { clearCredentials } from '@/lib/store/authSlice';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { baseApi } from '@/lib/store/api/baseApi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict';
      router.push('/login');
      toast.success('Logged out');
    }
  };

  return (
    <header className="sticky top-0 z-10 h-14 bg-white dark:bg-gray-900 border-b flex items-center px-4 gap-3">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden lg:flex"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user.name}</span>
            {user.role === 'admin' && (
              <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
