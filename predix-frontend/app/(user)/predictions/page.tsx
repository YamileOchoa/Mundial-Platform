'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListChecks, ArrowRight, CheckCircle2, Clock, XCircle, History } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { getMyPredictions } from '@/services/predictions.service';
import { getMatch } from '@/services/matches.service';
import { getMyScoreHistory } from '@/services/stats.service';
import type { Prediction } from '@/types/prediction';
import type { Match } from '@/types/match';
import type { ScoreHistory } from '@/types/score';
import { formatDateShort } from '@/utils/date';
import { getTeamCode } from '@/utils/team';

interface PredictionWithMatch { prediction: Prediction; match: Match | null }

type TabKey = 'todos' | 'pendiente' | 'en_curso' | 'terminado' | 'historial';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'todos',     label: 'Todos' },
  { key: 'pendiente', label: 'Proximos' },
  { key: 'en_curso',  label: 'En curso' },
  { key: 'terminado', label: 'Terminados' },
  { key: 'historial', label: 'Historial pts' },
];

function FlagPair({ local, visita }: { local: string; visita: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
      <span className={`fi fi-${getTeamCode(local)} rounded-sm`} title={local} />
      <span className="max-w-[70px] truncate">{local}</span>
      <span className="text-slate-400 text-xs mx-1">vs</span>
      <span className="max-w-[70px] truncate">{visita}</span>
      <span className={`fi fi-${getTeamCode(visita)} rounded-sm`} title={visita} />
    </div>
  );
}

function PredCard({ prediction: p, match }: PredictionWithMatch) {
  if (!match) return null;

  const isTerminado = match.estado === 'terminado';
  const localCorrect  = isTerminado && match.goles_local  !== null && p.goles_local_pred  === match.goles_local;
  const visitaCorrect = isTerminado && match.goles_visita !== null && p.goles_visita_pred === match.goles_visita;
  const exacto = localCorrect && visitaCorrect;

  return (
    <Card hover padding="sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <FlagPair local={match.equipo_local} visita={match.equipo_visita} />
          <Badge variant={match.estado === 'terminado' ? 'muted' : match.estado === 'en_curso' ? 'success' : 'info'}>
            {match.estado === 'terminado' ? 'Terminado' : match.estado === 'en_curso' ? 'En curso' : 'Proximo'}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
          <div className="text-center">
            <p className="text-xs text-slate-400">Mi prediccion</p>
            <p className="text-xl font-bold text-slate-900">
              {p.goles_local_pred} — {p.goles_visita_pred}
            </p>
          </div>
          {isTerminado && match.goles_local !== null && (
            <div className="text-center">
              <p className="text-xs text-slate-400">Resultado real</p>
              <p className="text-xl font-bold text-slate-900">
                {match.goles_local} — {match.goles_visita}
              </p>
            </div>
          )}
        </div>

        {isTerminado && (
          <div className="flex items-center gap-1.5 text-xs">
            {exacto
              ? <><CheckCircle2 size={13} className="text-success" /><span className="text-success font-medium">Marcador exacto</span></>
              : localCorrect || visitaCorrect
              ? <><CheckCircle2 size={13} className="text-amber-500" /><span className="text-amber-600 font-medium">Parcialmente correcto</span></>
              : <><XCircle size={13} className="text-slate-300" /><span className="text-slate-400">Resultado incorrecto</span></>
            }
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            <Clock size={11} className="inline mr-1" />
            {formatDateShort(match.fecha_inicio)}
          </span>
          <Link href={`/rooms/${match.room_id}/matches/${match.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
            Ver partido <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function PredictionsPage() {
  const [items, setItems]       = useState<PredictionWithMatch[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<TabKey>('todos');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [predictions, history] = await Promise.all([
          getMyPredictions(),
          getMyScoreHistory(),
        ]);
        const uniqueMatchIds = [...new Set(predictions.map(p => p.match_id))];
        const matchResults = await Promise.allSettled(uniqueMatchIds.map(id => getMatch(id)));
        const matchMap = new Map<number, Match>();
        matchResults.forEach((r, i) => {
          if (r.status === 'fulfilled') matchMap.set(uniqueMatchIds[i], r.value);
        });
        if (!cancelled) {
          setItems(predictions.map(p => ({ prediction: p, match: matchMap.get(p.match_id) ?? null })));
          setScoreHistory(history);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = tab === 'todos' || tab === 'historial'
    ? items
    : items.filter(({ match }) => match?.estado === tab);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Predicciones</h1>
        <p className="mt-1 text-sm text-slate-500">{items.length} predicciones registradas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'historial' ? (
        scoreHistory.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <History size={36} className="text-slate-300" strokeWidth={1.5} />
              <p className="font-medium text-slate-700">Sin historial de puntos</p>
              <p className="text-sm text-slate-400">Los puntos aparecen cuando los partidos finalizan</p>
            </div>
          </Card>
        ) : (
          <Card padding="none">
            <ol>
              {scoreHistory.map(entry => (
                <li key={entry.id} className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{entry.descripcion ?? entry.regla_aplicada}</p>
                    <p className="text-xs text-slate-400">Partido #{entry.match_id}</p>
                  </div>
                  <span className="text-sm font-bold text-success">+{entry.puntos_ganados} pts</span>
                </li>
              ))}
            </ol>
          </Card>
        )
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ListChecks size={36} className="text-slate-300" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-slate-700">Sin predicciones</p>
              <p className="text-sm text-slate-400">Entra a una sala y predice los partidos</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ prediction, match }) => (
            <PredCard key={prediction.id} prediction={prediction} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
