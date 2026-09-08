import { Preco } from '@/components/ui/preco';
import { pluralizar } from '@/lib/formatadores';
import { cn } from '@/lib/utils';

interface ResumoValoresProps {
  subtotalCentavos: number;
  totalItens: number;
  descontoCentavos?: number;
  /** Total explícito (pedidos); se ausente, é o subtotal menos o desconto. */
  totalCentavos?: number;
  className?: string;
  compacto?: boolean;
}

/** Total com aria-live: o leitor de tela anuncia quando a quantidade muda. */
export function ResumoValores({
  subtotalCentavos,
  totalItens,
  descontoCentavos = 0,
  totalCentavos,
  className,
  compacto = false,
}: ResumoValoresProps) {
  const total = totalCentavos ?? subtotalCentavos - descontoCentavos;
  return (
    <dl className={cn('text-corpo flex flex-col gap-1.5', className)}>
      {!compacto && (
        <div className="text-suave flex justify-between">
          <dt>Itens ({pluralizar(totalItens, 'unidade', 'unidades')})</dt>
          <dd>
            <Preco
              centavos={subtotalCentavos}
              variante="linha"
              className="text-tinta font-normal"
            />
          </dd>
        </div>
      )}
      {descontoCentavos > 0 && (
        <div className="text-suave flex justify-between">
          <dt>Desconto</dt>
          <dd>
            <Preco centavos={-descontoCentavos} variante="linha" className="text-verde-nota" />
          </dd>
        </div>
      )}
      <div
        className="border-borda mt-1 flex items-baseline justify-between border-t pt-2"
        aria-live="polite"
        aria-atomic
      >
        <dt className="font-medium">Total</dt>
        <dd>
          <Preco centavos={total} variante="principal" />
        </dd>
      </div>
    </dl>
  );
}
