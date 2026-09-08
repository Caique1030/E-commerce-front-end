'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Erro } from '@/components/estados/erro';
import { Vazio } from '@/components/estados/vazio';
import { GuardaSessao } from '@/components/layout/guardas';
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

function EsqueletoPagina() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6" aria-busy>
      <Esqueleto className="h-4 w-32" />
      <Esqueleto className="h-8 w-64" />
      <Esqueleto className="h-64 w-full" />
    </div>
  );
}

export default function MeuPedidoPage() {
  return (
    <GuardaSessao exige="cliente" esqueleto={<EsqueletoPagina />}>
      <Detalhe />
    </GuardaSessao>
  );
}

function Detalhe() {
  const { id } = useParams<{ id: string }>();
  const pedido = usePedido(id);

  if (pedido.isPending) return <EsqueletoPagina />;
  if (pedido.isError) {
    if (ehApiError(pedido.error) && pedido.error.status === 404) {
      return (
        <Vazio
          ilustracao="pedidos"
          titulo="Pedido não encontrado."
          acao={
            <Botao asChild variante="secundario">
              <Link href="/meus-pedidos">Ver meus pedidos</Link>
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
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/meus-pedidos"
        className="text-apoio text-suave hover:text-tinta inline-flex items-center gap-1"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Meus pedidos
      </Link>

      <CabecalhoPedido pedido={p} />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
        <section
          aria-labelledby="titulo-itens"
          className="rounded-card border-borda bg-branco border px-5 py-2"
        >
          <h2 id="titulo-itens" className="sr-only">
            Itens
          </h2>
          <ItensPedido pedido={p} />
          <TotaisPedido pedido={p} className="py-4" />
        </section>

        <section
          aria-labelledby="titulo-historico"
          className="rounded-card border-borda bg-branco border p-5"
        >
          <h2 id="titulo-historico" className="text-h2 mb-4">
            Acompanhamento
          </h2>
          <LinhaTempoPedido historico={p.historico} />
        </section>
      </div>
    </article>
  );
}
