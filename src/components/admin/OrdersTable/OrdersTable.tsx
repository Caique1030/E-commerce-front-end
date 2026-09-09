'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/estados/ErrorState';
import { TableSkeleton } from '@/components/estados/Skeletons';
import { EmptyState } from '@/components/estados/EmptyState';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NativeSelect } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { Table, Td, Th } from '@/components/ui/Table';
import { LIMITE_TABELA, ORDEM_STATUS, ROTULO_STATUS, TRANSICOES } from '@/lib/constantes';
import { centavosParaBRL, formatarDataHora, pluralizar } from '@/lib/formatadores';
import { usePedidosAdmin } from '@/lib/hooks/use-pedidos';
import type { ResumoPedido, StatusPedido } from '@/lib/tipos';
import { VisuallyHidden } from '@/styles/primitives';
import { ChangeStatus } from '../ChangeStatus/ChangeStatus';
import * as S from './style';

export function OrdersTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = (searchParams.get('status') as StatusPedido | null) ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const [editando, setEditando] = useState<ResumoPedido | null>(null);

  function atualizar(mudancas: Record<string, string | undefined>, manterPagina = false) {
    const q = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    if (!manterPagina) q.delete('page');
    const s = q.toString();
    router.replace(s ? `/admin/pedidos?${s}` : '/admin/pedidos', { scroll: false });
  }

  const pedidos = usePedidosAdmin({ status: status || undefined, page, limit: LIMITE_TABELA });

  return (
    <S.Root>
      <S.FilterBar>
        <S.FilterLabel>
          <S.FilterCaption>Status</S.FilterCaption>
          <NativeSelect
            value={status}
            onChange={(e) => atualizar({ status: e.target.value || undefined })}
            className="min-w-52"
          >
            <option value="">Todos</option>
            {ORDEM_STATUS.map((s) => (
              <option key={s} value={s}>
                {ROTULO_STATUS[s]}
              </option>
            ))}
          </NativeSelect>
        </S.FilterLabel>
        {pedidos.data && (
          <S.Count aria-live="polite">
            {pluralizar(pedidos.data.meta.total, 'pedido', 'pedidos')}
          </S.Count>
        )}
      </S.FilterBar>

      {pedidos.isPending ? (
        <TableSkeleton columns={6} />
      ) : pedidos.isError ? (
        <ErrorState
          error={pedidos.error}
          title="Não foi possível carregar os pedidos."
          onRetry={() => void pedidos.refetch()}
          retrying={pedidos.isFetching}
        />
      ) : pedidos.data.data.length === 0 ? (
        <EmptyState
          illustration="orders"
          title={
            status
              ? `Nenhum pedido ${ROTULO_STATUS[status as StatusPedido].toLowerCase()}.`
              : 'Nenhum pedido ainda.'
          }
          action={
            status ? (
              <Button variant="secondary" onClick={() => atualizar({ status: undefined })}>
                Ver todos
              </Button>
            ) : undefined
          }
          compact
        />
      ) : (
        <>
          <Table className={pedidos.isPlaceholderData ? 'opacity-60' : undefined}>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Cliente</Th>
                <Th>Data</Th>
                <Th className="text-right">Itens</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th>
                  <VisuallyHidden>Ações</VisuallyHidden>
                </Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.data.data.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <S.CodeLink href={`/admin/pedidos/${p.id}`}>{p.codigo}</S.CodeLink>
                  </Td>
                  <Td>
                    <S.CustomerName>{p.cliente.nome}</S.CustomerName>
                    <S.CustomerEmail>{p.cliente.email}</S.CustomerEmail>
                  </Td>
                  <Td className="preco whitespace-nowrap">
                    <S.OrderDate>{formatarDataHora(p.criadoEm)}</S.OrderDate>
                  </Td>
                  <Td className="preco text-right">{p.totalItens}</Td>
                  <Td className="preco text-right">{centavosParaBRL(p.totalCentavos)}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {TRANSICOES[p.status].length > 0 && (
                      <S.ChangeButton type="button" onClick={() => setEditando(p)}>
                        Mudar status
                      </S.ChangeButton>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={page}
            totalPages={pedidos.data.meta.totalPages}
            onChange={(p) => atualizar({ page: p > 1 ? String(p) : undefined }, true)}
          />
        </>
      )}

      {editando && (
        <Modal
          open
          onOpenChange={(aberto) => !aberto && setEditando(null)}
          title={`Pedido ${editando.codigo}`}
          description={`Cliente ${editando.cliente.nome}. Status atual: ${ROTULO_STATUS[editando.status]}.`}
        >
          <ChangeStatus
            pedidoId={editando.id}
            statusAtual={editando.status}
            onDone={() => setEditando(null)}
            compact
          />
        </Modal>
      )}
    </S.Root>
  );
}
