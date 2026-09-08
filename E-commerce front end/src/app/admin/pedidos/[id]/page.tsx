'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlterarStatus } from '@/components/admin/alterar-status';
import { Erro } from '@/components/estados/erro';
import { Vazio } from '@/components/estados/vazio';
import {
  CabecalhoPedido,
  ItensPedido,
  LinhaTempoPedido,
  TotaisPedido,
} from '@/components/pedido/detalhe-pedido';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import { ehApiError } from '@/lib/api/cliente';
import { usePedido } from '@/lib/hooks/use-pedidos';

export default function AdminPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const pedido = usePedido(id);

  if (pedido.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <Esqueleto className="h-4 w-24" />
        <Esqueleto className="h-8 w-64" />
        <Esqueleto className="h-72 w-full" />
      </div>
    );
  }
  if (pedido.isError) {
    if (ehApiError(pedido.error) && pedido.error.status === 404) {
      return (
        <Vazio
          ilustracao="pedidos"
          titulo="Pedido não encontrado."
          acao={
            <Botao asChild variante="secundario">
              <Link href="/admin/pedidos">Ver pedidos</Link>
            </Botao>
          }
        />
      );
    }
    return (
      <Erro
        erro={pedido.error}
        titulo="Não foi possível carregar o pedido."
        aoTentarDeNovo={() => void pedido.refetch()}
        tentandoDeNovo={pedido.isFetching}
      />
    );
  }

  const p = pedido.data;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/pedidos"
        className="text-apoio text-suave hover:text-tinta inline-flex items-center gap-1"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Pedidos
      </Link>
      <CabecalhoPedido pedido={p} mostrarCliente />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-label="Itens"
          className="rounded-card border-borda bg-branco border px-5 py-2"
        >
          <ItensPedido pedido={p} />
          <TotaisPedido pedido={p} className="py-4" />
        </section>

        <div className="flex flex-col gap-5">
          <section
            aria-labelledby="titulo-status"
            className="rounded-card border-borda bg-branco border p-5"
          >
            <h2 id="titulo-status" className="text-h2 mb-3">
              Mudar status
            </h2>
            <AlterarStatus pedidoId={p.id} statusAtual={p.status} />
          </section>
          <section
            aria-labelledby="titulo-historico"
            className="rounded-card border-borda bg-branco border p-5"
          >
            <h2 id="titulo-historico" className="text-h2 mb-4">
              Histórico
            </h2>
            <LinhaTempoPedido historico={p.historico} />
          </section>
        </div>
      </div>
    </div>
  );
}
