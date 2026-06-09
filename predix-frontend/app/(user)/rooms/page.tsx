'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Users, Plus, LogIn, ArrowRight, Copy, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getMyRooms, createRoom, joinRoom } from '@/services/rooms.service';
import type { Room } from '@/types/room';
import { useAuth } from '@/hooks/useAuth';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-slate-400 hover:text-primary transition-colors" title="Copiar codigo">
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </button>
  );
}

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms]               = useState<Room[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showCreate, setShowCreate]     = useState(false);
  const [showJoin, setShowJoin]         = useState(false);
  const [newNombre, setNewNombre]       = useState('');
  const [joinCode, setJoinCode]         = useState('');
  const [creating, setCreating]         = useState(false);
  const [joining, setJoining]           = useState(false);
  const [createError, setCreateError]   = useState('');
  const [joinError, setJoinError]       = useState('');

  useEffect(() => {
    getMyRooms().then(setRooms).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    setCreateError('');
    setCreating(true);
    try {
      const room = await createRoom({ nombre: newNombre.trim() });
      setRooms(prev => [room, ...prev]);
      setShowCreate(false);
      setNewNombre('');
    } catch (err: unknown) {
      setCreateError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'No se pudo crear la sala.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinError('');
    setJoining(true);
    try {
      const room = await joinRoom({ codigo_invitacion: joinCode.trim().toUpperCase() });
      setRooms(prev => prev.some(r => r.id === room.id) ? prev : [room, ...prev]);
      setShowJoin(false);
      setJoinCode('');
    } catch (err: unknown) {
      setJoinError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Codigo incorrecto o sala no encontrada.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Salas</h1>
          <p className="mt-1 text-sm text-slate-500">{rooms.length} sala{rooms.length !== 1 ? 's' : ''} activa{rooms.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
            <LogIn size={15} />
            Unirse
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Nueva sala
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-primary" /></div>
      ) : rooms.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Users size={44} className="text-slate-300" strokeWidth={1.5} />
            <div>
              <p className="text-base font-semibold text-slate-700">Todavia no estas en ninguna sala</p>
              <p className="text-sm text-slate-400">Crea una nueva o únetea con un codigo de invitacion</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>Unirse a sala</Button>
              <Button size="sm" onClick={() => setShowCreate(true)}>Crear sala</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map(room => {
            const isAdmin = room.admin_id === user?.id;
            return (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card hover className="h-full">
                  <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2">{room.nombre}</h3>
                      {isAdmin && <Badge variant="primary">Admin</Badge>}
                    </div>

                    {room.descripcion && (
                      <p className="text-xs text-slate-500 line-clamp-2">{room.descripcion}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{room.codigo_invitacion}</span>
                        <CopyButton text={room.codigo_invitacion} />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        Ver sala <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal crear sala */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreateError(''); setNewNombre(''); }} title="Nueva sala">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Nombre de la sala"
            placeholder="Ej: Amigos del barrio, Trabajo 2026..."
            value={newNombre}
            onChange={e => setNewNombre(e.target.value)}
            required
            autoFocus
          />
          {createError && <p className="text-xs text-danger">{createError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" loading={creating} disabled={!newNombre.trim()}>Crear sala</Button>
          </div>
        </form>
      </Modal>

      {/* Modal unirse */}
      <Modal open={showJoin} onClose={() => { setShowJoin(false); setJoinError(''); setJoinCode(''); }} title="Unirse a sala">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <Input
            label="Codigo de invitacion"
            placeholder="Ej: ABC123"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            hint="El admin de la sala te comparte este codigo"
            required
            autoFocus
          />
          {joinError && <p className="text-xs text-danger">{joinError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowJoin(false)}>Cancelar</Button>
            <Button type="submit" loading={joining} disabled={!joinCode.trim()}>Unirse</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
