import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Variantes com significado fixo:
 *  - primario (verde): comprar, adicionar, confirmar
 *  - agenda (violeta): escolher data, agendar
 *  - secundario / fantasma / link: navegação e ações neutras
 *  - perigo: remover, cancelar, desativar
 */
export type VarianteBotao = 'primario' | 'agenda' | 'secundario' | 'fantasma' | 'perigo' | 'link';
export type TamanhoBotao = 'sm' | 'md' | 'lg' | 'icone';

const variantes: Record<VarianteBotao, string> = {
  primario:
    'bg-verde-nota text-branco hover:bg-verde-nota-2 disabled:bg-verde-nota/55 disabled:text-branco/90',
  agenda: 'bg-agenda text-branco hover:bg-agenda-2 disabled:bg-agenda/55 disabled:text-branco/90',
  secundario:
    'border border-borda-forte bg-branco text-tinta hover:border-tinta hover:bg-papel-2 disabled:text-suave disabled:hover:border-borda-forte disabled:hover:bg-branco',
  fantasma: 'text-tinta hover:bg-papel-2 disabled:text-suave',
  perigo:
    'border border-alerta/40 bg-branco text-alerta hover:bg-alerta-suave hover:border-alerta disabled:text-suave disabled:border-borda-forte',
  link: 'text-verde-nota underline-offset-4 hover:underline px-0 h-auto disabled:text-suave',
};

const tamanhos: Record<TamanhoBotao, string> = {
  sm: 'h-8 px-3 text-apoio gap-1.5',
  md: 'h-10 px-4 text-corpo gap-2',
  lg: 'h-12 px-5 text-corpo gap-2',
  icone: 'h-10 w-10 p-0',
};

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  /** Mostra o spinner, desabilita e anuncia aria-busy. O texto fica visível para não mudar a largura. */
  carregando?: boolean;
  icone?: ReactNode;
  /** Renderiza o filho (ex.: <Link>) com o estilo do botão. */
  asChild?: boolean;
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  {
    variante = 'primario',
    tamanho = 'md',
    carregando = false,
    icone,
    asChild = false,
    className,
    children,
    disabled,
    type,
    ...props
  },
  ref,
) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-campo font-medium whitespace-nowrap select-none transition-colors duration-100',
    'disabled:cursor-not-allowed',
    variantes[variante],
    tamanhos[tamanho],
    className,
  );

  // asChild: o filho (ex.: <Link>) recebe as classes; ícone e spinner ficam por conta dele.
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={classes}
      {...props}
    >
      {carregando ? (
        <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        icone
      )}
      {children}
    </button>
  );
});
