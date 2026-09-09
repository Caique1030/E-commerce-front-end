import { centavosParaBRL, partesPreco } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

export type PriceVariant = 'main' | 'card' | 'line' | 'muted';

const variants: Record<PriceVariant, string> = {
  main: 'text-preco',
  card: 'text-preco-md',
  line: 'text-preco-sm',
  muted: 'text-apoio text-suave',
};

interface PriceProps {
  centavos: number;
  variant?: PriceVariant;
  className?: string;
  /** Preço antigo riscado (quando o valor mudou desde que entrou no carrinho). */
  previousCentavos?: number;
}

/**
 * Preço da vitrine: cifrão pequeno, reais grandes em peso leve, centavos sobrescritos.
 * O número visível é decorativo para o leitor de tela — ele ouve o valor inteiro de uma vez,
 * e não "erre cifrão, mil duzentos e noventa e nove, zero zero".
 */
export function Price({ centavos, variant = 'card', className, previousCentavos }: PriceProps) {
  const { moeda, inteiro, centavos: fracao } = partesPreco(centavos);
  const small = variant === 'muted';

  return (
    <span className={cn('preco inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={cn('inline-flex items-start', variants[variant])}>
        <span className="sr-only">{centavosParaBRL(centavos)}</span>
        {small ? (
          <span aria-hidden>{centavosParaBRL(centavos)}</span>
        ) : (
          <>
            <span className="mr-1 self-center text-[0.55em] leading-none font-normal" aria-hidden>
              {moeda}
            </span>
            <span aria-hidden>{inteiro}</span>
            <span className="mt-[0.15em] ml-0.5 text-[0.5em] leading-none font-medium" aria-hidden>
              {fracao}
            </span>
          </>
        )}
      </span>
      {previousCentavos !== undefined && previousCentavos !== centavos && (
        <s
          className="text-apoio text-suave"
          aria-label={`antes ${centavosParaBRL(previousCentavos)}`}
        >
          {centavosParaBRL(previousCentavos)}
        </s>
      )}
    </span>
  );
}
