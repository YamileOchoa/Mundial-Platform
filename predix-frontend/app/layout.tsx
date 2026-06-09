import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';
import Providers from '@/components/Providers';

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'PREDIX — Predice el Mundial 2026',
  description:
    'Compite con tus amigos prediciendo los resultados del Mundial de Fútbol 2026. Gana puntos, sube al ranking y desbloquea recompensas exclusivas.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${rubik.variable} h-full`}>
      <body className="h-full bg-white text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
