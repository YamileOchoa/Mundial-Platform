'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Logo from '@/components/ui/Logo';

function AdminLoginForm() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') ?? '/admin';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const me = await authService.getMe();
      if (!me.es_admin_global) {
        logout();
        setError('Esta cuenta no tiene permisos de administrador.');
        return;
      }
      router.push(redirect);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Credenciales incorrectas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-[42%] flex-col justify-between bg-white border-r border-slate-100 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <Logo className="h-11 w-11" icon={Shield} />
          <div>
            <p className="text-lg font-bold text-slate-900">PREDIX Admin</p>
            <p className="text-sm text-slate-500">Panel de gestion</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Acceso administrativo</h2>
          <p className="max-w-sm text-slate-500 leading-relaxed">
            Gestiona partidos, usuarios, salas y jugadores del torneo Mundial 2026.
            Solo personal autorizado.
          </p>
          <div className="grid gap-3">
            {['Gestion de partidos y resultados', 'Moderacion de usuarios y salas', 'Catalogo de jugadores'].map(t => (
              <div key={t} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">PREDIX Admin · Mundial 2026</p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-5 lg:hidden">
          <Logo className="h-9 w-9" icon={Shield} />
          <span className="font-bold text-slate-900">PREDIX Admin</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Iniciar sesion admin</h1>
              <p className="mt-2 text-sm text-slate-500">
                Usa tus credenciales de administrador global
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
              <Input
                label="Correo electronico"
                type="email"
                placeholder="admin@predix.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                autoComplete="current-password"
              />
              {error && (
                <div className="rounded-lg bg-danger-light px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <Button type="submit" loading={loading} fullWidth>
                Acceder al panel
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              ¿Eres usuario?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Ir al login de jugadores
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner size="lg" className="text-primary" /></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
