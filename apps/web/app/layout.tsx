import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'DSA Sheet — Track Your Progress',
  description: 'A structured DSA problem sheet to track your learning journey',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}


          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'Inter, system-ui, sans-serif' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
