import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: 'cart' | 'search' | 'orders' | 'none';
  className?: string;
  compact?: boolean;
}

/* Ilustrações em linha, desenhadas com a mesma régua da faixa de agenda: leves, sem cor de preenchimento. */
const illustrations = {
  cart: (
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
  search: (
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
  orders: (
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
  none: null,
};

/** Tela vazia é convite para agir: frase de direção + uma ação, sem lamentar. */
export function EmptyState({
  title,
  description,
  action,
  illustration = 'none',
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-16',
        className,
      )}
    >
      {illustrations[illustration] && (
        <div className="text-suave/70 mb-1">{illustrations[illustration]}</div>
      )}
      <p className="text-h2 text-tinta">{title}</p>
      {description && <p className="text-corpo text-suave max-w-md">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
