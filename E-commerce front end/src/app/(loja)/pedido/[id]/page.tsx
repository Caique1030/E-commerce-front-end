'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Erro } from '@/components/estados/erro';
import { Vazio } from '@/components/estados/vazio';
import { GuardaSessao } from '@/components/layout/guardas';
import { ItensPedido, TotaisPedido } from '@/components/pedido/detalhe-pedido';
import { BadgeStatus } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import { ehApiError } from '@/lib/api/cliente';
import { usePedido } from '@/lib/hooks/use-pedidos';
import { useSessao } from '@/providers/sessao-provider';

function EsqueletoPagina() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4" aria-busy>
      <Esqueleto className="size-14 rounded-full" />
      <Esqueleto className="h-8 w-64" />
      <Esqueleto className="h-4 w-80" />
      <Esqueleto className="mt-4 h-64 w-full" />
    </div>
  );
}

/** Confirmação pós-compra. */
export default function PedidoPage() {
  return (
    <GuardaSessao esqueleto={<EsqueletoPagina />}>
      <Confirmacao />
    </GuardaSessao>
  );
}

function Confirmacao() {
  const { id } = useParams<{ id: string }>();
  const { ehEquipe } = useSessao();
  const pedido = usePedido(id);
  const mailpit = process.env.NEXT_PUBLIC_MAILPIT_URL;

  if (pedido.isPending) return <EsqueletoPagina />;
  if (pedido.isError) {
    if (ehApiError(pedido.error) && pedido.error.status === 404) {
      return (
        <Vazio
          ilustracao="pedidos"
          titulo="Pedido não encontrado."
          descricao="Confira o endereço ou veja a lista dos seus pedidos."
          acao={
            <Botao asChild variante="secundario">
              <Link href={ehEquipe ? '/admin/pedidos' : '/meus-pedidos'}>Ver pedidos</Link>
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
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          className="bg-verde-suave text-verde-nota flex size-14 items-center justify-center rounded-full"
          aria-hidden
        >
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </span>
        <h1 className="text-h1">Pedido confirmado</h1>
        <p className="text-corpo flex flex-wrap items-center justify-center gap-2">
          <span className="preco font-medium">{p.codigo}</span>
          <BadgeStatus status={p.status} />
        </p>
        <p className="text-corpo text-suave max-w-md">
          Enviamos a confirmação para <span className="text-tinta">{p.cliente.email}</span>.
          {mailpit && (
            <>
              {' '}
              Nesta demonstração, abra a{' '}
              <a
                href={mailpit}
                target="_blank"
                rel="noreferrer"
                className="hover:text-tinta underline underline-offset-4"
              >
                caixa de e-mails local
              </a>
              .
            </>
          )}
        </p>
      </header>

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

      <div className="flex flex-wrap justify-center gap-2">
        {!ehEquipe && (
          <Botao asChild variante="secundario">
            <Link href={`/meus-pedidos/${p.id}`}>Acompanhar pedido</Link>
          </Botao>
        )}
        <Botao asChild>
          <Link href="/">Continuar comprando</Link>
        </Botao>
      </div>
    </article>
  );
}
