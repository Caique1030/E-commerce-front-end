import { Loader2 } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import type { PolymorphicProps } from '@/lib/polymorphic';
import { cn } from '@/lib/utils';

/**
 * Variantes com significado fixo:
 *  - primary (azul cheio): comprar, adicionar, confirmar — uma por tela
 *  - secondary (azul claro): a segunda ação da mesma tela, no mesmo assunto
 *  - schedule (violeta): escolher data, agendar
 *  - ghost / link: navegação e ações neutras
 *  - danger: remover, cancelar, desativar
 */
export type ButtonVariant = 'primary' | 'schedule' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-acao text-branco shadow-card hover:bg-acao-2 active:bg-acao-3 disabled:bg-acao/45 disabled:text-branco/90 disabled:shadow-none',
  schedule:
    'bg-agenda text-branco shadow-card hover:bg-agenda-2 disabled:bg-agenda/45 disabled:text-branco/90 disabled:shadow-none',
  secondary:
    'bg-acao-suave text-acao hover:bg-acao-suave/70 active:bg-acao-suave disabled:bg-papel-2 disabled:text-suave',
  ghost: 'text-tinta-2 hover:bg-papel-2 disabled:text-suave',
  danger:
    'border border-alerta/40 bg-branco text-alerta hover:bg-alerta-suave hover:border-alerta disabled:text-suave disabled:border-borda-forte',
  link: 'text-acao underline-offset-4 hover:underline px-0 h-auto disabled:text-suave',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-apoio gap-1.5',
  md: 'h-10 px-4 text-corpo gap-2',
  lg: 'h-12 px-5 text-corpo gap-2',
  icon: 'h-10 w-10 p-0',
};

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra o spinner, desabilita e anuncia aria-busy. O texto fica visível para não mudar a largura. */
  loading?: boolean;
  icon?: ReactNode;
  /**
   * Só o <button> nativo entende `disabled`. Com `as={Link}`, combine com `aria-disabled`,
   * `tabIndex={-1}` e `pointer-events-none` no ponto de uso.
   */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps<E extends ElementType = 'button'> = PolymorphicProps<E, ButtonOwnProps>;

/**
 * Botão da loja. `as={Link}` (ou qualquer outro elemento) renderiza o alvo com a mesma
 * aparência: substitui o antigo `asChild` sem clonar elementos.
 */
export function Button<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps<E>) {
  const Comp: ElementType = as ?? 'button';
  const nativeButton = Comp === 'button';
  const { type, ...rest } = props as { type?: string } & Record<string, unknown>;

  return (
    <Comp
      type={nativeButton ? (type ?? 'button') : type}
      disabled={nativeButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'rounded-campo inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors duration-100 select-none',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </Comp>
  );
}
