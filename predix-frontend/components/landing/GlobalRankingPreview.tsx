'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGlobalLeaderboard } from '@/services/leaderboard.service';
import type { LeaderboardEntry } from '@/types/score';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const MEDALS = ['text-gold', 'text-slate-400', 'text-bronze'];

export default function GlobalRankingPreview() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getGlobalLeaderboard()
      .then(data => { if (!cancelled) setEntries(data.slice(0, 3)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="font-semibold text-slate-900">Ranking Global</h3>
        <span className="text-xs font-medium text-slate-400">Mundial 2026</span>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="text-primary" /></div>
      ) : entries.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">Sin datos aun. Se el primero en competir.</p>
      ) : (
        <ol>
          {entries.map((entry, i) => (
            <li key={entry.user_id} className="flex items-center gap-4 border-b border-slate-50 px-6 py-4 last:border-0">
              <span className={`w-6 text-center text-lg font-bold ${MEDALS[i] ?? 'text-slate-300'}`}>{i + 1}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-xlight text-sm font-semibold text-primary">
                {entry.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{entry.nombre}</p>
                <p className="text-xs text-slate-400">Jugador activo</p>
              </div>
              <span className="text-sm font-bold text-slate-900">{entry.puntos_total} pts</span>
            </li>
          ))}
        </ol>
      )}
      <div className="border-t border-slate-100 px-6 py-4 text-center">
        <Link href="/register">
          <Button variant="ghost" size="sm">Unete y compite <ArrowRight size={14} /></Button>
        </Link>
      </div>
    </div>
  );
}
