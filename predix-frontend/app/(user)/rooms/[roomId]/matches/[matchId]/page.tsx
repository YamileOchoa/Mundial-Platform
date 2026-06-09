'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Edit2, AlertCircle, Search, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getMatch } from '@/services/matches.service';
import { getMyPredictions, createPrediction, updatePrediction, getMatchPredictions } from '@/services/predictions.service';
import { getMatchScoreHistory } from '@/services/stats.service';
import { searchPlayers } from '@/services/players.service';
import type { Match } from '@/types/match';
import type { Prediction, PredictionPublic } from '@/types/prediction';
import type { ScoreHistoryPublic } from '@/types/score';
import type { Player } from '@/types/player';
import { formatDate, isMatchClosed } from '@/utils/date';
import { getTeamCode } from '@/utils/team';

/* ─── Player search combobox ──────────────── */
function PlayerSearch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [query, setQuery]     = useState(value);
  const [results, setResults] = useState<Player[]>([]);
  const [open, setOpen]       = useState(false);
  const [busy, setBusy]       = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (v: string) => {
    setQuery(v);
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.length < 2) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setBusy(true);
      try {
        const players = await searchPlayers({ q: v, limit: 8 });
        setResults(players);
        setOpen(true);
      } finally {
        setBusy(false);
      }
    }, 350);
  };

  const select = (p: Player) => {
    const val = p.nombre;
    setQuery(val);
    onChange(val);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          {busy ? <Spinner size="sm" /> : <Search size={15} />}
        </span>
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          placeholder="Buscar jugador..."
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange(''); setOpen(false); }}
            className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map(p => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => select(p)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <span className={`fi fi-${getTeamCode(p.pais)} rounded-sm shrink-0`} />
                <span className="font-medium text-slate-900">{p.nombre}</span>
                <span className="ml-auto text-xs text-slate-400">{p.pais}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Score input pair ─────────────────────── */
function ScoreInput({ local, visita, onLocal, onVisita, localTeam, visitaTeam, disabled }: {
  local: number; visita: number;
  onLocal: (v: number) => void; onVisita: (v: number) => void;
  localTeam: string; visitaTeam: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className={`fi fi-${getTeamCode(localTeam)} w-8 h-6 rounded`} />
        <span className="text-xs font-medium text-slate-600 max-w-[80px] truncate">{localTeam}</span>
        <input
          type="number" min={0} max={20} value={local}
          onChange={e => onLocal(Number(e.target.value))}
          disabled={disabled}
          className="w-16 rounded-lg border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
      </div>
      <span className="text-2xl font-bold text-slate-300 mt-4">—</span>
      <div className="flex flex-col items-center gap-1">
        <span className={`fi fi-${getTeamCode(visitaTeam)} w-8 h-6 rounded`} />
        <span className="text-xs font-medium text-slate-600 max-w-[80px] truncate">{visitaTeam}</span>
        <input
          type="number" min={0} max={20} value={visita}
          onChange={e => onVisita(Number(e.target.value))}
          disabled={disabled}
          className="w-16 rounded-lg border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
      </div>
    </div>
  );
}

/* ─── Página principal ─────────────────────── */
export default function MatchDetailPage() {
  const params = useParams<{ roomId: string; matchId: string }>();
  const matchId = Number(params.matchId);
  const roomId  = params.roomId;

  const [match,          setMatch]          = useState<Match | null>(null);
  const [myPrediction,   setMyPrediction]   = useState<Prediction | null>(null);
  const [allPredictions, setAllPredictions] = useState<PredictionPublic[]>([]);
  const [scoreHistory,   setScoreHistory]   = useState<ScoreHistoryPublic[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [editing,        setEditing]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [submitError,    setSubmitError]    = useState('');
  const [submitOk,       setSubmitOk]       = useState(false);

  // Form state
  const [golesLocal,    setGolesLocal]    = useState(0);
  const [golesVisita,   setGolesVisita]   = useState(0);
  const [goleador,      setGoleador]      = useState('');
  const [jugTarjeta,    setJugTarjeta]    = useState('');
  const [tipoTarjeta,   setTipoTarjeta]   = useState('');
  const [minutoGol,     setMinutoGol]     = useState('');
  const [showExtras,    setShowExtras]    = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [matchData, myPreds] = await Promise.all([
          getMatch(matchId),
          getMyPredictions(),
        ]);
        if (cancelled) return;
        setMatch(matchData);
        const mine = myPreds.find(p => p.match_id === matchId) ?? null;
        setMyPrediction(mine);
        if (mine) {
          setGolesLocal(mine.goles_local_pred);
          setGolesVisita(mine.goles_visita_pred);
          setGoleador(mine.goleador_pred ?? '');
          setJugTarjeta(mine.jugador_tarjeta_pred ?? '');
          setTipoTarjeta(mine.tipo_tarjeta_pred ?? '');
          setMinutoGol(mine.minuto_gol_pred?.toString() ?? '');
          if (mine.goleador_pred || mine.jugador_tarjeta_pred) setShowExtras(true);
        }
        if (matchData.estado === 'terminado') {
          const [allPreds, history] = await Promise.allSettled([
            getMatchPredictions(matchId),
            getMatchScoreHistory(matchId),
          ]);
          if (!cancelled) {
            if (allPreds.status === 'fulfilled')  setAllPredictions(allPreds.value);
            if (history.status === 'fulfilled')   setScoreHistory(history.value);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [matchId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSaving(true);
    try {
      const payload = {
        goles_local_pred:    golesLocal,
        goles_visita_pred:   golesVisita,
        goleador_pred:       goleador  || undefined,
        jugador_tarjeta_pred: jugTarjeta || undefined,
        tipo_tarjeta_pred:   tipoTarjeta || undefined,
        minuto_gol_pred:     minutoGol ? Number(minutoGol) : undefined,
      };
      if (myPrediction && editing) {
        const updated = await updatePrediction(myPrediction.id, payload);
        setMyPrediction(updated);
        setEditing(false);
      } else {
        const created = await createPrediction({ match_id: matchId, ...payload });
        setMyPrediction(created);
      }
      setSubmitOk(true);
      setTimeout(() => setSubmitOk(false), 3000);
    } catch (err: unknown) {
      setSubmitError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'No se pudo guardar la prediccion.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;
  if (!match)  return <div className="py-16 text-center text-slate-500">Partido no encontrado.</div>;

  const closed        = isMatchClosed(match.fecha_inicio);
  const canPredict    = match.estado === 'pendiente' && !closed;
  const showForm      = canPredict && (!myPrediction || editing);
  const isTerminado   = match.estado === 'terminado';

  const statusBadge: { label: string; variant: 'info' | 'success' | 'muted' } =
    match.estado === 'terminado' ? { label: 'Terminado', variant: 'muted' }
    : match.estado === 'en_curso' ? { label: 'En curso',  variant: 'success' }
    : closed                      ? { label: 'Cerrado',   variant: 'muted' }
    :                               { label: 'Proximo',   variant: 'info' };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">

      {/* Back */}
      <Link href={`/rooms/${roomId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
        <ChevronLeft size={16} /> Volver a la sala
      </Link>

      {/* Match header */}
      <Card>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex items-center justify-between w-full">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <span className="text-xs text-slate-400">{formatDate(match.fecha_inicio)}</span>
          </div>
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`fi fi-${getTeamCode(match.equipo_local)} w-10 h-7 rounded`} />
              <span className="text-sm font-semibold text-slate-800 text-center">{match.equipo_local}</span>
            </div>
            <div className="text-center shrink-0">
              {isTerminado ? (
                <span className="text-3xl font-bold text-slate-900">{match.goles_local} — {match.goles_visita}</span>
              ) : (
                <span className="text-lg font-bold text-slate-300">vs</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`fi fi-${getTeamCode(match.equipo_visita)} w-10 h-7 rounded`} />
              <span className="text-sm font-semibold text-slate-800 text-center">{match.equipo_visita}</span>
            </div>
          </div>
          {isTerminado && (
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
              {match.goleador_real     && <span>Goleador: <strong>{match.goleador_real}</strong></span>}
              {match.jugador_tarjeta_real && <span>Tarjeta: <strong>{match.jugador_tarjeta_real}</strong> ({match.tipo_tarjeta_real})</span>}
              {match.minuto_primer_gol  !== null && <span>Min. primer gol: <strong>{match.minuto_primer_gol} min</strong></span>}
            </div>
          )}
        </div>
      </Card>

      {/* Mi prediccion — ya existe y no está editando */}
      {myPrediction && !editing && (
        <Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="font-semibold text-slate-900">Mi prediccion</h2>
            {canPredict && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 size={13} /> Editar
              </Button>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 rounded-lg bg-slate-50 py-4">
            <div className="flex flex-col items-center gap-0.5">
              <span className={`fi fi-${getTeamCode(match.equipo_local)} w-7 h-5 rounded`} />
              <span className="text-2xl font-bold text-slate-900">{myPrediction.goles_local_pred}</span>
            </div>
            <span className="text-lg font-bold text-slate-300">—</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className={`fi fi-${getTeamCode(match.equipo_visita)} w-7 h-5 rounded`} />
              <span className="text-2xl font-bold text-slate-900">{myPrediction.goles_visita_pred}</span>
            </div>
          </div>
          {(myPrediction.goleador_pred || myPrediction.jugador_tarjeta_pred) && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              {myPrediction.goleador_pred      && <span>Goleador: <strong>{myPrediction.goleador_pred}</strong></span>}
              {myPrediction.jugador_tarjeta_pred && <span>Tarjeta: <strong>{myPrediction.jugador_tarjeta_pred}</strong> ({myPrediction.tipo_tarjeta_pred})</span>}
              {myPrediction.minuto_gol_pred     !== null && myPrediction.minuto_gol_pred !== undefined && <span>Min. gol: <strong>{myPrediction.minuto_gol_pred} min</strong></span>}
            </div>
          )}
        </Card>
      )}

      {/* Aviso si el partido está cerrado sin prediccion */}
      {!myPrediction && !canPredict && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-light px-4 py-3 text-sm text-amber-700">
          <AlertCircle size={16} />
          {match.estado === 'en_curso' ? 'El partido ya comenzo. No se aceptan mas predicciones.' : 'El plazo para predecir este partido ya cerro.'}
        </div>
      )}

      {/* Formulario de prediccion */}
      {showForm && (
        <Card>
          <h2 className="mb-5 font-semibold text-slate-900">{myPrediction ? 'Editar prediccion' : 'Hacer prediccion'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <ScoreInput
              local={golesLocal} visita={golesVisita}
              onLocal={setGolesLocal} onVisita={setGolesVisita}
              localTeam={match.equipo_local} visitaTeam={match.equipo_visita}
            />

            {/* Extras toggle */}
            <button
              type="button"
              onClick={() => setShowExtras(v => !v)}
              className="text-xs font-medium text-primary hover:underline self-center"
            >
              {showExtras ? 'Ocultar detalles opcionales' : '+ Agregar detalles para mas puntos'}
            </button>

            {showExtras && (
              <div className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <PlayerSearch key={`goleador-${goleador}`} label="Goleador (opcional)" value={goleador} onChange={setGoleador} />
                <PlayerSearch key={`tarjeta-${jugTarjeta}`} label="Jugador con tarjeta (opcional)" value={jugTarjeta} onChange={setJugTarjeta} />
                {jugTarjeta && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Tipo de tarjeta</label>
                    <select
                      value={tipoTarjeta}
                      onChange={e => setTipoTarjeta(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Selecciona...</option>
                      <option value="amarilla">Amarilla</option>
                      <option value="roja">Roja</option>
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Minuto del primer gol (opcional)</label>
                  <input
                    type="number" min={1} max={120}
                    value={minutoGol}
                    onChange={e => setMinutoGol(e.target.value)}
                    placeholder="Ej: 35"
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {submitError && <p className="rounded-md bg-danger-light px-3 py-2 text-xs text-red-700">{submitError}</p>}
            {submitOk    && (
              <p className="flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 size={13} /> Prediccion guardada correctamente
              </p>
            )}

            <div className="flex gap-2">
              {editing && (
                <Button type="button" variant="ghost" onClick={() => { setEditing(false); setSubmitError(''); }}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" loading={saving} fullWidth={!editing}>
                {myPrediction ? 'Guardar cambios' : 'Confirmar prediccion'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Predicciones de todos (terminado) */}
      {isTerminado && allPredictions.length > 0 && (
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="font-semibold text-slate-900">Predicciones de todos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5">Jugador</th>
                  <th className="px-3 py-2.5 text-center">Prediccion</th>
                  <th className="px-3 py-2.5">Goleador</th>
                </tr>
              </thead>
              <tbody>
                {allPredictions.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-2.5 font-medium text-slate-800">{p.user_nombre}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-900">{p.goles_local_pred}—{p.goles_visita_pred}</td>
                    <td className="px-3 py-2.5 text-slate-500">{p.goleador_pred ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Score history (terminado) */}
      {isTerminado && scoreHistory.length > 0 && (
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="font-semibold text-slate-900">Puntos otorgados</h2>
          </div>
          <ol>
            {scoreHistory.map((s, i) => (
              <li key={i} className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0">
                <div>
                  <span className="text-sm font-medium text-slate-800">{s.user_nombre}</span>
                  {s.descripcion && <p className="text-xs text-slate-400">{s.descripcion}</p>}
                </div>
                <span className="text-sm font-bold text-success">+{s.puntos_ganados} pts</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
