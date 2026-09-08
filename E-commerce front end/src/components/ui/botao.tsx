import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Variantes com significado fixo:
 *  - primario (azul cheio): comprar, adicionar, confirmar — uma por tela
 *  - secundario (azul claro): a segunda ação da mesma tela, no mesmo assunto
 *  - agenda (violeta): escolher data, agendar
 *  - fantasma / link: navegação e ações neutras
 *  - perigo: remover, cancelar, desativar
 */
export type VarianteBotao = 'primario' | 'agenda' | 'secundario' | 'fantasma' | 'perigo' | 'link';
export type TamanhoBotao = 'sm' | 'md' | 'lg' | 'icone';

const variantes: Record<VarianteBotao, string> = {
  primario:
    'bg-acao text-branco shadow-card hover:bg-acao-2 active:bg-acao-3 disabled:bg-acao/45 disabled:text-branco/90 disabled:shadow-none',
  agenda:
    'bg-agenda text-branco shadow-card hover:bg-agenda-2 disabled:bg-agenda/45 disabled:text-branco/90 disabled:shadow-none',
  secundario:
    'bg-acao-suave text-acao hover:bg-acao-suave/70 active:bg-acao-suave disabled:bg-papel-2 disabled:text-suave',
  fantasma: 'text-tinta-2 hover:bg-papel-2 disabled:text-suave',
  perigo:
    'border border-alerta/40 bg-branco text-alerta hover:bg-alerta-suave hover:border-alerta disabled:text-suave disabled:border-borda-forte',
  link: 'text-acao underline-offset-4 hover:underline px-0 h-auto disabled:text-suave',
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
    'inline-flex shrink-0 items-center justify-center rounded-campo font-semibold whitespace-nowrap select-none transition-colors duration-100',
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
