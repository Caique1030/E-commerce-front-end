import { Price } from '@/components/ui/Price';
import { pluralizar } from '@/lib/formatadores';
import * as S from './style';

interface OrderSummaryProps {
  subtotalCentavos: number;
  totalItens: number;
  descontoCentavos?: number;
  /** Total explícito (pedidos); se ausente, é o subtotal menos o desconto. */
  totalCentavos?: number;
  className?: string;
  compact?: boolean;
}

/** Total com aria-live: o leitor de tela anuncia quando a quantidade muda. */
export function OrderSummary({
  subtotalCentavos,
  totalItens,
  descontoCentavos = 0,
  totalCentavos,
  className,
  compact = false,
}: OrderSummaryProps) {
  const total = totalCentavos ?? subtotalCentavos - descontoCentavos;
  return (
    <S.Root className={className}>
      {!compact && (
        <S.Row>
          <dt>Itens ({pluralizar(totalItens, 'unidade', 'unidades')})</dt>
          <S.Value $tone="ink">
            <Price centavos={subtotalCentavos} variant="line" />
          </S.Value>
        </S.Row>
      )}
      {descontoCentavos > 0 && (
        <S.Row>
          <dt>Desconto</dt>
          <S.Value $tone="green">
            <Price centavos={-descontoCentavos} variant="line" />
          </S.Value>
        </S.Row>
      )}
      <S.TotalRow aria-live="polite" aria-atomic>
        <S.TotalLabel>Total</S.TotalLabel>
        <dd>
          <Price centavos={total} variant="main" />
        </dd>
      </S.TotalRow>
    </S.Root>
  );
}
