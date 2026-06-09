import type { ReactNode } from 'react';

type Variant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'muted'
  | 'gold'
  | 'silver'
  | 'bronze';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary-xlight text-primary',
  success: 'bg-success-light text-emerald-700',
  danger:  'bg-danger-light text-red-700',
  warning: 'bg-warning-light text-amber-700',
  info:    'bg-info-light text-blue-700',
  muted:   'bg-slate-100 text-slate-500',
  gold:    'bg-gold-light text-amber-700',
  silver:  'bg-slate-100 text-slate-500',
  bronze:  'bg-bronze-light text-amber-900',
};

export default function Badge({
  variant = 'muted',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
