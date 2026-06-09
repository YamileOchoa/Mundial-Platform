'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ListChecks, Trophy, TrendingUp, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { getMyRooms } from '@/services/rooms.service';
import { getGlobalLeaderboard } from '@/services/leaderboard.service';
import type { Room } from '@/types/room';
import type { LeaderboardEntry } from '@/types/score';
import type { UserStats } from '@/types/auth';
import { getMyStats } from '@/services/auth.service';
import { formatGreetingDate, formatDateShort, isMatchClosed } from '@/utils/date';

/* ─── Stat card ───────────────────────────────── */
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
  iconBg: string;
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

/* ─── Match status badge ──────────────────────── */
function MatchStatusBadge({ status }: { status: string }) {
  if (status === 'en_curso') return <Badge variant="success">En curso</Badge>;
  if (status === 'terminado') return <Badge variant="muted">Terminado</Badge>;
  return <Badge variant="info">Proximo</Badge>;
}

/* ─── Main page ───────────────────────────────── */
export default function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [statsData, roomsData, lbData] = await Promise.all([
          getMyStats(),
          getMyRooms(),
          getGlobalLeaderboard(),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setRooms(roomsData.slice(0, 4));
        setLeaderboard(lbData.slice(0, 5));
      } catch {
        // fallthrough — show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos dias';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  return (
    <div className="flex flex-col gap-8 pb-8">

      {/* ── Greeting ─────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.nombre?.split(' ')[0] ?? 'jugador'}
        </h1>
        <p className="text-sm text-slate-500">{formatGreetingDate()}</p>
      </div>

      {/* ── Stats grid ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="Predicciones"
          value={stats?.total_predicciones ?? 0}
          iconColor="text-primary"
          iconBg="bg-primary-xlight"
        />
        <StatCard
          icon={Trophy}
          label="Aciertos"
          value={stats?.partidos_ganador_correcto ?? 0}
          iconColor="text-success"
          iconBg="bg-success-light"
        />
        <StatCard
          icon={TrendingUp}
          label="Puntos totales"
          value={stats?.puntos_totales ?? 0}
          iconColor="text-warning"
          iconBg="bg-warning-light"
        />
        <StatCard
          icon={Users}
          label="Racha maxima"
          value={stats?.racha_maxima_actual ?? 0}
          iconColor="text-info"
          iconBg="bg-info-light"
        />
      </div>

      {/* ── Two-column section ──────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Mis Salas (2 cols) */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mis Salas</h2>
            <Link href="/rooms">
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {rooms.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Users size={36} className="text-slate-300" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Todavia no eres parte de ninguna sala
                  </p>
                  <p className="text-xs text-slate-400">
                    Crea una nueva o únetea una existente
                  </p>
                </div>
                <Link href="/rooms">
                  <Button size="sm">Explorar salas</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rooms.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`}>
                  <Card hover padding="sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {room.nombre}
                        </span>
                        <Badge variant="muted">
                          <Users size={10} />
                          {room.max_members ?? '—'}
                        </Badge>
                      </div>
                      {room.descripcion && (
                        <p className="line-clamp-2 text-xs text-slate-500">
                          {room.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <span>Ver sala</span>
                        <ArrowRight size={11} />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Ranking global (1 col) */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Ranking global</h2>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm">
                Ver ranking
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <Card padding="none">
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Trophy size={28} className="text-slate-300" strokeWidth={1.5} />
                <p className="text-sm text-slate-400">Sin datos aun</p>
              </div>
            ) : (
              <ol>
                {leaderboard.map((entry, i) => {
                  const pos = i + 1;
                  const medal =
                    pos === 1 ? 'text-amber-500' :
                    pos === 2 ? 'text-slate-400' :
                    pos === 3 ? 'text-orange-400' : 'text-slate-300';
                  const isMe = entry.user_id === user?.id;

                  return (
                    <li
                      key={entry.user_id}
                      className={`flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${
                        isMe ? 'bg-primary-xlight/60' : ''
                      }`}
                    >
                      <span className={`w-5 shrink-0 text-center text-sm font-bold ${medal}`}>
                        {pos}
                      </span>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {entry.nombre?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span className={`flex-1 truncate text-sm ${isMe ? 'font-semibold text-primary' : 'text-slate-700'}`}>
                        {entry.nombre} {isMe && '(tú)'}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-slate-900">
                        {entry.puntos_total ?? 0}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
