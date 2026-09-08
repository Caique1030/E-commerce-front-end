'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Menu suspenso (Radix DropdownMenu) para o menu da conta. */

export const MenuRaiz = DropdownMenu.Root;
export const MenuGatilho = DropdownMenu.Trigger;

export function MenuConteudo({
  children,
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={6}
        className={cn(
          'rounded-card border-borda bg-branco shadow-flutuante z-50 min-w-56 border p-1',
          className,
        )}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  children,
  className,
  destrutivo,
  ...props
}: ComponentProps<typeof DropdownMenu.Item> & { destrutivo?: boolean }) {
  return (
    <DropdownMenu.Item
      className={cn(
        'rounded-campo text-corpo data-[highlighted]:bg-papel-2 flex cursor-pointer items-center gap-2 px-3 py-2 outline-none select-none',
        destrutivo && 'text-alerta data-[highlighted]:bg-alerta-suave',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function MenuRotulo({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu.Label className="text-apoio text-suave px-3 pt-2 pb-1">
      {children}
    </DropdownMenu.Label>
  );
}

export function MenuSeparador() {
  return <DropdownMenu.Separator className="bg-borda my-1 h-px" />;
}
