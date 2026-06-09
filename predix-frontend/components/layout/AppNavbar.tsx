'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, ChevronDown, LogOut, Gift, Menu, X,
  ListChecks, Bot,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

const MAIN_NAV = [
  { href: '/home',       label: 'Inicio' },
  { href: '/rooms',      label: 'Mis Salas' },
  { href: '/matches',    label: 'Partidos' },
  { href: '/leaderboard', label: 'Ranking' },
  { href: '/profile',    label: 'Perfil' },
];

const EXTRA_NAV = [
  { href: '/predictions', label: 'Predicciones', icon: ListChecks },
  { href: '/rewards',     label: 'Recompensas',  icon: Gift },
  { href: '/chat',        label: 'Chat IA',      icon: Bot },
];

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/home' ? pathname === '/home' : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto h-[4.5rem] max-w-7xl px-5 sm:px-8">
          <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-6 lg:gap-10">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>
              <Link href="/home" className="flex items-center gap-3">
                <Logo className="h-10 w-10" />
                <div className="hidden sm:block">
                  <p className="text-base font-bold leading-none text-slate-900">PREDIX</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">Mundial 2026</p>
                </div>
              </Link>
            </div>

            {/* Nav centrada */}
            <nav className="hidden items-center justify-center gap-1 lg:flex">
              {MAIN_NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'relative px-5 py-2 text-[15px] font-medium transition-colors',
                    isActive(href)
                      ? 'text-primary'
                      : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute inset-x-3 -bottom-[1.35rem] h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Acciones derecha */}
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <button
                type="button"
                className="relative hidden rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 sm:flex"
                aria-label="Notificaciones"
              >
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white py-1.5 pl-1.5 pr-3 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary-xlight text-sm font-semibold text-primary">
                    {user?.foto_url
                      ? <img src={user.foto_url} alt="" className="h-9 w-9 object-cover" />
                      : user?.nombre?.charAt(0).toUpperCase() ?? 'U'
                    }
                  </div>
                  <div className="hidden min-w-0 text-left md:block">
                    <p className="max-w-[130px] truncate text-sm font-semibold text-slate-900">
                      {user?.nombre ?? 'Usuario'}
                    </p>
                    <p className="text-xs text-slate-400">Mi cuenta</p>
                  </div>
                  <ChevronDown size={16} className="hidden text-slate-400 md:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-100 bg-white py-1.5 shadow-modal">
                    {EXTRA_NAV.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Icon size={16} className="text-slate-400" /> {label}
                      </Link>
                    ))}
                    <div className="my-1.5 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-light"
                    >
                      <LogOut size={16} /> Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(300px,88vw)] flex-col bg-white shadow-modal">
            <div className="flex h-[4.5rem] items-center justify-between border-b border-slate-100 px-5">
              <div className="flex items-center gap-2">
                <Logo className="h-9 w-9" />
                <span className="font-bold text-slate-900">PREDIX</span>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {[...MAIN_NAV, ...EXTRA_NAV].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={[
                    'block rounded-lg px-4 py-3 text-[15px] font-medium',
                    isActive(item.href) ? 'bg-primary-xlight text-primary' : 'text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 p-4">
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-danger hover:bg-danger-light">
                <LogOut size={18} /> Cerrar sesion
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
