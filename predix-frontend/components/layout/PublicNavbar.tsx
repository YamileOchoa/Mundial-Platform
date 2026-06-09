'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#puntuacion', label: 'Puntuacion' },
  { href: '#recompensas', label: 'Recompensas' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-8 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Logo className="h-10 w-10" />
          <div>
            <p className="text-base font-bold leading-none text-slate-900">PREDIX</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">Mundial 2026</p>
          </div>
        </Link>

        {isHome && (
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-[15px] font-medium text-slate-600 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="md">Iniciar sesion</Button>
          </Link>
          <Link href="/register">
            <Button size="md">Registrarse</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
