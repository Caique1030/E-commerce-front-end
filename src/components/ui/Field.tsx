'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Campos de formulário com rótulo, dica e erro ligados por aria-describedby.
 * Mensagens do Zod chegam em minúsculas (iguais às do back); a primeira letra é capitalizada aqui.
 */

export function capitalizeMessage(m?: string): string | undefined {
  if (!m) return m;
  return m.charAt(0).toUpperCase() + m.slice(1);
}

const baseStyle =
  'w-full rounded-campo border bg-branco px-3 text-corpo text-tinta placeholder:text-suave/80 transition-colors ' +
  'border-borda-forte hover:border-tinta-3 focus:border-acao focus:ring-acao/30 focus:ring-2 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-papel-2 disabled:text-suave ' +
  'aria-[invalid=true]:border-alerta aria-[invalid=true]:focus:border-alerta';

export interface FieldA11y {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
}

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Esconde o rótulo visualmente (fica só para leitor de tela). */
  labelHidden?: boolean;
  className?: string;
  children: (a11y: FieldA11y) => ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  labelHidden,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-dica` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-apoio text-tinta font-medium', labelHidden && 'sr-only')}
      >
        {label}
        {required && (
          <span className="text-alerta" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {error ? (
        <p id={errorId} className="text-apoio text-alerta" role="alert">
          {capitalizeMessage(error)}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-apoio text-suave">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseStyle, 'h-10', className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseStyle, 'min-h-24 py-2 leading-6', className)}
      {...props}
    />
  );
});

/** Select nativo: acessível por padrão e integra direto com React Hook Form. */
export const NativeSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function NativeSelect({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(baseStyle, 'h-10 appearance-none pr-9', className)}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="text-suave pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  },
);

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: string;
}

/** Checkbox com rótulo clicável. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, ...props },
  ref,
) {
  const generated = useId();
  const finalId = id ?? generated;
  return (
    <label htmlFor={finalId} className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <input
        ref={ref}
        id={finalId}
        type="checkbox"
        className="border-borda-forte accent-acao mt-0.5 size-4 shrink-0 cursor-pointer rounded-sm"
        {...props}
      />
      <span className="text-corpo">
        {label}
        {description && <span className="text-apoio text-suave block">{description}</span>}
      </span>
    </label>
  );
});
