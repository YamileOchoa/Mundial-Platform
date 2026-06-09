'use client';

import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Copy, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { getAllAdminRooms, deleteAdminRoom } from '@/services/admin.service';
import type { Room } from '@/types/room';

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-primary"
    >
      {code}
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    setLoading(true);
    getAllAdminRooms().then(setRooms).finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    getAllAdminRooms()
      .then(data => { if (!cancelled) setRooms(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteAdminRoom(deleteTarget.id);
      setRooms(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salas</h1>
          <p className="text-sm text-slate-500">{rooms.length} salas en el sistema</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reload}><RefreshCw size={14} /> Actualizar</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map(room => (
          <Card key={room.id}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{room.nombre}</h3>
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(room)}>
                  <Trash2 size={13} />
                </Button>
              </div>
              {room.descripcion && <p className="text-xs text-slate-500 line-clamp-2">{room.descripcion}</p>}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <CopyCode code={room.codigo_invitacion} />
                <span>Admin #{room.admin_id}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card><p className="py-12 text-center text-sm text-slate-400">No hay salas</p></Card>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar sala" maxWidth="sm">
        <p className="mb-6 text-sm text-slate-600">
          Eliminar la sala <strong>{deleteTarget?.nombre}</strong> y todos sus datos?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={busy} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
