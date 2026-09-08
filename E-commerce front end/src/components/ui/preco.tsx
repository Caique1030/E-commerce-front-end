import { centavosParaBRL } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

export type VariantePreco = 'principal' | 'card' | 'linha' | 'apoio';

const variantes: Record<VariantePreco, string> = {
  principal: 'text-preco',
  card: 'text-preco-sm',
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

/** Preço sempre com numeral tabular: as casas decimais alinham em qualquer lista. */
export function Preco({ centavos, variante = 'card', className, anteriorCentavos }: PrecoProps) {
  return (
    <span className={cn('preco inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={variantes[variante]}>{centavosParaBRL(centavos)}</span>
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
