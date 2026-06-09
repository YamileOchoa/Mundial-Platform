import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export default function Card({
  children,
  padding = 'md',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-lg border border-slate-100 bg-white shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        paddingMap[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
