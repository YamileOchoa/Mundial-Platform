'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppNavbar from '@/components/layout/AppNavbar';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.es_admin_global) {
        router.replace('/admin');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!user || user.es_admin_global) return null;

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
