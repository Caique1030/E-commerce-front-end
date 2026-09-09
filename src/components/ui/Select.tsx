'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Select para controles visíveis fora de formulários, como a ordenação do catálogo.
 * É o <select> nativo com a mesma aparência de campo da loja; a lista aberta é a do sistema.
 */

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
}

interface SelectProps<V extends string> {
  value: V;
  onChange: (value: V) => void;
  options: readonly SelectOption<V>[];
  ariaLabel: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Select<V extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  size = 'md',
}: SelectProps<V>) {
  return (
    <div className={cn('relative inline-block', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as V)}
        aria-label={ariaLabel}
        className={cn(
          'rounded-campo border-borda-forte bg-branco text-tinta hover:border-tinta-3 focus:border-tinta w-full appearance-none border pr-8 pl-3 focus:outline-none',
          size === 'sm' ? 'text-apoio h-8' : 'text-corpo h-10',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="text-suave pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2"
        aria-hidden
      />
    </div>
  );
}
