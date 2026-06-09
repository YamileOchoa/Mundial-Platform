'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Gift, Download, Lock, Trophy } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { getMyRewards, getRewardPdf } from '@/services/rewards.service';
import { getMyStats } from '@/services/auth.service';
import type { Reward } from '@/types/reward';
import { SOBRE_META, SOBRE_GOALS } from '@/types/reward';
import type { UserStats } from '@/types/auth';

function RewardCard({ reward, onDownload, downloading }: {
  reward: Reward;
  onDownload: (id: number) => void;
  downloading: boolean;
}) {
  const meta = SOBRE_META[reward.tipo_sobre] ?? SOBRE_META.bronce;

  return (
    <Card className={`flex flex-col gap-4 border ${meta.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-card">
          <Gift size={22} className={meta.color} />
        </div>
        <Badge variant="success">Obtenido</Badge>
      </div>
      <div>
        <p className="font-semibold text-slate-900">{meta.label}</p>
        <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100/80 pt-3">
        <span className="text-xs text-slate-400">
          {new Date(reward.fecha_obtenida).toLocaleDateString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
        {reward.pdf_url ? (
          <Button size="sm" variant="outline" loading={downloading} onClick={() => onDownload(reward.id)}>
            <Download size={14} /> PDF
          </Button>
        ) : (
          <span className="text-xs text-slate-400">PDF pendiente</span>
        )}
      </div>
    </Card>
  );
}

function LockedCard({ tipo, stats }: { tipo: keyof typeof SOBRE_META; stats: UserStats | null }) {
  const meta = SOBRE_META[tipo];
  const goal = SOBRE_GOALS.find(g => g.tipo === tipo);
  let progress = '';
  if (goal?.puntos && stats) {
    progress = `${stats.puntos_totales} / ${goal.puntos} pts`;
  } else if (goal?.racha && stats) {
    progress = `Racha ${stats.racha_maxima_actual} / ${goal.racha}`;
  }

  return (
    <Card className="flex flex-col gap-4 opacity-75">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
          <Lock size={20} className="text-slate-400" />
        </div>
        <Badge variant="muted">Bloqueado</Badge>
      </div>
      <div>
        <p className="font-semibold text-slate-700">{meta.label}</p>
        <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
        {progress && <p className="mt-2 text-xs font-medium text-slate-400">{progress}</p>}
      </div>
    </Card>
  );
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rewardsData, statsData] = await Promise.all([
        getMyRewards(),
        getMyStats(),
      ]);
      setRewards(rewardsData);
      setStats(statsData);
    } catch {
      setError('No pudimos cargar tus recompensas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rewardsData, statsData] = await Promise.all([
          getMyRewards(),
          getMyStats(),
        ]);
        if (!cancelled) {
          setRewards(rewardsData);
          setStats(statsData);
        }
      } catch {
        if (!cancelled) setError('No pudimos cargar tus recompensas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      const url = await getRewardPdf(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      alert('El PDF aun no esta disponible.');
    } finally {
      setDownloadingId(null);
    }
  };

  const earnedTypes = new Set(rewards.map(r => r.tipo_sobre));
  const lockedTypes = (['bronce', 'plata', 'oro', 'sorpresa'] as const).filter(t => !earnedTypes.has(t));

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  const totalGoals = 4;
  const progress = stats ? Math.min(100, Math.round((rewards.length / totalGoals) * 100)) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Hero album */}
      <section className="overflow-hidden rounded-2xl border border-primary-light bg-gradient-to-br from-primary-xlight via-white to-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <p className="text-sm font-semibold text-primary">Tu album del Mundial</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Mis Recompensas</h1>
            <p className="mt-3 text-slate-600">
              Desbloquea sobres de cromos al acumular puntos y mantener rachas de aciertos.
            </p>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{rewards.length} / {totalGoals} sobres</span>
                <span className="font-semibold text-primary">{progress}% completo</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <Link href="/predictions" className="shrink-0">
            <Button size="md"><Trophy size={16} /> Hacer predicciones</Button>
          </Link>
        </div>
      </section>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card padding="sm">
            <p className="text-xs text-slate-500">Puntos totales</p>
            <p className="text-xl font-bold text-slate-900">{stats.puntos_totales}</p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-slate-500">Racha maxima</p>
            <p className="text-xl font-bold text-slate-900">{stats.racha_maxima_actual}</p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-slate-500">Sobres obtenidos</p>
            <p className="text-xl font-bold text-primary">{rewards.length}</p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-slate-500">Por desbloquear</p>
            <p className="text-xl font-bold text-slate-900">{lockedTypes.length}</p>
          </Card>
        </div>
      )}

      {rewards.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Sobres obtenidos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rewards.map(r => (
              <RewardCard
                key={r.id}
                reward={r}
                onDownload={handleDownload}
                downloading={downloadingId === r.id}
              />
            ))}
          </div>
        </section>
      )}

      {lockedTypes.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-slate-800">Por desbloquear</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lockedTypes.map(tipo => (
              <LockedCard key={tipo} tipo={tipo} stats={stats} />
            ))}
          </div>
        </section>
      )}

      {rewards.length === 0 && lockedTypes.length === 4 && (
        <Card>
          <EmptyState
            icon={Gift}
            title="Aun no tienes sobres"
            description="Predice resultados, suma puntos y desbloquea coleccionables exclusivos del Mundial 2026."
            action={
              <Link href="/home">
                <Button size="sm">Ir al inicio</Button>
              </Link>
            }
          />
        </Card>
      )}
    </div>
  );
}
