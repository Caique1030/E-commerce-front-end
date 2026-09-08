import { centavosParaBRL, partesPreco } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

export type VariantePreco = 'principal' | 'card' | 'linha' | 'apoio';

const variantes: Record<VariantePreco, string> = {
  principal: 'text-preco',
  card: 'text-preco-md',
  linha: 'text-preco-sm',
  apoio: 'text-apoio text-suave',
};

interface PrecoProps {
  centavos: number;
  variante?: VariantePreco;
  className?: string;
  /** Preço antigo riscado (quando o valor mudou desde que entrou no carrinho). */
  anteriorCentavos?: number;
}

/**
 * Preço da vitrine: cifrão pequeno, reais grandes em peso leve, centavos sobrescritos.
 * O número visível é decorativo para o leitor de tela — ele ouve o valor inteiro de uma vez,
 * e não "erre cifrão, mil duzentos e noventa e nove, zero zero".
 */
export function Preco({ centavos, variante = 'card', className, anteriorCentavos }: PrecoProps) {
  const { moeda, inteiro, centavos: fracao } = partesPreco(centavos);
  const miudo = variante === 'apoio';

  return (
    <span className={cn('preco inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={cn('inline-flex items-start', variantes[variante])}>
        <span className="sr-only">{centavosParaBRL(centavos)}</span>
        {miudo ? (
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
      {anteriorCentavos !== undefined && anteriorCentavos !== centavos && (
        <s
          className="text-apoio text-suave"
          aria-label={`antes ${centavosParaBRL(anteriorCentavos)}`}
        >
          {centavosParaBRL(anteriorCentavos)}
        </s>
      )}
    </span>
  );
}
