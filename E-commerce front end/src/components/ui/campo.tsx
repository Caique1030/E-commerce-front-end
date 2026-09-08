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

export function capitalizarMensagem(m?: string): string | undefined {
  if (!m) return m;
  return m.charAt(0).toUpperCase() + m.slice(1);
}

const estiloBase =
  'w-full rounded-campo border bg-branco px-3 text-corpo text-tinta placeholder:text-suave/80 transition-colors ' +
  'border-borda-forte hover:border-tinta-3 focus:border-tinta focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-papel-2 disabled:text-suave ' +
  'aria-[invalid=true]:border-alerta aria-[invalid=true]:focus:border-alerta';

export interface CampoProps {
  rotulo: string;
  dica?: string;
  erro?: string;
  obrigatorio?: boolean;
  /** Esconde o rótulo visualmente (fica só para leitor de tela). */
  rotuloOculto?: boolean;
  className?: string;
  children: (a11y: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': true | undefined;
    'aria-required': true | undefined;
  }) => ReactNode;
}

export function Campo({
  rotulo,
  dica,
  erro,
  obrigatorio,
  rotuloOculto,
  className,
  children,
}: CampoProps) {
  const id = useId();
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  const describedBy = [idErro, idDica].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-apoio text-tinta font-medium', rotuloOculto && 'sr-only')}
      >
        {rotulo}
        {obrigatorio && (
          <span className="text-alerta" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': erro ? true : undefined,
        'aria-required': obrigatorio ? true : undefined,
      })}
      {erro ? (
        <p id={idErro} className="text-apoio text-alerta" role="alert">
          {capitalizarMensagem(erro)}
        </p>
      ) : dica ? (
        <p id={idDica} className="text-apoio text-suave">
          {dica}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(estiloBase, 'h-10', className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(estiloBase, 'min-h-24 py-2 leading-6', className)}
      {...props}
    />
  );
});

/** Select nativo: acessível por padrão e integra direto com React Hook Form. */
export const Selecao = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Selecao({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(estiloBase, 'h-10 appearance-none pr-9', className)}
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

export interface CaixaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  rotulo: ReactNode;
  descricao?: string;
}

/** Checkbox com rótulo clicável. */
export const Caixa = forwardRef<HTMLInputElement, CaixaProps>(function Caixa(
  { rotulo, descricao, className, id, ...props },
  ref,
) {
  const gerado = useId();
  const idFinal = id ?? gerado;
  return (
    <label htmlFor={idFinal} className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <input
        ref={ref}
        id={idFinal}
        type="checkbox"
        className="border-borda-forte accent-verde-nota mt-0.5 size-4 shrink-0 cursor-pointer rounded-sm"
        {...props}
      />
      <span className="text-corpo">
        {rotulo}
        {descricao && <span className="text-apoio text-suave block">{descricao}</span>}
      </span>
    </label>
  );
});
