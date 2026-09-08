'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Select estilizado (Radix) para controles visíveis fora de formulários, como a ordenação. */

export interface OpcaoSelect<V extends string = string> {
  valor: V;
  rotulo: string;
}

interface SelectProps<V extends string> {
  valor: V;
  aoMudar: (valor: V) => void;
  opcoes: readonly OpcaoSelect<V>[];
  rotuloAcessivel: string;
  className?: string;
  tamanho?: 'sm' | 'md';
}

export function Select<V extends string>({
  valor,
  aoMudar,
  opcoes,
  rotuloAcessivel,
  className,
  tamanho = 'md',
}: SelectProps<V>) {
  return (
    <SelectPrimitive.Root value={valor} onValueChange={(v) => aoMudar(v as V)}>
      <SelectPrimitive.Trigger
        aria-label={rotuloAcessivel}
        className={cn(
          'rounded-campo border-borda-forte bg-branco text-tinta hover:border-tinta-3 focus:border-tinta data-[state=open]:border-tinta inline-flex items-center justify-between gap-2 border px-3 focus:outline-none',
          tamanho === 'sm' ? 'text-apoio h-8' : 'text-corpo h-10',
          className,
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown className="text-suave size-4" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="rounded-card border-borda bg-branco shadow-flutuante z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden border"
        >
          <SelectPrimitive.Viewport className="p-1">
            {opcoes.map((o) => (
              <SelectPrimitive.Item
                key={o.valor}
                value={o.valor}
                className="rounded-campo text-corpo data-[highlighted]:bg-papel-2 relative flex cursor-pointer items-center py-2 pr-3 pl-8 outline-none select-none data-[state=checked]:font-medium"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2.5 inline-flex">
                  <Check className="text-verde-nota size-4" aria-hidden />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{o.rotulo}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
