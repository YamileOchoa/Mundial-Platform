import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-14 text-center sm:py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Icon size={28} className="text-slate-400" strokeWidth={1.5} />
      </div>
      <div className="max-w-sm">
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
