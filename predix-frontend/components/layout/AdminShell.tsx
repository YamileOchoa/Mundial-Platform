'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, RefreshCw, Shield } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/admin/login');
      else if (!user.es_admin_global) router.replace('/admin/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!user?.es_admin_global) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-primary-xlight text-primary sm:flex">
                <Shield size={18} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900">Panel de Administracion</h1>
                <p className="text-xs text-slate-400">Gestion del torneo Mundial 2026</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Actualizar
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
