'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Trophy,
  Gift,
  Bot,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/home',        label: 'Inicio',         icon: LayoutDashboard },
  { href: '/rooms',       label: 'Mis Salas',      icon: Users },
  { href: '/predictions', label: 'Predicciones',   icon: ListChecks },
  { href: '/leaderboard', label: 'Ranking',         icon: Trophy },
  { href: '/rewards',     label: 'Recompensas',    icon: Gift },
  { href: '/chat',        label: 'Chat IA',         icon: Bot },
  { href: '/profile',     label: 'Mi Perfil',       icon: User },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-white border-r border-slate-100',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0 lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Header — mobile close btn */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 lg:hidden">
          <span className="text-lg font-bold text-slate-900">Menu</span>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Cerrar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-primary/8 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-primary' : 'text-slate-400'}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
}
