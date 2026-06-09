'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { getGlobalLeaderboard } from '@/services/leaderboard.service';
import type { LeaderboardEntry } from '@/types/score';

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-orange-400'];
const MEDAL_BG    = ['bg-amber-50 border-amber-200', 'bg-slate-50 border-slate-200', 'bg-orange-50 border-orange-200'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const top3 = entries.slice(0, 3);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ranking Global</h1>
        <p className="mt-1 text-sm text-slate-500">
          Clasificacion acumulada de todos los jugadores del torneo
        </p>
      </div>

      {/* Podio top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
            if (!entry) return <div key={visualIdx} />;
            const actualPos = entries.indexOf(entry) + 1;
            const isMe = entry.user_id === user?.id;
            const heights = ['h-24', 'h-32', 'h-20'];
            return (
              <Card
                key={entry.user_id}
                padding="sm"
                className={`flex flex-col items-center justify-end gap-1 border ${MEDAL_BG[actualPos - 1]} ${heights[visualIdx]} ${isMe ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-sm font-bold text-slate-700">
                  {entry.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className={`text-xs font-bold ${MEDAL_COLORS[actualPos - 1]}`}>
                  #{actualPos}
                </span>
                <span className="max-w-full truncate text-center text-xs font-semibold text-slate-800">
                  {entry.nombre} {isMe && '(tú)'}
                </span>
                <span className="text-sm font-bold text-slate-900">{entry.puntos_total} pts</span>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tabla completa */}
      <Card padding="none">
        {/* Encabezado */}
        <div className="grid grid-cols-[2rem_1fr_5rem_5rem] gap-3 border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>#</span>
          <span>Jugador</span>
          <span className="text-right">Puntos</span>
          <span className="text-right">Racha</span>
        </div>

        {entries.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Aun no hay datos en el ranking
          </div>
        ) : (
          <ol>
            {entries.map((entry, i) => {
              const pos  = i + 1;
              const isMe = entry.user_id === user?.id;
              return (
                <li
                  key={entry.user_id}
                  className={`grid grid-cols-[2rem_1fr_5rem_5rem] items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${isMe ? 'bg-primary-xlight/60' : 'hover:bg-slate-50'}`}
                >
                  <span className={`text-sm font-bold ${pos <= 3 ? MEDAL_COLORS[pos - 1] : 'text-slate-300'}`}>
                    {pos}
                  </span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {entry.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`truncate text-sm ${isMe ? 'font-semibold text-primary' : 'text-slate-700'}`}>
                      {entry.nombre} {isMe && '(tú)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-sm font-bold text-slate-900">
                    <Trophy size={12} className="text-amber-400" />
                    {entry.puntos_total ?? 0}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-sm font-semibold text-slate-500">
                    <Flame size={12} className="text-orange-400" />
                    {entry.racha_actual ?? 0}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
