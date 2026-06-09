'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#puntuacion', label: 'Puntuacion' },
  { href: '#recompensas', label: 'Recompensas' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative h-8 w-8 overflow-hidden rounded-md bg-slate-100">
            {/* Logo placeholder — replace src when image is ready */}
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
              P
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            PREDIX
          </span>
        </Link>

        {/* Nav links — visible only on home page, desktop */}
        {isHome && (
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Iniciar sesion
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Registrarse
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
