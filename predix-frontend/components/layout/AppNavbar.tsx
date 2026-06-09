'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, User, LogOut, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AppNavbarProps {
  onMenuToggle?: () => void;
}

export default function AppNavbar({ onMenuToggle }: AppNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onMenuToggle}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/home" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-400">
              P
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
              PREDIX
            </span>
          </Link>
        </div>

        {/* Right: notification bell + user menu */}
        <div className="flex items-center gap-1">

          {/* Notifications */}
          <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100">
            <Bell size={20} />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user?.nombre?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden max-w-[120px] truncate sm:block">
                {user?.nombre ?? 'Usuario'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={15} />
                  Mi perfil
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
