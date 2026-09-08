'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoLinhaCarrinho } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { Botao } from '@/components/ui/botao';
import { DialogRaiz, DrawerConteudo } from '@/components/ui/dialog';
import { useCarrinho } from '@/lib/hooks/use-carrinho';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import { LinhaItemConectada } from './linha-item-conectada';
import { ResumoValores } from './resumo-valores';

/**
 * Drawer lateral do carrinho: adicionar sem perder o lugar no catálogo.
 * A linha recém-adicionada entra destacada e rola até ficar visível.
 */
export function DrawerCarrinho() {
  const aberto = useUiStore((s) => s.drawerCarrinhoAberto);
  const definir = useUiStore((s) => s.definirDrawerCarrinho);
  const itemDestacadoId = useUiStore((s) => s.itemDestacadoId);
  const fechar = () => definir(false);
  const router = useRouter();
  const { status, ehCliente } = useSessao();
  const carrinho = useCarrinho();

  const temIndisponivel = carrinho.data?.itens.some((i) => !i.disponivel) ?? false;
  const vazio = carrinho.isSuccess && carrinho.data.itens.length === 0;

  function irPara(destino: string) {
    fechar();
    router.push(destino);
  }

  let conteudo: ReactNode;

  if (status === 'carregando') {
    conteudo = (
      <ul className="divide-borda divide-y px-5">
        <EsqueletoLinhaCarrinho />
        <EsqueletoLinhaCarrinho />
      </ul>
    );
  } else if (status === 'anonimo') {
    conteudo = (
      <Vazio
        ilustracao="carrinho"
        titulo="Entre para ver seu carrinho."
        descricao="Os itens ficam guardados na sua conta."
        acao={
          <>
            <Botao onClick={() => irPara('/entrar?voltar=/carrinho')}>Entrar</Botao>
            <Botao variante="secundario" onClick={() => irPara('/criar-conta?voltar=/carrinho')}>
              Criar conta
            </Botao>
          </>
        }
      />
    );
  } else if (!ehCliente) {
    conteudo = (
      <Vazio
        titulo="Contas da equipe não compram."
        descricao="Entre com uma conta de cliente para testar o carrinho. As contas de teste estão no README."
        acao={
          <Botao variante="secundario" onClick={() => irPara('/entrar')}>
            Trocar de conta
          </Botao>
        }
      />
    );
  } else if (carrinho.isPending) {
    conteudo = (
      <ul className="divide-borda divide-y px-5">
        <EsqueletoLinhaCarrinho />
        <EsqueletoLinhaCarrinho />
      </ul>
    );
  } else if (carrinho.isError) {
    conteudo = (
      <div className="px-5 py-4">
        <Erro
          erro={carrinho.error}
          titulo="Não foi possível carregar o carrinho."
          aoTentarDeNovo={() => void carrinho.refetch()}
          tentandoDeNovo={carrinho.isFetching}
          compacto
        />
      </div>
    );
  } else if (vazio) {
    conteudo = (
      <Vazio
        ilustracao="carrinho"
        titulo="Seu carrinho está vazio."
        acao={<Botao onClick={() => irPara('/')}>Ver produtos</Botao>}
      />
    );
  } else {
    conteudo = (
      <ul className="divide-borda divide-y px-5">
        {carrinho.data.itens.map((item) => (
          <LinhaItemConectada
            key={item.id}
            item={item}
            compacto
            destacado={item.id === itemDestacadoId}
            aoNavegar={fechar}
          />
        ))}
      </ul>
    );
  }

  const rodape =
    carrinho.isSuccess && carrinho.data.itens.length > 0 && ehCliente ? (
      <div className="flex flex-col gap-3">
        {temIndisponivel && (
          <p
            className="rounded-campo bg-alerta-suave text-apoio text-alerta px-3 py-2"
            role="status"
          >
            Um item saiu de venda. Remova-o para finalizar a compra.
          </p>
        )}
        <ResumoValores
          subtotalCentavos={carrinho.data.subtotalCentavos}
          totalItens={carrinho.data.totalItens}
          compacto
        />
        <Botao tamanho="lg" onClick={() => irPara('/checkout')} disabled={temIndisponivel}>
          Finalizar compra
        </Botao>
        <Link
          href="/carrinho"
          onClick={fechar}
          className="text-apoio text-suave hover:text-tinta text-center underline-offset-4 hover:underline"
        >
          Ver carrinho completo
        </Link>
      </div>
    ) : undefined;

  return (
    <DialogRaiz open={aberto} onOpenChange={definir}>
      <DrawerConteudo
        titulo="Carrinho"
        descricao="Itens que você adicionou. Altere quantidades ou finalize a compra."
        rodape={rodape}
      >
        {conteudo}
      </DrawerConteudo>
    </DialogRaiz>
  );
}
