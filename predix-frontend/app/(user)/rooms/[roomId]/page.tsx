'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, Users, Trophy,
  Copy, Check, LogOut, Clock, Calendar,
  Crown, Plus,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { getRoom, getMembers, leaveRoom } from '@/services/rooms.service';
import { getRoomMatches, createMatch } from '@/services/matches.service';
import { getRoomLeaderboard } from '@/services/leaderboard.service';
import type { Room, RoomMember } from '@/types/room';
import type { Match } from '@/types/match';
import type { LeaderboardEntry } from '@/types/score';
import { useAuth } from '@/hooks/useAuth';
import { formatDateShort, getTimeUntil, isMatchClosed } from '@/utils/date';
import { getTeamCode } from '@/utils/team';

type Tab = 'partidos' | 'miembros' | 'ranking';

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-600 hover:bg-slate-200 transition-colors"
    >
      {code}
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-slate-400" />}
    </button>
  );
}

function MatchCard({ match, roomId }: { match: Match; roomId: string }) {
  const closed = isMatchClosed(match.fecha_inicio);
  const statusMap = {
    pendiente: { label: 'Proximo',   variant: 'info'    as const },
    en_curso:  { label: 'En curso',  variant: 'success' as const },
    terminado: { label: 'Terminado', variant: 'muted'   as const },
  };
  const s = statusMap[match.estado];

  return (
    <Link href={`/rooms/${roomId}/matches/${match.id}`}>
      <Card hover padding="sm" className="h-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={s.variant}>{s.label}</Badge>
            <span className="text-xs text-slate-400">{formatDateShort(match.fecha_inicio)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`fi fi-${getTeamCode(match.equipo_local)} rounded-sm shrink-0`} />
              <span className="text-sm font-semibold text-slate-900 truncate">{match.equipo_local}</span>
            </div>
            {match.estado === 'terminado' ? (
              <span className="text-base font-bold text-slate-900 shrink-0">
                {match.goles_local} — {match.goles_visita}
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 shrink-0">vs</span>
            )}
            <div className="flex items-center justify-end gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate text-right">{match.equipo_visita}</span>
              <span className={`fi fi-${getTeamCode(match.equipo_visita)} rounded-sm shrink-0`} />
            </div>
          </div>
          {match.estado === 'pendiente' && !closed && (
            <p className="text-xs text-primary font-medium flex items-center gap-1">
              <Clock size={11} /> {getTimeUntil(match.fecha_inicio)}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default function RoomDetailPage() {
  const params   = useParams<{ roomId: string }>();
  const router   = useRouter();
  const { user } = useAuth();

  const [room,      setRoom]      = useState<Room | null>(null);
  const [members,   setMembers]   = useState<RoomMember[]>([]);
  const [matches,   setMatches]   = useState<Match[]>([]);
  const [ranking,   setRanking]   = useState<LeaderboardEntry[]>([]);
  const [tab,       setTab]       = useState<Tab>('partidos');
  const [loading,   setLoading]   = useState(true);
  const [leaving,      setLeaving]      = useState(false);
  const [showLeave,    setShowLeave]    = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);
  const [equipoLocal,  setEquipoLocal]  = useState('');
  const [equipoVisita, setEquipoVisita] = useState('');
  const [fechaInicio,  setFechaInicio]  = useState('');
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const roomId = Number(params.roomId);
        const [r, mem, mat, lb] = await Promise.all([
          getRoom(roomId),
          getMembers(roomId),
          getRoomMatches(roomId),
          getRoomLeaderboard(roomId).catch(() => [] as LeaderboardEntry[]),
        ]);
        if (cancelled) return;
        setRoom(r); setMembers(mem); setMatches(mat); setRanking(lb);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.roomId]);

  const handleCreateMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!equipoLocal.trim() || !equipoVisita.trim() || !fechaInicio) return;
    setCreateError('');
    setCreating(true);
    try {
      const match = await createMatch({
        equipo_local: equipoLocal.trim(),
        equipo_visita: equipoVisita.trim(),
        fecha_inicio: new Date(fechaInicio).toISOString(),
        room_id: Number(params.roomId),
      });
      setMatches(prev => [...prev, match]);
      setShowCreate(false);
      setEquipoLocal(''); setEquipoVisita(''); setFechaInicio('');
    } catch (err: unknown) {
      setCreateError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'No se pudo crear el partido.');
    } finally {
      setCreating(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leaveRoom(Number(params.roomId));
      router.push('/rooms');
    } catch (err: unknown) {
      alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'No se pudo salir de la sala.');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;
  if (!room)   return <div className="py-16 text-center text-slate-500">Sala no encontrada.</div>;

  const isAdmin = room.admin_id === user?.id;
  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'partidos', label: 'Partidos', icon: Calendar },
    { key: 'miembros', label: 'Miembros', icon: Users },
    { key: 'ranking',  label: 'Ranking',  icon: Trophy },
  ];

  return (
    <div className="space-y-6 pb-8">

      <Link href="/rooms" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
        <ChevronLeft size={16} /> Mis Salas
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{room.nombre}</h1>
            {isAdmin && <Badge variant="primary"><Crown size={10} /> Admin</Badge>}
          </div>
          {room.descripcion && <p className="text-sm text-slate-500">{room.descripcion}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Codigo de invitacion:</span>
            <CopyCode code={room.codigo_invitacion} />
          </div>
        </div>
        <div className="flex gap-2 self-start">
          {isAdmin && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Agregar partido
            </Button>
          )}
          {!isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => setShowLeave(true)} className="text-danger hover:bg-danger-light hover:text-danger">
              <LogOut size={15} /> Salir de sala
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'partidos' && (
        matches.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Calendar size={36} className="text-slate-300" strokeWidth={1.5} />
              <div>
                <p className="font-semibold text-slate-700">Sin partidos aun</p>
                <p className="text-sm text-slate-400">El admin de la sala agregara los partidos</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map(m => <MatchCard key={m.id} match={m} roomId={params.roomId} />)}
          </div>
        )
      )}

      {tab === 'miembros' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map(member => (
            <Card key={member.user_id} padding="sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {member.foto_url
                    ? <img src={member.foto_url} alt={member.nombre} className="h-10 w-10 rounded-full object-cover" />
                    : member.nombre.charAt(0).toUpperCase()
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-slate-900">{member.nombre}</span>
                    {member.es_admin && <Crown size={12} className="text-amber-500 shrink-0" />}
                    {member.user_id === user?.id && <span className="text-xs text-primary">(tú)</span>}
                  </div>
                  <p className="text-xs text-slate-400">
                    Desde {new Date(member.joined_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'ranking' && (
        <Card padding="none">
          {ranking.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">Sin datos de ranking aun</div>
          ) : (
            <ol>
              {ranking.map((entry, i) => {
                const pos  = i + 1;
                const isMe = entry.user_id === user?.id;
                const medalColor = pos === 1 ? 'text-amber-500' : pos === 2 ? 'text-slate-400' : pos === 3 ? 'text-orange-400' : 'text-slate-300';
                return (
                  <li key={entry.user_id} className={`flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${isMe ? 'bg-primary-xlight/60' : ''}`}>
                    <span className={`w-5 text-center text-sm font-bold ${medalColor}`}>{pos}</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {entry.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`flex-1 truncate text-sm ${isMe ? 'font-semibold text-primary' : 'text-slate-700'}`}>
                      {entry.nombre} {isMe && '(tú)'}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{entry.puntos_total ?? 0} pts</span>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      )}

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreateError(''); }} title="Nuevo partido">
        <form onSubmit={handleCreateMatch} className="flex flex-col gap-4">
          <Input label="Equipo local" value={equipoLocal} onChange={e => setEquipoLocal(e.target.value)} placeholder="Ej: Argentina" required />
          <Input label="Equipo visita" value={equipoVisita} onChange={e => setEquipoVisita(e.target.value)} placeholder="Ej: Espana" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Fecha y hora de inicio</label>
            <input
              type="datetime-local"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {createError && <p className="text-xs text-danger">{createError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" loading={creating}>Crear partido</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showLeave} onClose={() => setShowLeave(false)} title="Salir de la sala" maxWidth="sm">
        <p className="text-sm text-slate-600 mb-6">
          ¿Seguro que quieres salir de <strong>{room.nombre}</strong>? Perderas el acceso a los partidos y predicciones de esta sala.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowLeave(false)}>Cancelar</Button>
          <Button variant="danger" loading={leaving} onClick={handleLeave}>Salir de sala</Button>
        </div>
      </Modal>
    </div>
  );
}
