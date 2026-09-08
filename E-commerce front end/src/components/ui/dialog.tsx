'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Dois contêineres flutuantes sobre o Radix Dialog (trap de foco, Esc e aria resolvidos):
 *  - Modal: centralizado, para confirmações e formulários curtos
 *  - Drawer: painel lateral direito, para o carrinho e filtros no mobile
 */

/* Todos os diálogos do projeto são controlados (`aberto` + `aoFechar`), então só a raiz é exposta. */
export const DialogRaiz = DialogPrimitive.Root;

interface ConteudoProps {
  titulo: string;
  /** Descrição para leitor de tela; pode ficar oculta visualmente. */
  descricao?: string;
  descricaoOculta?: boolean;
  children: ReactNode;
  className?: string;
  rodape?: ReactNode;
}

export function ModalConteudo({
  titulo,
  descricao,
  descricaoOculta = false,
  children,
  className,
  rodape,
}: ConteudoProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="drawer-overlay bg-tinta/45 fixed inset-0 z-50" />
      <DialogPrimitive.Content
        className={cn(
          'modal-painel rounded-card border-borda bg-branco shadow-flutuante fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col border focus:outline-none',
          className,
        )}
      >
        <div className="border-borda flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <DialogPrimitive.Title className="text-h2">{titulo}</DialogPrimitive.Title>
            {descricao && (
              <DialogPrimitive.Description
                className={cn('text-apoio text-suave mt-1', descricaoOculta && 'sr-only')}
              >
                {descricao}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta -mt-1 -mr-2 p-2"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {rodape && (
          <div className="border-borda flex flex-wrap justify-end gap-2 border-t px-5 py-3">
            {rodape}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DrawerConteudo({
  titulo,
  descricao,
  descricaoOculta = true,
  children,
  className,
  rodape,
  lado = 'direita',
}: ConteudoProps & { lado?: 'direita' | 'esquerda' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="drawer-overlay bg-tinta/45 fixed inset-0 z-50" />
      <DialogPrimitive.Content
        className={cn(
          'border-borda bg-branco shadow-flutuante fixed inset-y-0 z-50 flex w-full max-w-md flex-col focus:outline-none',
          lado === 'esquerda'
            ? 'drawer-painel-esquerda left-0 border-r'
            : 'drawer-painel right-0 border-l',
          className,
        )}
      >
        <div className="border-borda flex items-center justify-between gap-4 border-b px-5 py-4">
          <div>
            <DialogPrimitive.Title className="text-h2">{titulo}</DialogPrimitive.Title>
            {descricao && (
              <DialogPrimitive.Description
                className={cn('text-apoio text-suave', descricaoOculta && 'sr-only')}
              >
                {descricao}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta -mr-2 p-2"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {rodape && <div className="border-borda border-t px-5 py-4">{rodape}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
