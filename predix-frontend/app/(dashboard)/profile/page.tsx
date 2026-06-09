'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { User, Mail, Link as LinkIcon, CheckCircle2, ListChecks, Trophy, TrendingUp, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getMyStats, updateMe } from '@/services/auth.service';
import type { UserStats } from '@/types/auth';

interface StatRowProps { icon: React.ElementType; label: string; value: string | number; color: string }
function StatRow({ icon: Icon, label, value, color }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-slate-600">
        <Icon size={15} className={color} />
        {label}
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats]     = useState<UserStats | null>(null);
  const [nombre, setNombre]   = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setFotoUrl(user.foto_url ?? '');
    }
    getMyStats().then(setStats).catch(() => {});
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError('El nombre no puede estar vacío.'); return; }
    setError('');
    setSaving(true);
    try {
      await updateMe({ nombre: nombre.trim(), foto_url: fotoUrl.trim() || undefined });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="mt-1 text-sm text-slate-500">Administra tu informacion personal</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-5">

        {/* Formulario (3 cols) */}
        <Card className="sm:col-span-3">
          <h2 className="mb-5 text-base font-semibold text-slate-900">Datos personales</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {fotoUrl
                  ? <img src={fotoUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
                  : nombre.charAt(0).toUpperCase() || 'U'
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <Input
              label="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              leftIcon={<User size={15} />}
              required
            />
            <Input
              label="URL de foto de perfil"
              type="url"
              placeholder="https://..."
              value={fotoUrl}
              onChange={e => setFotoUrl(e.target.value)}
              leftIcon={<LinkIcon size={15} />}
              hint="Pega la URL de una imagen pública"
            />
            <Input
              label="Correo electronico"
              value={user.email}
              leftIcon={<Mail size={15} />}
              disabled
              hint="El correo no se puede cambiar"
            />

            {error && (
              <p className="rounded-md bg-danger-light px-3 py-2 text-xs text-red-700">{error}</p>
            )}

            <Button type="submit" loading={saving} className="self-start">
              {saved ? <><CheckCircle2 size={15} /> Guardado</> : 'Guardar cambios'}
            </Button>
          </form>
        </Card>

        {/* Stats (2 cols) */}
        <Card className="sm:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Estadisticas</h2>
          {stats ? (
            <div>
              <StatRow icon={ListChecks} label="Predicciones"   value={stats.total_predicciones}          color="text-primary"  />
              <StatRow icon={Trophy}    label="Aciertos"        value={stats.partidos_ganador_correcto}    color="text-success"  />
              <StatRow icon={TrendingUp} label="Puntos totales" value={stats.puntos_totales}               color="text-warning"  />
              <StatRow icon={Flame}     label="Racha maxima"    value={stats.racha_maxima_actual}          color="text-orange-400" />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="text-primary" />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
