'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import {
  createAdminPlayer,
  deleteAdminPlayer,
} from '@/services/admin.service';
import { searchPlayers } from '@/services/players.service';
import type { Player } from '@/types/player';
import { getTeamCode } from '@/utils/team';

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('');
  const [posicion, setPosicion] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reload = () => {
    setLoading(true);
    searchPlayers({ limit: 500 }).then(setPlayers).finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    searchPlayers({ limit: 500 })
      .then(data => { if (!cancelled) setPlayers(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !pais.trim() || !posicion.trim()) return;
    setSaving(true);
    try {
      const player = await createAdminPlayer({
        nombre: nombre.trim(),
        pais: pais.trim(),
        posicion: posicion.trim(),
      });
      setPlayers(prev => [player, ...prev]);
      setShowCreate(false);
      setNombre(''); setPais(''); setPosicion('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteAdminPlayer(id);
      setPlayers(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jugadores</h1>
          <p className="text-sm text-slate-500">{players.length} jugadores en el catalogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={reload}><RefreshCw size={14} /> Actualizar</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Nuevo</Button>
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Jugador</th>
                <th className="px-3 py-3">Pais</th>
                <th className="px-3 py-3">Posicion</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{player.nombre}</td>
                  <td className="px-3 py-3">
                    <span className={`fi fi-${getTeamCode(player.pais)} rounded-sm mr-1.5`} />
                    {player.pais}
                  </td>
                  <td className="px-3 py-3 text-slate-500">{player.posicion}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deletingId === player.id}
                      onClick={() => handleDelete(player.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {players.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">Catalogo vacio</p>
          )}
        </div>
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo jugador">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
          <Input label="Pais" value={pais} onChange={e => setPais(e.target.value)} placeholder="Ej: Argentina" required />
          <Input label="Posicion" value={posicion} onChange={e => setPosicion(e.target.value)} placeholder="Ej: Delantero" required />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear jugador</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
