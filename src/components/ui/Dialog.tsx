'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Dois contêineres flutuantes sobre o <dialog> nativo do navegador, que já resolve trap de foco,
 * Esc, fundo inerte e retorno do foco a quem abriu. Aqui só entram a coreografia da animação de
 * saída (o `close()` espera o `animationend`) e o bloqueio da rolagem do fundo:
 *  - Modal: centralizado, para confirmações e formulários curtos
 *  - Drawer: painel lateral, para o carrinho, o menu do celular e filtros
 *
 * Todos os diálogos do projeto são controlados (`open` + `onOpenChange`).
 */

/* Um pouco acima dos 150ms/120ms das animações de saída de globals.css. */
const EXIT_FALLBACK_MS = 250;

let scrollLocks = 0;
let previousScroll: { overflow: string; paddingRight: string } | null = null;

/** Trava a rolagem do fundo compensando a largura da barra, para a página não pular. */
function lockScroll(): () => void {
  if (scrollLocks === 0) {
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    previousScroll = {
      overflow: html.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    html.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
  }
  scrollLocks += 1;
  return () => {
    scrollLocks -= 1;
    if (scrollLocks === 0 && previousScroll) {
      document.documentElement.style.overflow = previousScroll.overflow;
      document.body.style.paddingRight = previousScroll.paddingRight;
      previousScroll = null;
    }
  };
}

interface UseNativeDialogArgs {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useNativeDialog({ open, onOpenChange }: UseNativeDialogArgs) {
  const ref = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);
  const onOpenChangeRef = useRef(onOpenChange);

  // `closing` segura o conteúdo montado enquanto a animação de saída roda.
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setClosing(true);
  }
  const mounted = open || closing;

  useEffect(() => {
    openRef.current = open;
    onOpenChangeRef.current = onOpenChange;
  }, [open, onOpenChange]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // O conteúdo já está montado neste ponto: o foco inicial encontra os controles.
    if (open) {
      dialog.dataset.state = 'open';
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (!closing) return;
    dialog.dataset.state = 'closed';

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      dialog.removeEventListener('animationend', onAnimationEnd);
      if (dialog.open) dialog.close();
      setClosing(false);
    };
    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.target === dialog) finish();
    };
    dialog.addEventListener('animationend', onAnimationEnd);
    const timer = setTimeout(finish, dialog.open ? EXIT_FALLBACK_MS : 0);

    return () => {
      clearTimeout(timer);
      dialog.removeEventListener('animationend', onAnimationEnd);
    };
  }, [open, closing]);

  // Esc dispara `cancel` antes de fechar: interceptado para passar pela animação de saída.
  // Se mesmo assim o navegador fechar sozinho, `close` devolve o estado ao dono do diálogo.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onOpenChangeRef.current(false);
    };
    const onClose = () => {
      if (openRef.current) onOpenChangeRef.current(false);
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onClose);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onClose);
    };
  }, []);

  useEffect(() => (open ? lockScroll() : undefined), [open]);

  function onBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    // Clique no fundo escurecido tem o próprio <dialog> como alvo; dentro do painel o alvo é
    // sempre um filho, porque o cabeçalho, o corpo e o rodapé ocupam a caixa de ponta a ponta.
    if (e.target === ref.current) onOpenChange(false);
  }

  return { ref, mounted, onBackdropClick };
}

interface DialogChromeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Descrição para leitor de tela; pode ficar oculta visualmente. */
  description?: string;
  descriptionHidden?: boolean;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export type ModalProps = DialogChromeProps;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  descriptionHidden = false,
  footer,
  className,
  children,
}: ModalProps) {
  const { ref, mounted, onBackdropClick } = useNativeDialog({ open, onOpenChange });
  const titleId = useId();
  const descriptionId = description ? `${titleId}-descricao` : undefined;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={onBackdropClick}
      className={cn(
        'modal-painel rounded-card border-borda bg-branco text-tinta shadow-flutuante fixed inset-auto top-1/2 left-1/2 hidden max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col border open:flex focus:outline-none',
        className,
      )}
    >
      {mounted && (
        <>
          <div className="border-borda flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <h2 id={titleId} className="text-h2">
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className={cn('text-apoio text-suave mt-1', descriptionHidden && 'sr-only')}
                >
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta -mt-1 -mr-2 p-2"
              aria-label="Fechar"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="border-borda flex flex-wrap justify-end gap-2 border-t px-5 py-3">
              {footer}
            </div>
          )}
        </>
      )}
    </dialog>
  );
}

export interface DrawerProps extends DialogChromeProps {
  side?: 'left' | 'right';
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  descriptionHidden = true,
  footer,
  side = 'right',
  className,
  children,
}: DrawerProps) {
  const { ref, mounted, onBackdropClick } = useNativeDialog({ open, onOpenChange });
  const titleId = useId();
  const descriptionId = description ? `${titleId}-descricao` : undefined;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={onBackdropClick}
      className={cn(
        'border-borda bg-branco text-tinta shadow-flutuante fixed inset-y-0 hidden h-full max-h-none w-full max-w-md flex-col border open:flex focus:outline-none',
        side === 'left'
          ? 'drawer-painel-esquerda right-auto left-0 border-r'
          : 'drawer-painel right-0 left-auto border-l',
        className,
      )}
    >
      {mounted && (
        <>
          <div className="border-borda flex items-center justify-between gap-4 border-b px-5 py-4">
            <div>
              <h2 id={titleId} className="text-h2">
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className={cn('text-apoio text-suave', descriptionHidden && 'sr-only')}
                >
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta -mr-2 p-2"
              aria-label="Fechar"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-borda border-t px-5 py-4">{footer}</div>}
        </>
      )}
    </dialog>
  );
}
