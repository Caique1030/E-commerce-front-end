'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
  className?: string;
}

/** Páginas visíveis: primeira, última, atual e vizinhas; reticências no que sobra. */
function paginasVisiveis(atual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const conjunto = new Set<number>([1, total, atual - 1, atual, atual + 1]);
  const ordenadas = [...conjunto].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const saida: (number | '…')[] = [];
  for (let i = 0; i < ordenadas.length; i++) {
    if (i > 0 && ordenadas[i] - ordenadas[i - 1] > 1) saida.push('…');
    saida.push(ordenadas[i]);
  }
  return saida;
}

export function Paginacao({ pagina, totalPaginas, aoMudar, className }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;
  const botao =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-campo border px-2 text-apoio font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Paginação" className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => aoMudar(pagina - 1)}
        disabled={pagina <= 1}
        className={cn(botao, 'border-borda-forte bg-branco hover:bg-papel-2')}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {paginasVisiveis(pagina, totalPaginas).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="text-suave px-1" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => aoMudar(p)}
            aria-current={p === pagina ? 'page' : undefined}
            aria-label={`Página ${p}`}
            className={cn(
              botao,
              p === pagina
                ? 'border-acao bg-acao text-branco'
                : 'border-borda-forte bg-branco hover:bg-papel-2',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => aoMudar(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className={cn(botao, 'border-borda-forte bg-branco hover:bg-papel-2')}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
