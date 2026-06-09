import Link from 'next/link';
import Image from 'next/image';
import PublicNavbar from '@/components/layout/PublicNavbar';
import GlobalRankingPreview from '@/components/landing/GlobalRankingPreview';
import Button from '@/components/ui/Button';
import { ArrowRight, Users, Trophy, Zap, Medal, Star, Award } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const STATS = [
  { value: '48', label: 'Selecciones' },
  { value: '104', label: 'Partidos' },
  { value: '12', label: 'Estadios' },
  { value: '100%', label: 'Gratis' },
];

const STEPS = [
  { icon: Users, title: 'Crea tu sala privada', description: 'Arma tu grupo exclusivo con amigos o compañeros con un código único.' },
  { icon: Zap, title: 'Predice con precisión', description: 'Gana puntos exactos adivinando marcadores, goleadores y minutos clave.' },
  { icon: Trophy, title: 'Sube a la cima', description: 'Escala en el ranking y demuestra que eres el mejor predictor del torneo.' },
];

const SCORING_RULES = [
  { pts: '+3', title: 'Marcador exacto', desc: 'Acierta el resultado completo del partido.' },
  { pts: '+1', title: 'Ganador correcto', desc: 'Predice quién gana o si hay empate.' },
  { pts: '+1', title: 'Goleador', desc: 'Acierta el jugador que marca.' },
  { pts: '+1', title: 'Primer gol', desc: 'Minuto del primer gol con margen de 5 min.' },
];

const REWARDS = [
  { icon: Medal, label: 'Oro', title: 'Sobre Oro', description: '200 pts', color: 'border-amber-200 bg-amber-50', labelColor: 'text-amber-600' },
  { icon: Award, label: 'Plata', title: 'Sobre Plata', description: '100 pts', color: 'border-slate-200 bg-slate-50', labelColor: 'text-slate-500' },
  { icon: Trophy, label: 'Bronce', title: 'Sobre Bronce', description: '50 pts', color: 'border-orange-200 bg-orange-50', labelColor: 'text-orange-600' },
  { icon: Star, label: 'Especial', title: 'Sobre Sorpresa', description: 'Racha', color: 'border-primary-light bg-primary-xlight', labelColor: 'text-primary' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf5ff] selection:bg-primary-light selection:text-primary-dark">
      <PublicNavbar />

      {/* Hero Premium Claro */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-32">
        {/* Decorative blur blobs */}
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-primary-light/40 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 text-center lg:text-left z-10">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-md px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <Star size={14} className="fill-primary" />
              La experiencia premium del Mundial 2026
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl lg:leading-[1.1]">
              Predice la gloria. <br />
              <span className="bg-gradient-to-r from-primary to-[#c4b5fd] bg-clip-text text-transparent">Domina el juego.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 mx-auto lg:mx-0">
              Diseño, precisión y recompensas. Arma tu sala privada con amigos y demuestra tu conocimiento en la plataforma de predicciones más elegante del mundo.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="shadow-lg shadow-primary/30 h-14 px-8 text-base transition-transform hover:-translate-y-1">
                  Comenzar gratis <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="#ranking">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base bg-white/50 backdrop-blur-sm border-white shadow-sm hover:bg-white hover:border-primary-light transition-all">
                  Ver clasificación
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-xl relative z-10">
            {/* Glass frame para la imagen */}
            <div className="relative aspect-[4/3] w-full rounded-3xl p-3 glass-card">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                <Image
                  src="/images/hero_stadium_light.png"
                  alt="Estadio Mundial Premium"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-success-light to-success flex items-center justify-center text-white font-bold shadow-md">
                  +3
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acierto Exacto</p>
                  <p className="text-sm font-bold text-slate-900">Marcador 2 - 1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Flotantes */}
      <section className="relative z-20 mx-auto max-w-6xl px-5 sm:px-8 -mt-8 mb-16">
        <div className="glass-card rounded-3xl overflow-hidden grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100/50">
          {STATS.map(({ value, label }) => (
            <div key={label} className="p-8 text-center bg-white/40">
              <p className="text-4xl font-extrabold text-slate-900">{value}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold text-slate-900">Una experiencia <span className="text-primary">impecable</span></h2>
            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-primary-light" />
            <p className="mt-6 text-lg text-slate-500">Tres simples pasos hacia la gloria mundialista</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <div key={title} className="glass-card rounded-3xl p-8 bg-slate-50/50 border border-slate-100">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/20">
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{title}</h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reglas y Recompensas combinadas en un layout hermoso */}
      <section id="puntuacion" className="bg-[#faf5ff] py-24 relative overflow-hidden">
        {/* Accent blob */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Izquierda: Trofeo e Info */}
            <div className="flex-1 lg:max-w-md w-full">
              <h2 className="text-4xl font-extrabold text-slate-900">Gana Puntos. <br/>Desbloquea Premios.</h2>
              <p className="mt-4 text-lg text-slate-600 mb-8">
                Nuestro sistema de puntuación premia la exactitud. Acumula puntos reales y gana sobres de cromos coleccionables en el proceso.
              </p>
              <div className="relative aspect-square w-full max-w-sm mx-auto lg:mx-0 glass-card rounded-full p-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-xlight to-primary-light/30 blur-2xl -z-10" />
                <Image
                  src="/images/trophy_lavender.png"
                  alt="Trofeo Lavanda Premium"
                  width={300}
                  height={300}
                  className="object-contain drop-shadow-2xl hover:rotate-3 hover:scale-105 transition-all duration-500"
                />
              </div>
            </div>

            {/* Derecha: Grid de Reglas */}
            <div className="flex-1 grid gap-4 sm:grid-cols-2 w-full">
              {SCORING_RULES.map(rule => (
                <div key={rule.title} className="glass-card rounded-2xl p-6 bg-white/60">
                  <p className="text-3xl font-black text-primary bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary-dark">{rule.pts}</p>
                  <h3 className="mt-3 font-bold text-slate-900 text-lg">{rule.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{rule.desc}</p>
                </div>
              ))}
              {/* Card CTA Extra */}
              <div className="sm:col-span-2 glass-card rounded-2xl p-6 bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-between shadow-xl shadow-primary/30">
                <div>
                  <h3 className="font-bold text-xl">¿Listo para coleccionar?</h3>
                  <p className="text-primary-light text-sm mt-1">Gana tu primer sobre Oro al llegar a 200 pts.</p>
                </div>
                <Link href="/register">
                  <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30">Ver más <ArrowRight size={16} /></Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Ranking preview */}
      <section id="ranking" className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-primary mb-3 block">El Salón de la Fama</span>
            <h2 className="text-4xl font-extrabold text-slate-900">Ranking Global</h2>
          </div>
          <GlobalRankingPreview />
        </div>
      </section>

      {/* CTA Final */}
      <section className="mx-5 mb-12 sm:mx-8">
        <div className="mx-auto max-w-6xl glass-card rounded-3xl bg-gradient-to-br from-white to-primary-xlight p-12 text-center shadow-xl border-primary/10">
          <h2 className="text-4xl font-extrabold text-slate-900">¿Estás listo para hacer historia?</h2>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">Únete a miles de fanáticos y demuestra que tus pronósticos no tienen rival.</p>
          <Link href="/register" className="mt-10 inline-block">
            <Button size="lg" className="h-14 px-10 text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Crear cuenta ahora <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 shadow-none" />
            <div>
              <p className="font-bold text-slate-900">PREDIX</p>
              <p className="text-xs">Predicciones del Mundial 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-medium">
            <Link href="/login" className="hover:text-primary transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Registrarse</Link>
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase">USA · CAN · MEX 2026</p>
        </div>
      </footer>
    </div>
  );
}
