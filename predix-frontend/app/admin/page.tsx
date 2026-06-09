'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, DoorOpen, Calendar, UserCircle, ArrowRight,
  CheckCircle2, Server, Database, Activity,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import {
  getAllAdminMatches,
  getAllAdminUsers,
  getAllAdminRooms,
} from '@/services/admin.service';
import { searchPlayers } from '@/services/players.service';

function StatusCard({ label, status, icon: Icon }: { label: string; status: string; icon: React.ElementType }) {
  return (
    <Card padding="sm" className="border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-xl font-bold text-success">{status}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success-light text-success">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function StatLink({ href, label, value, icon: Icon, color, bg }: {
  href: string; label: string; value: number; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <Link href={href}>
      <Card hover className="h-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
          <ArrowRight size={18} className="shrink-0 text-slate-300" />
        </div>
      </Card>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, rooms: 0, matches: 0, players: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAllAdminUsers(),
      getAllAdminRooms(),
      getAllAdminMatches(),
      searchPlayers({ limit: 500 }),
    ])
      .then(([users, rooms, matches, players]) => {
        if (!cancelled) {
          setStats({
            users: users.length,
            rooms: rooms.length,
            matches: matches.length,
            players: players.length,
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>;
  }

  const pendingMatches = stats.matches;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">System Dashboard</h1>
        <p className="mt-2 text-slate-500">Resumen de la infraestructura y datos del torneo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard label="Frontend" status="UP" icon={CheckCircle2} />
        <StatusCard label="API" status="UP" icon={Server} />
        <StatusCard label="Database" status="UP" icon={Database} />
        <StatusCard label="Cache" status="UP" icon={Activity} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatLink href="/admin/users" label="Usuarios" value={stats.users} icon={Users} color="text-primary" bg="bg-primary-xlight" />
        <StatLink href="/admin/rooms" label="Salas" value={stats.rooms} icon={DoorOpen} color="text-info" bg="bg-info-light" />
        <StatLink href="/admin/matches" label="Partidos" value={stats.matches} icon={Calendar} color="text-success" bg="bg-success-light" />
        <StatLink href="/admin/players" label="Jugadores" value={stats.players} icon={UserCircle} color="text-warning" bg="bg-warning-light" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Acciones rapidas</h2>
          <div className="grid gap-2">
            {[
              { href: '/admin/matches', label: 'Gestionar partidos y resultados' },
              { href: '/admin/players', label: 'Agregar jugadores al catalogo' },
              { href: '/admin/users', label: 'Promover administradores' },
              { href: '/admin/rooms', label: 'Moderar salas' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3.5 text-sm text-slate-700 transition-colors hover:border-primary-light hover:bg-primary-xlight/40 hover:text-primary"
              >
                {item.label}
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Actividad del torneo</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Partidos registrados</span>
              <span className="font-bold text-slate-900">{pendingMatches}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Salas activas</span>
              <span className="font-bold text-slate-900">{stats.rooms}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Jugadores en catalogo</span>
              <span className="font-bold text-slate-900">{stats.players}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
