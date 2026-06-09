import Link from 'next/link';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import Button from '@/components/ui/Button';
import { ArrowRight, CheckCircle2, Users, Trophy, Zap } from 'lucide-react';

/* ─── Stats bar data ──────────────────────────── */
const STATS = [
  { value: '32', label: 'Selecciones' },
  { value: '64', label: 'Partidos' },
  { value: '6', label: 'Grupos' },
  { value: '100%', label: 'Gratis' },
];

/* ─── Steps ───────────────────────────────────── */
const STEPS = [
  {
    number: '01',
    icon: Users,
    title: 'Crea o únete a una sala',
    description:
      'Arma tu grupo con amigos, familia o compañeros de trabajo. Cada sala tiene su propio ranking.',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Predice los resultados',
    description:
      'Antes de cada partido indica el marcador, el goleador y más detalles para maximizar tus puntos.',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Sube al ranking y gana',
    description:
      'Acumula puntos con cada acierto. El jugador con mayor puntaje al final del torneo gana.',
  },
];

/* ─── Scoring rules ───────────────────────────── */
const SCORING_RULES = [
  { rule: 'Resultado correcto (ganador o empate)', points: '+1 pt' },
  { rule: 'Marcador exacto', points: '+3 pts' },
  { rule: 'Goleador correcto', points: '+1 pt' },
  { rule: 'Jugador amonestado correcto', points: '+1 pt' },
  { rule: 'Tipo de tarjeta correcto', points: '+0.5 pts' },
  { rule: 'Minuto del primer gol (±5 min)', points: '+1 pt' },
  { rule: 'Racha de aciertos consecutivos', points: '×1.5' },
  { rule: 'Prediccion fuera de tiempo', points: '0 pts' },
];

/* ─── Rewards ──────────────────────────────────── */
const REWARDS = [
  {
    icon: '🥇',
    label: 'Oro',
    title: 'Campeon de Sala',
    description: 'El jugador con mas puntos al finalizar el torneo.',
    color: 'border-amber-200 bg-amber-50',
    labelColor: 'text-amber-600',
  },
  {
    icon: '🥈',
    label: 'Plata',
    title: 'Subcampeon',
    description: 'Segundo puesto en la clasificacion final de tu sala.',
    color: 'border-slate-200 bg-slate-50',
    labelColor: 'text-slate-500',
  },
  {
    icon: '🥉',
    label: 'Bronce',
    title: 'Tercer Puesto',
    description: 'Tercer lugar en el ranking de tu sala al cierre del torneo.',
    color: 'border-orange-200 bg-orange-50',
    labelColor: 'text-orange-600',
  },
  {
    icon: '★',
    label: 'Especial',
    title: 'Insignias de Logros',
    description: 'Desbloquea logros por racha perfecta, goleador exacto y mas.',
    color: 'border-primary-light bg-primary-xlight',
    labelColor: 'text-primary',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-xlight px-4 py-1.5 text-sm font-medium text-primary">
              Mundial 2026 · USA · CAN · MEX
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Predice. Compite.{' '}
              <span className="text-primary">Gana.</span>
            </h1>
            <p className="max-w-lg text-lg text-slate-600">
              La plataforma de predicciones del Mundial de Futbol 2026. Crea salas privadas,
              desafía a tus amigos y demuestra quién conoce mejor el futbol.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register">
                <Button size="lg">
                  Comenzar gratis
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button variant="outline" size="lg">
                  Como funciona
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-500">
              {['Sin costo', 'Registro en 30 segundos', 'Salas privadas'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-success" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — placeholder */}
          <div>
            <PlaceholderImage
              label="Imagen principal del Mundial 2026"
              aspectRatio="4/3"
              variant="purple"
              className="w-full shadow-card-hover"
            />
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-slate-50 px-6 py-8 text-center">
              <p className="text-4xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────── */}
      <section
        id="como-funciona"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6"
      >
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Como funciona</h2>
          <p className="mt-3 text-slate-500">
            En tres pasos estás listo para competir
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <span className="text-5xl font-black text-slate-100">
                  {number}
                </span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-xlight text-primary">
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scoring rules ────────────────────────── */}
      <section
        id="puntuacion"
        className="bg-slate-50 px-4 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Sistema de puntuacion</h2>
            <p className="mt-3 text-slate-500">
              Cada detalle suma. Entre mas precisa la prediccion, mas puntos
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
            {SCORING_RULES.map(({ rule, points }, i) => (
              <div
                key={rule}
                className={`flex items-center justify-between px-5 py-4 ${
                  i < SCORING_RULES.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <span className="text-sm text-slate-700">{rule}</span>
                <span className="ml-4 shrink-0 text-sm font-semibold text-primary">
                  {points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards ──────────────────────────────── */}
      <section
        id="recompensas"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6"
      >
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Recompensas</h2>
          <p className="mt-3 text-slate-500">
            Compite por el primer lugar y desbloquea insignias exclusivas
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REWARDS.map(({ label, title, description, color, labelColor }) => (
            <div
              key={title}
              className={`flex flex-col gap-3 rounded-lg border p-5 ${color}`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
                {label}
              </span>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────── */}
      <section className="border-t border-slate-100 bg-primary px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">
            El Mundial 2026 esta a punto de empezar
          </h2>
          <p className="mt-4 text-lg text-primary-light">
            Crea tu cuenta ahora, arma tu sala y demuestra que sabes de futbol.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                className="shadow-md"
              >
                Crear cuenta gratis
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/50"
              >
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold">
              P
            </div>
            PREDIX
          </div>
          <p>Mundial de Futbol 2026 · USA, Canada y Mexico</p>
          <p>Hecho con dedicacion para los amantes del futbol</p>
        </div>
      </footer>
    </div>
  );
}
