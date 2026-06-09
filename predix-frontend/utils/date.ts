export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatGreetingDate(): string {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function getTimeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Iniciado';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 24) return `En ${Math.floor(h / 24)}d`;
  if (h > 0) return `En ${h}h ${m}m`;
  return `En ${m}m`;
}

export function isMatchClosed(fechaInicio: string): boolean {
  return Date.now() >= new Date(fechaInicio).getTime() - 10 * 60_000;
}
