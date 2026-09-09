'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type Dispatch,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
import type { PolymorphicProps } from '@/lib/polymorphic';
import { cn } from '@/lib/utils';

/**
 * Menu suspenso feito à mão para o menu da conta: gatilho com aria-haspopup/aria-expanded,
 * itens com role="menuitem", setas, Home/End, Esc, clique fora e retorno do foco ao gatilho.
 * Sem portal: o cabeçalho é sticky e não tem overflow que corte o painel.
 */

interface MenuContextValue {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentId: string;
  openDirectionRef: RefObject<'first' | 'last'>;
  skipFocusReturnRef: RefObject<boolean>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(component: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${component}> precisa estar dentro de <Menu>`);
  return ctx;
}

export function Menu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const openDirectionRef = useRef<'first' | 'last'>('first');
  const skipFocusReturnRef = useRef(false);

  // Clique fora fecha sem puxar o foco de volta: o usuário já escolheu outro lugar da página.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        skipFocusReturnRef.current = true;
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Ao fechar por teclado ou por um item, o foco volta ao gatilho.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open) {
      if (!skipFocusReturnRef.current) triggerRef.current?.focus();
      skipFocusReturnRef.current = false;
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <MenuContext.Provider
      value={{ open, setOpen, triggerRef, contentId, openDirectionRef, skipFocusReturnRef }}
    >
      <div ref={wrapperRef} className="relative inline-block">
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export function MenuTrigger({
  children,
  className,
  onClick,
  onKeyDown,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef, contentId, openDirectionRef } = useMenuContext('MenuTrigger');

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      data-state={open ? 'open' : 'closed'}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        openDirectionRef.current = 'first';
        setOpen((o) => !o);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openDirectionRef.current = e.key === 'ArrowDown' ? 'first' : 'last';
          setOpen(true);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function itemsIn(container: HTMLElement | null): HTMLElement[] {
  return container ? Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];
}

export function MenuContent({
  children,
  className,
  align = 'end',
}: {
  children: ReactNode;
  className?: string;
  align?: 'end' | 'start';
}) {
  const { open, setOpen, contentId, openDirectionRef } = useMenuContext('MenuContent');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const items = itemsIn(ref.current);
    (openDirectionRef.current === 'last' ? items.at(-1) : items[0])?.focus();
  }, [open, openDirectionRef]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = itemsIn(ref.current);
    const current = items.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[(current + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(current - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items.at(-1)?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        // Fecha e devolve o foco ao gatilho antes da ação padrão: o Tab então segue para o
        // elemento seguinte ao gatilho na ordem da página, como manda o padrão de menu.
        setOpen(false);
        break;
    }
  }

  if (!open) return null;

  return (
    <div
      ref={ref}
      id={contentId}
      role="menu"
      onKeyDown={onKeyDown}
      className={cn(
        'rounded-card border-borda bg-branco shadow-flutuante absolute z-50 mt-1.5 min-w-56 border p-1',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface MenuItemOwnProps {
  destructive?: boolean;
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}

/** Item do menu; `as={Link}` para navegação, `onSelect` para ações. */
export function MenuItem<E extends ElementType = 'button'>({
  as,
  destructive,
  onSelect,
  className,
  children,
  ...props
}: PolymorphicProps<E, MenuItemOwnProps>) {
  const { setOpen } = useMenuContext('MenuItem');
  const Comp: ElementType = as ?? 'button';
  const { onClick, ...rest } = props as { onClick?: (e: MouseEvent) => void } & Record<
    string,
    unknown
  >;

  return (
    <Comp
      role="menuitem"
      tabIndex={-1}
      type={Comp === 'button' ? 'button' : undefined}
      className={cn(
        'rounded-campo text-corpo flex cursor-pointer items-center gap-2 px-3 py-2 outline-none select-none',
        'focus:bg-papel-2 focus-visible:bg-papel-2',
        destructive && 'text-alerta focus:bg-alerta-suave focus-visible:bg-alerta-suave',
        className,
      )}
      onClick={(e: MouseEvent) => {
        onClick?.(e);
        onSelect?.();
        setOpen(false);
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="text-apoio text-suave px-3 pt-2 pb-1">{children}</div>;
}

export function MenuSeparator() {
  return <div role="separator" className="bg-borda my-1 h-px" />;
}
