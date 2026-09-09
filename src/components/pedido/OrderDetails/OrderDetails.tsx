import { CalendarDays } from 'lucide-react';
import { OrderSummary } from '@/components/carrinho/OrderSummary/OrderSummary';
import { StatusBadge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { ROTULO_STATUS } from '@/lib/constantes';
import { formatarAgendamento, formatarDataHora, pluralizar } from '@/lib/formatadores';
import type { HistoricoPedido, Pedido, ResumoPedido } from '@/lib/tipos';
import * as S from './style';

/** Peças do pedido reaproveitadas na confirmação, em "Meus pedidos" e no admin. */

export interface OrderHeaderProps {
  pedido: ResumoPedido;
  showCustomer?: boolean;
  className?: string;
}

export function OrderHeader({ pedido, showCustomer = false, className }: OrderHeaderProps) {
  return (
    <S.HeaderRoot className={className}>
      <div>
        <S.Code>{pedido.codigo}</S.Code>
        <S.Meta>
          Feito em {formatarDataHora(pedido.criadoEm)} ·{' '}
          {pluralizar(pedido.totalItens, 'item', 'itens')}
        </S.Meta>
        {showCustomer && (
          <S.Customer>
            {pedido.cliente.nome} <S.Muted>· {pedido.cliente.email}</S.Muted>
          </S.Customer>
        )}
      </div>
      <StatusBadge status={pedido.status} />
    </S.HeaderRoot>
  );
}

export function OrderItems({ pedido, className }: { pedido: Pedido; className?: string }) {
  return (
    <S.ItemsRoot className={className} aria-label="Itens do pedido">
      {pedido.itens.map((item) => (
        <S.Item key={item.id}>
          <S.ItemBody>
            <S.ItemLink href={`/produto/${item.produtoId}`}>{item.produtoNome}</S.ItemLink>
            <S.Meta>
              <span className="preco">
                {item.quantidade} × <Price centavos={item.precoUnitCentavos} variant="muted" />
              </span>
              <S.Separator aria-hidden>·</S.Separator>
              <span className="preco">SKU {item.produtoSku}</span>
            </S.Meta>
            {item.agendadoPara && (
              <S.Schedule>
                <CalendarDays size={14} aria-hidden />
                {formatarAgendamento(item.agendadoPara)}
              </S.Schedule>
            )}
          </S.ItemBody>
          <Price centavos={item.subtotalCentavos} variant="line" className="shrink-0" />
        </S.Item>
      ))}
    </S.ItemsRoot>
  );
}

export function OrderTotals({ pedido, className }: { pedido: Pedido; className?: string }) {
  return (
    <OrderSummary
      subtotalCentavos={pedido.subtotalCentavos}
      totalItens={pedido.totalItens}
      descontoCentavos={pedido.descontoCentavos}
      totalCentavos={pedido.totalCentavos}
      className={className}
    />
  );
}

/** Histórico de status como linha do tempo. A ordem cronológica é informação, então é numerada por posição. */
export function OrderTimeline({
  historico,
  className,
}: {
  historico: HistoricoPedido[];
  className?: string;
}) {
  if (historico.length === 0) return null;
  return (
    <S.TimelineRoot className={className} aria-label="Histórico do pedido">
      {historico.map((h, i) => {
        const ultimo = i === historico.length - 1;
        // O cancelamento vence: é vermelho mesmo sendo o último passo.
        const tone = h.para === 'CANCELADO' ? 'cancelled' : ultimo ? 'current' : 'past';
        return (
          <S.Step key={`${h.para}-${h.criadoEm}`}>
            <S.Marker $tone={tone} aria-hidden />
            <S.StepLabel $current={ultimo}>{ROTULO_STATUS[h.para]}</S.StepLabel>
            <S.Meta>{formatarDataHora(h.criadoEm)}</S.Meta>
            {h.observacao && <S.StepNote>{h.observacao}</S.StepNote>}
          </S.Step>
        );
      })}
    </S.TimelineRoot>
  );
}
