'use client';

import { useState, useEffect } from 'react';
import { Gift, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { getMyRewards, type Reward } from '@/services/rewards.service';

function RewardCard({ reward }: { reward: Reward }) {
  return (
    <Card
      hover
      className={`flex flex-col gap-3 ${!reward.obtenida ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-xlight">
          {reward.obtenida
            ? <Gift size={20} className="text-primary" />
            : <Lock size={18} className="text-slate-400" />
          }
        </div>
        <Badge variant={reward.obtenida ? 'success' : 'muted'}>
          {reward.obtenida ? 'Obtenida' : 'Bloqueada'}
        </Badge>
      </div>

      <div>
        <p className="font-semibold text-slate-900">{reward.nombre}</p>
        <p className="mt-0.5 text-xs text-slate-500">{reward.descripcion}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-slate-400">
          {reward.puntos_requeridos} pts requeridos
        </span>
        {reward.obtenida && reward.fecha_obtenida && (
          <span className="text-xs text-success">
            {new Date(reward.fecha_obtenida).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
    </Card>
  );
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRewards()
      .then(setRewards)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;

  const obtenidas = rewards.filter(r => r.obtenida);
  const bloqueadas = rewards.filter(r => !r.obtenida);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recompensas</h1>
        <p className="mt-1 text-sm text-slate-500">
          {obtenidas.length} de {rewards.length} recompensas obtenidas
        </p>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Gift size={40} className="text-slate-300" strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-slate-700">Sin recompensas aun</p>
              <p className="text-sm text-slate-400">Haz predicciones para desbloquear logros</p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {obtenidas.length > 0 && (
            <section>
              <h2 className="mb-4 text-base font-semibold text-slate-700">Obtenidas ({obtenidas.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {obtenidas.map(r => <RewardCard key={r.id} reward={r} />)}
              </div>
            </section>
          )}
          {bloqueadas.length > 0 && (
            <section>
              <h2 className="mb-4 text-base font-semibold text-slate-700">Por desbloquear ({bloqueadas.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {bloqueadas.map(r => <RewardCard key={r.id} reward={r} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
