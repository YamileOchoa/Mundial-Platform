import { ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  label?: string;
  aspectRatio?: string;
  className?: string;
  variant?: 'default' | 'purple' | 'dark';
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-400',
  purple:  'bg-gradient-to-br from-primary/20 to-primary/5 text-primary/40',
  dark:    'bg-gradient-to-br from-slate-800 to-slate-700 text-slate-500',
};

export default function PlaceholderImage({
  label = 'Imagen próximamente',
  aspectRatio = '16/9',
  className = '',
  variant = 'default',
}: PlaceholderImageProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed ${variantStyles[variant]} ${className}`}
      style={{ aspectRatio }}
      role="img"
      aria-label={label}
    >
      <ImageIcon size={32} strokeWidth={1.5} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
