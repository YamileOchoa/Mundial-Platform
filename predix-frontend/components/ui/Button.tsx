import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary active:scale-[0.98]',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.98]',
  danger:
    'bg-danger text-white hover:bg-red-600 active:scale-[0.98] shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-md gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
