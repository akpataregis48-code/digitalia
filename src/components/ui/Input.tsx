import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/lib/utils';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
};

export function Input({ label, error, hint, prefix, className, id, ...rest }: InputProps) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>
        )}
        <input
          id={inputId}
          className={classNames('input', prefix && 'pl-10', error && 'border-red-300 focus:border-red-400 focus:ring-red-400/15', className)}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, className, id, ...rest }: TextareaProps) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea id={inputId} className={classNames('input min-h-[100px] resize-y', error && 'border-red-300', className)} {...rest} />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, error, options, className, id, ...rest }: SelectProps) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <select id={inputId} className={classNames('input cursor-pointer', error && 'border-red-300', className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
