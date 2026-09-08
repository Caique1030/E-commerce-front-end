import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { ResumoValores } from '@/components/carrinho/resumo-valores';
import { BadgeStatus } from '@/components/ui/badge';
import { Preco } from '@/components/ui/preco';
import { ROTULO_STATUS } from '@/lib/constantes';
import { formatarAgendamento, formatarDataHora, pluralizar } from '@/lib/formatadores';
import type { HistoricoPedido, Pedido, ResumoPedido } from '@/lib/tipos';
import { cn } from '@/lib/utils';

/** Peças do pedido reaproveitadas na confirmação, em "Meus pedidos" e no admin. */

export function CabecalhoPedido({
  pedido,
  mostrarCliente = false,
  className,
}: {
  pedido: ResumoPedido;
  mostrarCliente?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-x-6 gap-y-2', className)}>
      <div>
        <p className="preco text-h2">{pedido.codigo}</p>
        <p className="text-apoio text-suave">
          Feito em {formatarDataHora(pedido.criadoEm)} ·{' '}
          {pluralizar(pedido.totalItens, 'item', 'itens')}
        </p>
        {mostrarCliente && (
          <p className="text-apoio mt-1">
            {pedido.cliente.nome} <span className="text-suave">· {pedido.cliente.email}</span>
          </p>
        )}
      </div>
      <BadgeStatus status={pedido.status} />
    </div>
  );
}

export function ItensPedido({ pedido, className }: { pedido: Pedido; className?: string }) {
  return (
    <ul className={cn('divide-borda divide-y', className)} aria-label="Itens do pedido">
      {pedido.itens.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            <Link
              href={`/produto/${item.produtoId}`}
              className="text-corpo font-medium hover:underline"
            >
              {item.produtoNome}
            </Link>
            <p className="text-apoio text-suave">
              <span className="preco">
                {item.quantidade} × <Preco centavos={item.precoUnitCentavos} variante="apoio" />
              </span>
              <span className="text-borda-forte mx-1.5" aria-hidden>
                ·
              </span>
              <span className="preco">SKU {item.produtoSku}</span>
            </p>
            {item.agendadoPara && (
              <p className="text-apoio text-agenda mt-1 flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                {formatarAgendamento(item.agendadoPara)}
              </p>
            )}
          </div>
          <Preco centavos={item.subtotalCentavos} variante="linha" className="shrink-0" />
        </li>
      ))}
    </ul>
  );
}

export function TotaisPedido({ pedido, className }: { pedido: Pedido; className?: string }) {
  return (
    <ResumoValores
      subtotalCentavos={pedido.subtotalCentavos}
      totalItens={pedido.totalItens}
      descontoCentavos={pedido.descontoCentavos}
      totalCentavos={pedido.totalCentavos}
      className={className}
    />
  );
}

/** Histórico de status como linha do tempo. A ordem cronológica é informação, então é numerada por posição. */
export function LinhaTempoPedido({
  historico,
  className,
}: {
  historico: HistoricoPedido[];
  className?: string;
}) {
  if (historico.length === 0) return null;
  return (
    <ol
      className={cn('border-borda relative flex flex-col gap-4 border-l pl-5', className)}
      aria-label="Histórico do pedido"
    >
      {historico.map((h, i) => {
        const ultimo = i === historico.length - 1;
        return (
          <li key={`${h.para}-${h.criadoEm}`} className="relative">
            <span
              className={cn(
                'border-branco absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full border-2',
                ultimo ? 'bg-verde-nota' : 'bg-borda-forte',
                h.para === 'CANCELADO' && 'bg-alerta',
              )}
              aria-hidden
            />
            <p className={cn('text-corpo', ultimo && 'font-medium')}>{ROTULO_STATUS[h.para]}</p>
            <p className="text-apoio text-suave">{formatarDataHora(h.criadoEm)}</p>
            {h.observacao && <p className="text-apoio text-tinta-2 mt-0.5">{h.observacao}</p>}
          </li>
        );
      })}
    </ol>
  );
}
