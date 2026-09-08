'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LinhaItemConectada } from '@/components/carrinho/linha-item-conectada';
import { ResumoValores } from '@/components/carrinho/resumo-valores';
import { Erro } from '@/components/estados/erro';
import { EsqueletoLinhaCarrinho } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { GuardaSessao } from '@/components/layout/guardas';
import { Botao } from '@/components/ui/botao';
import { DialogRaiz, ModalConteudo } from '@/components/ui/dialog';
import { Esqueleto } from '@/components/ui/esqueleto';
import { useCarrinho, useEsvaziarCarrinho } from '@/lib/hooks/use-carrinho';

function EsqueletoPagina() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-busy>
      <div>
        <Esqueleto className="mb-4 h-8 w-40" />
        <ul className="divide-borda rounded-card border-borda bg-branco shadow-card divide-y border px-5">
          <EsqueletoLinhaCarrinho />
          <EsqueletoLinhaCarrinho />
          <EsqueletoLinhaCarrinho />
        </ul>
      </div>
      <Esqueleto className="h-48" />
    </div>
  );
}

/** Revisão do carrinho em página cheia, antes do checkout. */
export default function CarrinhoPage() {
  return (
    <GuardaSessao exige="cliente" esqueleto={<EsqueletoPagina />}>
      <ConteudoCarrinho />
    </GuardaSessao>
  );
}

function ConteudoCarrinho() {
  const carrinho = useCarrinho();
  const esvaziar = useEsvaziarCarrinho();
  const [confirmando, setConfirmando] = useState(false);

  if (carrinho.isPending) return <EsqueletoPagina />;
  if (carrinho.isError) {
    return (
      <Erro
        erro={carrinho.error}
        titulo="Não foi possível carregar o carrinho."
        aoTentarDeNovo={() => void carrinho.refetch()}
        tentandoDeNovo={carrinho.isFetching}
      />
    );
  }

  const { itens, subtotalCentavos, totalItens } = carrinho.data;
  const temIndisponivel = itens.some((i) => !i.disponivel);

  if (itens.length === 0) {
    return (
      <Vazio
        ilustracao="carrinho"
        titulo="Seu carrinho está vazio."
        acao={
          <Botao asChild>
            <Link href="/">Ver produtos</Link>
          </Botao>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      <section aria-labelledby="titulo-carrinho">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h1 id="titulo-carrinho" className="text-h1">
            Carrinho
          </h1>
          <DialogRaiz open={confirmando} onOpenChange={setConfirmando}>
            <Botao variante="link" tamanho="sm" onClick={() => setConfirmando(true)}>
              Esvaziar carrinho
            </Botao>
            <ModalConteudo
              titulo="Esvaziar o carrinho?"
              descricao="Todos os itens serão removidos. Você pode adicioná-los de novo depois."
              rodape={
                <>
                  <Botao variante="secundario" onClick={() => setConfirmando(false)}>
                    Manter itens
                  </Botao>
                  <Botao
                    variante="perigo"
                    carregando={esvaziar.isPending}
                    onClick={() =>
                      esvaziar.mutate(undefined, { onSuccess: () => setConfirmando(false) })
                    }
                  >
                    Esvaziar
                  </Botao>
                </>
              }
            >
              <p className="text-corpo text-suave">
                {totalItens} {totalItens === 1 ? 'unidade sairá' : 'unidades sairão'} do carrinho.
              </p>
            </ModalConteudo>
          </DialogRaiz>
        </div>

        {temIndisponivel && (
          <p
            className="rounded-card border-alerta/25 bg-alerta-suave text-apoio text-alerta mb-3 border px-4 py-3"
            role="status"
          >
            Um item saiu de venda desde que você o adicionou. Remova-o para continuar.
          </p>
        )}

        <ul className="divide-borda rounded-card border-borda bg-branco shadow-card divide-y border px-5">
          {itens.map((item) => (
            <LinhaItemConectada key={item.id} item={item} />
          ))}
        </ul>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Resumo do carrinho">
        <div className="rounded-card border-borda bg-branco shadow-card flex flex-col gap-4 border p-5">
          <h2 className="text-h2">Resumo</h2>
          <ResumoValores subtotalCentavos={subtotalCentavos} totalItens={totalItens} />
          <Botao
            asChild
            tamanho="lg"
            disabled={temIndisponivel}
            className={temIndisponivel ? 'pointer-events-none' : undefined}
          >
            <Link
              href="/checkout"
              aria-disabled={temIndisponivel || undefined}
              tabIndex={temIndisponivel ? -1 : undefined}
            >
              Finalizar compra
            </Link>
          </Botao>
          <Link
            href="/"
            className="text-apoio text-suave hover:text-tinta text-center underline-offset-4 hover:underline"
          >
            Continuar comprando
          </Link>
        </div>
      </aside>
    </div>
  );
}
