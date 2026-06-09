'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import Logo from '@/components/ui/Logo';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirm) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { registerUser } = await import('@/services/auth.service');
      await registerUser({ nombre: nombre.trim(), email, password });
      await login(email, password);
      router.push('/home');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'No se pudo crear la cuenta. Verifica los datos e intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left panel (branding) ── */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-2 text-white">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">PREDIX</span>
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <PlaceholderImage
            label="Imagen de bienvenida"
            aspectRatio="4/3"
            variant="dark"
            className="w-full max-w-md"
          />
          <div>
            <h2 className="text-3xl font-bold text-white">
              Únete a PREDIX
            </h2>
            <p className="mt-2 text-primary-light">
              Crea tu cuenta en segundos y empieza a competir con tus amigos.
            </p>
          </div>
        </div>

        <p className="text-sm text-primary-light/70">PREDIX · Mundial 2026</p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="text-lg font-bold text-slate-900">PREDIX</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
              <p className="mt-1 text-sm text-slate-500">
                Registrate para unirte al torneo de predicciones
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Nombre"
                type="text"
                placeholder="Tu nombre o apodo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                leftIcon={<User size={16} />}
                required
                autoComplete="name"
              />

              <Input
                label="Correo electronico"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
                autoComplete="email"
              />

              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                autoComplete="new-password"
              />

              <Input
                label="Confirmar contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                leftIcon={<Lock size={16} />}
                error={confirm && confirm !== password ? 'Las contraseñas no coinciden' : undefined}
                required
                autoComplete="new-password"
              />

              {error && (
                <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} fullWidth>
                Crear cuenta
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Inicia sesion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
