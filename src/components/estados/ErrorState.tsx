'use client';

import { WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api/cliente';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  extraAction?: ReactNode;
  className?: string;
  compact?: boolean;
}

/** Explica o que houve e oferece "Tentar de novo". Sem "ops", sem pedir desculpa. */
export function ErrorState({
  error,
  title,
  description,
  onRetry,
  retrying,
  extraAction,
  className,
  compact = false,
}: ErrorStateProps) {
  const network = error instanceof ApiError && error.ehRede;
  const finalTitle =
    title ??
    (network ? 'Não foi possível carregar os dados.' : 'Não foi possível carregar esta parte.');
  const finalDescription =
    description ??
    (network
      ? 'Verifique sua conexão e se a API está no ar.'
      : error instanceof ApiError
        ? error.message
        : 'Tente de novo em instantes.');

  return (
    <div
      role="alert"
      className={cn(
        'rounded-card border-alerta/25 bg-alerta-suave/40 flex flex-col items-center justify-center border text-center',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12',
        className,
      )}
    >
      {network && <WifiOff className="text-alerta size-8" aria-hidden strokeWidth={1.5} />}
      <p className="text-h2 text-tinta">{finalTitle}</p>
      <p className="text-corpo text-suave max-w-md">{finalDescription}</p>
      {(onRetry || extraAction) && (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button variant="secondary" onClick={onRetry} loading={retrying}>
              Tentar de novo
            </Button>
          )}
          {extraAction}
        </div>
      )}
    </div>
  );
}
