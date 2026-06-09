'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Calendar } from 'lucide-react';
import { getMyRooms } from '@/services/rooms.service';
import { getRoomMatches } from '@/services/matches.service';
import type { Match, MatchStatus } from '@/types/match';
import { formatDateShort, getTimeUntil } from '@/utils/date';
import { getTeamCode } from '@/utils/team';

type FilterKey = 'todos' | MatchStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Proximos' },
  { key: 'en_curso', label: 'En vivo' },
  { key: 'terminado', label: 'Finalizados' },
];

interface MatchWithRoom extends Match {
  roomName: string;
}

function MatchCard({ match }: { match: MatchWithRoom }) {
  const isLive = match.estado === 'en_curso';
  const isDone = match.estado === 'terminado';

  return (
    <Link href={`/rooms/${match.room_id}/matches/${match.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-dark p-5 shadow-card transition-all duration-200 group-hover:shadow-card-hover sm:p-6">
        <div className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-center opacity-15" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Badge variant={isLive ? 'danger' : isDone ? 'muted' : 'info'}>
              {isLive ? 'En vivo' : isDone ? 'Finalizado' : 'Programado'}
            </Badge>
            <span className="text-xs font-medium text-white/60">
              {isLive ? 'En curso' : formatDateShort(match.fecha_inicio)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20">
                <span className={`fi fi-${getTeamCode(match.equipo_local)} h-8 w-11 rounded`} />
              </div>
              <span className="text-center text-xs font-bold uppercase tracking-wide text-white">{match.equipo_local}</span>
            </div>

            <div className="shrink-0 text-center">
              {isDone && match.goles_local !== null ? (
                <p className="text-3xl font-bold text-white">{match.goles_local} - {match.goles_visita}</p>
              ) : (
                <p className="text-lg font-bold text-white/40">VS</p>
              )}
              {!isDone && match.estado === 'pendiente' && (
                <p className="mt-1 text-[11px] text-primary-light">{getTimeUntil(match.fecha_inicio)}</p>
              )}
            </div>

            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20">
                <span className={`fi fi-${getTeamCode(match.equipo_visita)} h-8 w-11 rounded`} />
              </div>
              <span className="text-center text-xs font-bold uppercase tracking-wide text-white">{match.equipo_visita}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <MapPin size={12} /> {match.roomName}
            </span>
            <span className="text-xs font-semibold text-primary-light group-hover:text-white">
              {isDone ? 'Ver detalle' : 'Predecir'} <ChevronRight size={12} className="inline" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MatchListPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const [matches, setMatches] = useState<MatchWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('todos');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rooms = await getMyRooms();
        const all: MatchWithRoom[] = [];
        for (const room of rooms) {
          try {
            const roomMatches = await getRoomMatches(room.id);
            all.push(...roomMatches.map(m => ({ ...m, roomName: room.nombre })));
          } catch { /* skip */ }
        }
        if (!cancelled) {
          all.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
          setMatches(all);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = matches.filter(m => {
    const matchFilter = filter === 'todos' || m.estado === filter;
    const matchQuery = !query ||
      m.equipo_local.toLowerCase().includes(query) ||
      m.equipo_visita.toLowerCase().includes(query) ||
      m.roomName.toLowerCase().includes(query);
    return matchFilter && matchQuery;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Partidos del Mundial"
        description="Consulta los encuentros de tus salas, filtra por estado y realiza tus predicciones."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              'rounded-full px-5 py-2 text-sm font-medium transition-colors',
              filter === f.key
                ? 'bg-primary text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-white shadow-card">
          <EmptyState
            icon={Calendar}
            title="Sin partidos"
            description="Unete a una sala para ver los partidos del torneo y empezar a predecir."
            action={<Link href="/rooms"><Button size="sm">Explorar salas</Button></Link>}
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(match => <MatchCard key={match.id} match={match} />)}
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>}>
      <MatchListPage />
    </Suspense>
  );
}
