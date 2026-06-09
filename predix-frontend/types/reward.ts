export type SobreTipo = 'oro' | 'plata' | 'bronce' | 'sorpresa';

export interface Reward {
  id: number;
  user_id: number;
  tipo_sobre: SobreTipo;
  fecha_obtenida: string;
  pdf_url: string | null;
}

export interface RewardPdfResponse {
  pdf_url: string;
}

export const SOBRE_META: Record<SobreTipo, { label: string; description: string; color: string; bg: string }> = {
  oro: {
    label: 'Sobre Oro',
    description: 'Desbloqueado al alcanzar 200 puntos acumulados.',
    color: 'text-gold',
    bg: 'bg-gold-light border-amber-200',
  },
  plata: {
    label: 'Sobre Plata',
    description: 'Desbloqueado al alcanzar 100 puntos acumulados.',
    color: 'text-slate-500',
    bg: 'bg-slate-50 border-slate-200',
  },
  bronce: {
    label: 'Sobre Bronce',
    description: 'Desbloqueado al alcanzar 50 puntos acumulados.',
    color: 'text-bronze',
    bg: 'bg-bronze-light border-orange-200',
  },
  sorpresa: {
    label: 'Sobre Sorpresa',
    description: 'Desbloqueado con una racha de 5 aciertos consecutivos.',
    color: 'text-primary',
    bg: 'bg-primary-xlight border-primary-light',
  },
};

export const SOBRE_GOALS: { tipo: SobreTipo; puntos?: number; racha?: number }[] = [
  { tipo: 'bronce', puntos: 50 },
  { tipo: 'plata', puntos: 100 },
  { tipo: 'oro', puntos: 200 },
  { tipo: 'sorpresa', racha: 5 },
];
