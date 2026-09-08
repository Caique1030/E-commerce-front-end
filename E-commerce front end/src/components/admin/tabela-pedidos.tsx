'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoTabela } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { BadgeStatus } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Selecao } from '@/components/ui/campo';
import { DialogRaiz, ModalConteudo } from '@/components/ui/dialog';
import { Paginacao } from '@/components/ui/paginacao';
import { Tabela, Td, Th } from '@/components/ui/tabela';
import { LIMITE_TABELA, ORDEM_STATUS, ROTULO_STATUS, TRANSICOES } from '@/lib/constantes';
import { centavosParaBRL, formatarDataHora, pluralizar } from '@/lib/formatadores';
import { usePedidosAdmin } from '@/lib/hooks/use-pedidos';
import type { ResumoPedido, StatusPedido } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { AlterarStatus } from './alterar-status';

export function TabelaPedidos() {
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
    <div className="flex flex-col gap-4">
      <div className="rounded-card border-borda bg-branco flex flex-wrap items-end gap-3 border px-4 py-3">
        <label className="text-apoio flex flex-col gap-1">
          <span className="font-medium">Status</span>
          <Selecao
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
          </Selecao>
        </label>
        {pedidos.data && (
          <p className="text-apoio text-suave pb-2.5" aria-live="polite">
            {pluralizar(pedidos.data.meta.total, 'pedido', 'pedidos')}
          </p>
        )}
      </div>

      {pedidos.isPending ? (
        <EsqueletoTabela colunas={6} />
      ) : pedidos.isError ? (
        <Erro
          erro={pedidos.error}
          titulo="Não foi possível carregar os pedidos."
          aoTentarDeNovo={() => void pedidos.refetch()}
          tentandoDeNovo={pedidos.isFetching}
        />
      ) : pedidos.data.data.length === 0 ? (
        <Vazio
          ilustracao="pedidos"
          titulo={
            status
              ? `Nenhum pedido ${ROTULO_STATUS[status as StatusPedido].toLowerCase()}.`
              : 'Nenhum pedido ainda.'
          }
          acao={
            status ? (
              <Botao variante="secundario" onClick={() => atualizar({ status: undefined })}>
                Ver todos
              </Botao>
            ) : undefined
          }
          compacto
        />
      ) : (
        <>
          <Tabela className={cn(pedidos.isPlaceholderData && 'opacity-60')}>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Cliente</Th>
                <Th>Data</Th>
                <Th className="text-right">Itens</Th>
                <Th className="text-right">Total</Th>
                <Th>Status</Th>
                <Th>
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.data.data.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link
                      href={`/admin/pedidos/${p.id}`}
                      className="preco font-medium hover:underline"
                    >
                      {p.codigo}
                    </Link>
                  </Td>
                  <Td>
                    <span className="block">{p.cliente.nome}</span>
                    <span className="text-micro text-suave block">{p.cliente.email}</span>
                  </Td>
                  <Td className="preco text-apoio whitespace-nowrap">
                    {formatarDataHora(p.criadoEm)}
                  </Td>
                  <Td className="preco text-right">{p.totalItens}</Td>
                  <Td className="preco text-right">{centavosParaBRL(p.totalCentavos)}</Td>
                  <Td>
                    <BadgeStatus status={p.status} />
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {TRANSICOES[p.status].length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditando(p)}
                        className="text-apoio text-verde-nota font-medium hover:underline"
                      >
                        Mudar status
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao
            pagina={page}
            totalPaginas={pedidos.data.meta.totalPages}
            aoMudar={(p) => atualizar({ page: p > 1 ? String(p) : undefined }, true)}
          />
        </>
      )}

      <DialogRaiz open={!!editando} onOpenChange={(aberto) => !aberto && setEditando(null)}>
        {editando && (
          <ModalConteudo
            titulo={`Pedido ${editando.codigo}`}
            descricao={`Cliente ${editando.cliente.nome}. Status atual: ${ROTULO_STATUS[editando.status]}.`}
          >
            <AlterarStatus
              pedidoId={editando.id}
              statusAtual={editando.status}
              aoConcluir={() => setEditando(null)}
              compacto
            />
          </ModalConteudo>
        )}
      </DialogRaiz>
    </div>
  );
}
