'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoTabela } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { GuardaSessao } from '@/components/layout/guardas';
import { BadgeStatus } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import { Paginacao } from '@/components/ui/paginacao';
import { Preco } from '@/components/ui/preco';
import { formatarDataHora, pluralizar } from '@/lib/formatadores';
import { useMeusPedidos } from '@/lib/hooks/use-pedidos';

const LIMITE = 10;

function EsqueletoPagina() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <Esqueleto className="h-8 w-48" />
      <EsqueletoTabela linhas={4} colunas={4} />
    </div>
  );
}

export default function MeusPedidosPage() {
  return (
    <GuardaSessao exige="cliente" esqueleto={<EsqueletoPagina />}>
      <Suspense fallback={<EsqueletoPagina />}>
        <Lista />
      </Suspense>
    </GuardaSessao>
  );
}

function Lista() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const pedidos = useMeusPedidos({ page, limit: LIMITE });

  return (
    <section aria-labelledby="titulo-pedidos" className="flex flex-col gap-4">
      <h1 id="titulo-pedidos" className="text-h1">
        Meus pedidos
      </h1>

      {pedidos.isPending ? (
        <EsqueletoTabela linhas={4} colunas={4} />
      ) : pedidos.isError ? (
        <Erro
          erro={pedidos.error}
          titulo="Não foi possível carregar seus pedidos."
          aoTentarDeNovo={() => void pedidos.refetch()}
          tentandoDeNovo={pedidos.isFetching}
        />
      ) : pedidos.data.data.length === 0 ? (
        <Vazio
          ilustracao="pedidos"
          titulo="Você ainda não fez pedidos."
          descricao="Quando finalizar uma compra, ela aparece aqui com o status atualizado."
          acao={
            <Botao asChild>
              <Link href="/">Ver produtos</Link>
            </Botao>
          }
        />
      ) : (
        <>
          <ul className="divide-borda rounded-card border-borda bg-branco divide-y border">
            {pedidos.data.data.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/meus-pedidos/${p.id}`}
                  className="hover:bg-papel-2 flex items-center gap-4 px-5 py-4"
                  aria-label={`Pedido ${p.codigo}, ${pluralizar(p.totalItens, 'item', 'itens')}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="preco text-corpo font-medium">{p.codigo}</p>
                    <p className="text-apoio text-suave">
                      {formatarDataHora(p.criadoEm)} · {pluralizar(p.totalItens, 'item', 'itens')}
                    </p>
                  </div>
                  <BadgeStatus status={p.status} className="hidden sm:inline-flex" />
                  <Preco centavos={p.totalCentavos} variante="linha" />
                  <ChevronRight className="text-suave size-4 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Paginacao
            pagina={page}
            totalPaginas={pedidos.data.meta.totalPages}
            aoMudar={(p) => router.push(p > 1 ? `/meus-pedidos?page=${p}` : '/meus-pedidos')}
            className="justify-center"
          />
        </>
      )}
    </section>
  );
}
