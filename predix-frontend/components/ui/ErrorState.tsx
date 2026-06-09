import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'No pudimos cargar los datos. Verifica tu conexion e intenta de nuevo.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-14 text-center sm:py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-light">
        <AlertCircle size={28} className="text-danger" strokeWidth={1.5} />
      </div>
      <div className="max-w-md">
        <p className="font-semibold text-slate-800">Algo salio mal</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} /> Reintentar
        </Button>
      )}
    </div>
  );
}
