'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, DoorOpen, UserCircle,
  LogOut, X, Shield, Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

const ADMIN_NAV = [
  { href: '/admin',         label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/matches', label: 'Partidos',   icon: Calendar },
  { href: '/admin/users',   label: 'Usuarios',   icon: Users },
  { href: '/admin/rooms',   label: 'Salas',      icon: DoorOpen },
  { href: '/admin/players', label: 'Jugadores',  icon: UserCircle },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="border-b border-slate-100 px-5 py-6">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
              <Logo className="h-10 w-10" icon={Shield} />
              <div>
                <p className="text-sm font-bold text-slate-900">PREDIX Admin</p>
                <p className="text-[11px] font-medium text-primary">Management Mode</p>
              </div>
            </Link>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-primary-xlight text-primary shadow-sm ring-1 ring-primary-light'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-100 p-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Activity size={14} className="text-success" />
              Sistema operativo
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800 truncate">{user?.nombre}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-danger-light hover:text-danger"
          >
            <LogOut size={18} />
            Cerrar sesion admin
          </button>
        </div>
      </aside>
    </>
  );
}
