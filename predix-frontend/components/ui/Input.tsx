import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-md border bg-slate-50 px-3 py-2.5 text-sm text-slate-900',
              'placeholder:text-slate-400',
              'transition-colors duration-150',
              'focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : 'border-slate-200 hover:border-slate-300',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {rightIcon && (
            <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
