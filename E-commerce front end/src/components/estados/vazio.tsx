import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VazioProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  ilustracao?: 'carrinho' | 'busca' | 'pedidos' | 'nenhuma';
  className?: string;
  compacto?: boolean;
}

/* Ilustrações em linha, desenhadas com a mesma régua da faixa de agenda: leves, sem cor de preenchimento. */
const ilustracoes = {
  carrinho: (
    <svg
      viewBox="0 0 96 64"
      className="h-16 w-24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M8 10h10l8 34h44l6-24H24" strokeLinejoin="round" />
      <circle cx="30" cy="54" r="3.5" />
      <circle cx="64" cy="54" r="3.5" />
      <path d="M36 30h26M40 22h18" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  ),
  busca: (
    <svg
      viewBox="0 0 96 64"
      className="h-16 w-24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="42" cy="28" r="16" />
      <path d="M54 40l14 14" strokeLinecap="round" />
      <path d="M34 28h16M42 20v16" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  ),
  pedidos: (
    <svg
      viewBox="0 0 96 64"
      className="h-16 w-24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M26 8h44v48l-6-4-6 4-5-4-5 4-5-4-5 4-6-4-6 4z" strokeLinejoin="round" />
      <path d="M36 22h24M36 30h24M36 38h14" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  ),
  nenhuma: null,
};

/** Tela vazia é convite para agir: frase de direção + uma ação, sem lamentar. */
export function Vazio({
  titulo,
  descricao,
  acao,
  ilustracao = 'nenhuma',
  className,
  compacto = false,
}: VazioProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compacto ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-16',
        className,
      )}
    >
      {ilustracoes[ilustracao] && (
        <div className="text-suave/70 mb-1">{ilustracoes[ilustracao]}</div>
      )}
      <p className="text-h2 text-tinta">{titulo}</p>
      {descricao && <p className="text-corpo text-suave max-w-md">{descricao}</p>}
      {acao && <div className="mt-2 flex flex-wrap justify-center gap-2">{acao}</div>}
    </div>
  );
}
