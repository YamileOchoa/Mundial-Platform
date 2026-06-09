'use client';

import { useState, useEffect } from 'react';
import { Shield, Trash2, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { getAllAdminUsers, makeUserAdmin, deleteAdminUser } from '@/services/admin.service';
import type { User } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    setLoading(true);
    getAllAdminUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    getAllAdminUsers()
      .then(data => { if (!cancelled) setUsers(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleMakeAdmin = async (user: User) => {
    setBusy(true);
    try {
      const updated = await makeUserAdmin(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteAdminUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
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
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">{users.length} usuarios registrados</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reload}><RefreshCw size={14} /> Actualizar</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Rol</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-xlight text-xs font-semibold text-primary">
                        {user.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{user.nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{user.email}</td>
                  <td className="px-3 py-3">
                    <Badge variant={user.es_admin_global ? 'primary' : 'muted'}>
                      {user.es_admin_global ? 'Admin' : 'Usuario'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!user.es_admin_global && (
                        <Button size="sm" variant="outline" loading={busy} onClick={() => handleMakeAdmin(user)}>
                          <Shield size={13} /> Promover
                        </Button>
                      )}
                      {user.id !== me?.id && (
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(user)}>
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar usuario" maxWidth="sm">
        <p className="mb-6 text-sm text-slate-600">
          Eliminar a <strong>{deleteTarget?.nombre}</strong>? Esta accion no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={busy} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
