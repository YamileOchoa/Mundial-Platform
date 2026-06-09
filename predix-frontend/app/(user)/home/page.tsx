'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy, TrendingUp, ArrowRight, Target, BarChart2,
  Crown, Flame, Gift,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { getMyRooms } from '@/services/rooms.service';
import { getRoomMatches } from '@/services/matches.service';
import { getRoomLeaderboard } from '@/services/leaderboard.service';
import { getMyStats } from '@/services/auth.service';
import type { Room } from '@/types/room';
import type { Match } from '@/types/match';
import type { LeaderboardEntry } from '@/types/score';
import type { UserStats } from '@/types/auth';
import { formatDateShort, getTimeUntil } from '@/utils/date';
import { getTeamCode } from '@/utils/team';

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [roomRanking, setRoomRanking] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsData, roomsData] = await Promise.all([getMyStats(), getMyRooms()]);
        if (cancelled) return;
        setStats(statsData);
        setRooms(roomsData);
        const primaryRoom = roomsData[0];
        if (primaryRoom) {
          const [matches, lb] = await Promise.all([
            getRoomMatches(primaryRoom.id),
            getRoomLeaderboard(primaryRoom.id).catch(() => [] as LeaderboardEntry[]),
          ]);
          if (!cancelled) {
            const next = matches
              .filter(m => m.estado === 'pendiente')
              .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())[0] ?? null;
            setNextMatch(next);
            setRoomRanking(lb.slice(0, 3));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;
  }

  const firstName = user?.nombre?.split(' ')[0] ?? 'jugador';
  const primaryRoom = rooms[0];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero con estadio */}
      <section className="relative overflow-hidden rounded-2xl">
        <Image src="/images/hero.png" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-lg">
            <p className="text-sm font-medium text-primary">Mundial 2026</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Bienvenido, {firstName}
            </h1>
            <p className="mt-3 text-slate-600">
              {nextMatch
                ? `Tu proximo partido es ${nextMatch.equipo_local} vs ${nextMatch.equipo_visita}. ${getTimeUntil(nextMatch.fecha_inicio)}.`
                : 'Unete a una sala y empieza a predecir los partidos del torneo.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={nextMatch ? `/rooms/${nextMatch.room_id}/matches/${nextMatch.id}` : '/matches'}>
                <Button size="md"><Target size={16} /> Ver proximos partidos</Button>
              </Link>
              <Link href={primaryRoom ? `/rooms/${primaryRoom.id}` : '/rooms'}>
                <Button variant="outline" size="md">Mi sala</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Puntos totales', value: stats?.puntos_totales ?? 0, icon: Trophy, bg: 'bg-warning-light', color: 'text-warning' },
          { label: 'Predicciones', value: stats?.total_predicciones ?? 0, icon: Target, bg: 'bg-primary-xlight', color: 'text-primary' },
          { label: 'Aciertos', value: stats?.partidos_ganador_correcto ?? 0, icon: BarChart2, bg: 'bg-success-light', color: 'text-success' },
          { label: 'Racha maxima', value: stats?.racha_maxima_actual ?? 0, icon: Flame, bg: 'bg-info-light', color: 'text-info' },
        ].map(item => (
          <Card key={item.label} padding="sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon size={18} className={item.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-xl font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Proximo partido */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Proximo partido</h2>
            <Link href="/matches" className="text-sm font-medium text-primary hover:underline">Ver todos</Link>
          </div>
          {nextMatch ? (
            <div className="flex flex-col items-center gap-5 rounded-xl bg-slate-50 p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className={`fi fi-${getTeamCode(nextMatch.equipo_local)} mb-2 inline-block h-10 w-14 rounded`} />
                  <p className="text-sm font-bold text-slate-900">{nextMatch.equipo_local}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-300">VS</p>
                  <Badge variant="info">{getTimeUntil(nextMatch.fecha_inicio)}</Badge>
                </div>
                <div className="text-center">
                  <span className={`fi fi-${getTeamCode(nextMatch.equipo_visita)} mb-2 inline-block h-10 w-14 rounded`} />
                  <p className="text-sm font-bold text-slate-900">{nextMatch.equipo_visita}</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs text-slate-400">{formatDateShort(nextMatch.fecha_inicio)}</p>
                <Link href={`/rooms/${nextMatch.room_id}/matches/${nextMatch.id}`} className="mt-3 inline-block">
                  <Button>Predecir resultado</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 py-10 text-center text-sm text-slate-500">
              No hay partidos proximos. <Link href="/rooms" className="text-primary hover:underline">Unete a una sala</Link>
            </div>
          )}
        </Card>

        {/* Mi sala */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Mi sala</h2>
          {primaryRoom ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-900">{primaryRoom.nombre}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">{primaryRoom.codigo_invitacion}</p>
              </div>
              <Link href={`/rooms/${primaryRoom.id}`}>
                <Button variant="outline" size="sm" fullWidth>Invitar amigos</Button>
              </Link>
            </div>
          ) : (
            <Link href="/rooms"><Button size="sm" fullWidth>Crear sala</Button></Link>
          )}
        </Card>
      </div>

      {/* Podio sala */}
      {roomRanking.length > 0 && (
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Top 3 de la sala</h2>
            {primaryRoom && (
              <Link href={`/rooms/${primaryRoom.id}`} className="text-sm text-primary hover:underline">
                Ver ranking <ArrowRight size={14} className="inline" />
              </Link>
            )}
          </div>
          <div className="flex items-end justify-center gap-4 sm:gap-8">
            {[roomRanking[1], roomRanking[0], roomRanking[2]].map((entry, visualIdx) => {
              if (!entry) return <div key={visualIdx} className="w-24" />;
              const pos = roomRanking.indexOf(entry) + 1;
              const heights = ['h-20', 'h-28', 'h-16'];
              const isMe = entry.user_id === user?.id;
              return (
                <div key={entry.user_id} className={`flex w-28 flex-col items-center gap-2 sm:w-32 ${heights[visualIdx]}`}>
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-xlight text-lg font-bold text-primary ring-2 ${isMe ? 'ring-primary' : 'ring-white'}`}>
                    {entry.nombre.charAt(0)}
                    {pos === 1 && <Crown size={14} className="absolute -top-2 text-gold" />}
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-800">{entry.nombre}</p>
                  <p className="text-xs font-bold text-primary">{entry.puntos_total} pts</p>
                  <span className="text-lg font-bold text-slate-300">#{pos}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Accesos rapidos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/leaderboard">
          <Card hover className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-xlight text-primary"><TrendingUp size={20} /></div>
            <div><p className="font-semibold text-slate-900">Ranking global</p><p className="text-xs text-slate-400">Tu posicion</p></div>
          </Card>
        </Link>
        <Link href="/rewards">
          <Card hover className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning-light text-warning"><Gift size={20} /></div>
            <div><p className="font-semibold text-slate-900">Recompensas</p><p className="text-xs text-slate-400">Mis sobres</p></div>
          </Card>
        </Link>
        <Link href="/predictions">
          <Card hover className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success-light text-success"><Target size={20} /></div>
            <div><p className="font-semibold text-slate-900">Predicciones</p><p className="text-xs text-slate-400">Historial</p></div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
