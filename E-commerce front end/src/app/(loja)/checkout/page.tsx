'use client';

import Link from 'next/link';
import { FormularioCheckout } from '@/components/carrinho/formulario-checkout';
import { Erro } from '@/components/estados/erro';
import { EsqueletoLinhaCarrinho } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { GuardaSessao } from '@/components/layout/guardas';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import { useCarrinho } from '@/lib/hooks/use-carrinho';

function EsqueletoPagina() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-busy>
      <div>
        <Esqueleto className="mb-4 h-8 w-48" />
        <ul className="divide-borda rounded-card border-borda bg-branco shadow-card divide-y border px-5">
          <EsqueletoLinhaCarrinho />
          <EsqueletoLinhaCarrinho />
        </ul>
      </div>
      <Esqueleto className="h-80" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <GuardaSessao exige="cliente" esqueleto={<EsqueletoPagina />}>
      <ConteudoCheckout />
    </GuardaSessao>
  );
}

function ConteudoCheckout() {
  const carrinho = useCarrinho();

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
  if (carrinho.data.itens.length === 0) {
    return (
      <Vazio
        ilustracao="carrinho"
        titulo="Seu carrinho está vazio."
        descricao="Adicione produtos para finalizar uma compra."
        acao={
          <Botao asChild>
            <Link href="/">Ver produtos</Link>
          </Botao>
        }
      />
    );
  }
  return <FormularioCheckout carrinho={carrinho.data} />;
}
