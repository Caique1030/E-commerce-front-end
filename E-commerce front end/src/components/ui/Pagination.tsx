'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Páginas visíveis: primeira, última, atual e vizinhas; reticências no que sobra. */
function visiblePages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
    out.push(sorted[i]);
  }
  return out;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const button =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-campo border px-2 text-apoio font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Paginação" className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={cn(button, 'border-borda-forte bg-branco hover:bg-papel-2')}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {visiblePages(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="text-suave px-1" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Página ${p}`}
            className={cn(
              button,
              p === page
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
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(button, 'border-borda-forte bg-branco hover:bg-papel-2')}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
