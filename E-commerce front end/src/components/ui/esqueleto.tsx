import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Bloco de esqueleto com a forma real do conteúdo. Nunca um spinner centralizado. */
export function Esqueleto({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-esqueleto rounded-campo bg-papel-2 motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
