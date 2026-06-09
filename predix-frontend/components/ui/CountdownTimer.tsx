'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold tabular-nums text-white sm:text-2xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({
  targetDate,
  label = 'MUNDIAL 2026',
  className = '',
}: CountdownTimerProps) {
  const target = new Date(targetDate).getTime();
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div
      className={`rounded-lg bg-gradient-to-br from-slate-900 via-primary-dark to-primary p-4 ${className}`}
    >
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/70">
        {label}
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <Unit value={time.days} label="Dias" />
        <span className="text-lg font-bold text-white/40">:</span>
        <Unit value={time.hours} label="Horas" />
        <span className="text-lg font-bold text-white/40">:</span>
        <Unit value={time.minutes} label="Min" />
        <span className="text-lg font-bold text-white/40">:</span>
        <Unit value={time.seconds} label="Seg" />
      </div>
    </div>
  );
}
