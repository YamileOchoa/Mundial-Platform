'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Play, CheckCircle, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import {
  getAllAdminMatches,
  updateAdminMatchStatus,
  setAdminMatchResult,
} from '@/services/admin.service';
import type { Match } from '@/types/match';
import { formatDateShort } from '@/utils/date';
import { getTeamCode } from '@/utils/team';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultMatch, setResultMatch] = useState<Match | null>(null);
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisita, setGolesVisita] = useState(0);
  const [goleador, setGoleador] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const reload = () => {
    setLoading(true);
    getAllAdminMatches().then(setMatches).finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    getAllAdminMatches()
      .then(data => { if (!cancelled) setMatches(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleStartMatch = async (match: Match) => {
    setUpdatingId(match.id);
    try {
      const updated = await updateAdminMatchStatus(match.id, 'en_curso');
      setMatches(prev => prev.map(m => m.id === match.id ? updated : m));
    } finally {
      setUpdatingId(null);
    }
  };

  const openResult = (match: Match) => {
    setResultMatch(match);
    setGolesLocal(0);
    setGolesVisita(0);
    setGoleador('');
  };

  const handleSetResult = async (e: FormEvent) => {
    e.preventDefault();
    if (!resultMatch) return;
    setSaving(true);
    try {
      const updated = await setAdminMatchResult(resultMatch.id, {
        goles_local: golesLocal,
        goles_visita: golesVisita,
        goleador_real: goleador || undefined,
      });
      setMatches(prev => prev.map(m => m.id === resultMatch.id ? updated : m));
      setResultMatch(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partidos</h1>
          <p className="text-sm text-slate-500">{matches.length} partidos en el sistema</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reload}><RefreshCw size={14} /> Actualizar</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Partido</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Sala</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => (
                <tr key={match.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`fi fi-${getTeamCode(match.equipo_local)} rounded-sm`} />
                      <span className="font-medium text-slate-800">{match.equipo_local}</span>
                      <span className="text-slate-400">vs</span>
                      <span className="font-medium text-slate-800">{match.equipo_visita}</span>
                      <span className={`fi fi-${getTeamCode(match.equipo_visita)} rounded-sm`} />
                    </div>
                    {match.estado === 'terminado' && (
                      <p className="mt-0.5 text-xs text-slate-400">{match.goles_local} - {match.goles_visita}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-500">{formatDateShort(match.fecha_inicio)}</td>
                  <td className="px-3 py-3 text-slate-500">#{match.room_id}</td>
                  <td className="px-3 py-3">
                    <Badge variant={match.estado === 'terminado' ? 'muted' : match.estado === 'en_curso' ? 'success' : 'info'}>
                      {match.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {match.estado === 'pendiente' && (
                        <Button size="sm" variant="outline" loading={updatingId === match.id} onClick={() => handleStartMatch(match)}>
                          <Play size={13} /> Iniciar
                        </Button>
                      )}
                      {match.estado !== 'terminado' && (
                        <Button size="sm" onClick={() => openResult(match)}>
                          <CheckCircle size={13} /> Resultado
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">No hay partidos registrados</p>
          )}
        </div>
      </Card>

      <Modal open={!!resultMatch} onClose={() => setResultMatch(null)} title="Registrar resultado">
        {resultMatch && (
          <form onSubmit={handleSetResult} className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              {resultMatch.equipo_local} vs {resultMatch.equipo_visita}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Goles local" type="number" min={0} value={golesLocal} onChange={e => setGolesLocal(Number(e.target.value))} required />
              <Input label="Goles visita" type="number" min={0} value={golesVisita} onChange={e => setGolesVisita(Number(e.target.value))} required />
            </div>
            <Input label="Goleador (opcional)" value={goleador} onChange={e => setGoleador(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setResultMatch(null)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Registrar y calcular puntos</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
