'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mesmoInstante } from '@/lib/agenda';
import { carrinhoApi, type AdicionarItem } from '@/lib/api/carrinho';
import { mensagemDeErro } from '@/lib/api/cliente';
import { qk } from '@/lib/query-keys';
import type { Carrinho } from '@/lib/tipos';
import { useSessao } from '@/providers/sessao-provider';
import { notificar, useUiStore } from '@/stores/ui-store';

const CHAVE_MUTACAO_QUANTIDADE = ['carrinho', 'quantidade'] as const;

/** Só clientes têm carrinho (o back devolve 403 para a equipe). */
export function useCarrinho() {
  const { status, ehCliente } = useSessao();
  return useQuery({
    queryKey: qk.carrinho.atual,
    queryFn: carrinhoApi.obter,
    enabled: status === 'autenticado' && ehCliente,
    staleTime: 30_000,
  });
}

/**
 * Função pura do otimismo: aplica a quantidade a um item e recalcula os totais.
 * O total precisa ser recalculado junto, senão o número que o usuário está olhando fica errado
 * por um instante. Quantidade 0 remove a linha (mesma regra do back).
 */
export function aplicarQuantidade(
  carrinho: Carrinho,
  itemId: string,
  quantidade: number,
): Carrinho {
  const itens =
    quantidade === 0
      ? carrinho.itens.filter((i) => i.id !== itemId)
      : carrinho.itens.map((i) =>
          i.id === itemId
            ? { ...i, quantidade, subtotalCentavos: i.precoUnitCentavos * quantidade }
            : i,
        );
  return {
    ...carrinho,
    itens,
    totalItens: itens.reduce((s, i) => s + i.quantidade, 0),
    subtotalCentavos: itens.filter((i) => i.disponivel).reduce((s, i) => s + i.subtotalCentavos, 0),
  };
}

export function useAdicionarAoCarrinho() {
  const qc = useQueryClient();
  const abrirDrawer = useUiStore((s) => s.abrirDrawerCarrinho);

  return useMutation({
    mutationFn: (dados: AdicionarItem) => carrinhoApi.adicionar(dados),
    onSuccess: (carrinho, dados) => {
      qc.setQueryData(qk.carrinho.atual, carrinho);
      const linha = carrinho.itens.find(
        (i) =>
          i.produto.id === dados.produtoId &&
          mesmoInstante(i.agendadoPara, dados.agendadoPara ?? null),
      );
      abrirDrawer(linha?.id ?? null);
    },
    onError: (erro) => {
      notificar({
        tipo: 'erro',
        titulo: 'O item não foi adicionado.',
        descricao: mensagemDeErro(erro),
      });
    },
  });
}

interface AtualizarItem {
  itemId: string;
  quantidade: number;
}

/**
 * Atualização otimista: a tela muda antes da resposta. Se o back recusar, volta ao estado
 * anterior e avisa. Com vários cliques em sequência, só a última mutação em voo escreve no cache.
 */
export function useAtualizarQuantidade() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: CHAVE_MUTACAO_QUANTIDADE,
    mutationFn: ({ itemId, quantidade }: AtualizarItem) =>
      carrinhoApi.atualizarItem(itemId, quantidade),

    onMutate: async ({ itemId, quantidade }) => {
      await qc.cancelQueries({ queryKey: qk.carrinho.atual });
      const anterior = qc.getQueryData<Carrinho>(qk.carrinho.atual);
      if (anterior) {
        qc.setQueryData<Carrinho>(
          qk.carrinho.atual,
          aplicarQuantidade(anterior, itemId, quantidade),
        );
      }
      return { anterior };
    },

    onSuccess: (carrinho) => {
      if (qc.isMutating({ mutationKey: CHAVE_MUTACAO_QUANTIDADE }) === 1) {
        qc.setQueryData(qk.carrinho.atual, carrinho);
      }
    },

    onError: (erro, _v, ctx) => {
      if (ctx?.anterior) qc.setQueryData(qk.carrinho.atual, ctx.anterior);
      notificar({
        tipo: 'erro',
        titulo: 'A quantidade não foi alterada.',
        descricao: mensagemDeErro(erro, 'Tente de novo.'),
      });
    },

    onSettled: () => {
      if (qc.isMutating({ mutationKey: CHAVE_MUTACAO_QUANTIDADE }) === 1) {
        void qc.invalidateQueries({ queryKey: qk.carrinho.atual });
      }
    },
  });
}

export function useRemoverItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: CHAVE_MUTACAO_QUANTIDADE,
    mutationFn: (itemId: string) => carrinhoApi.removerItem(itemId),

    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: qk.carrinho.atual });
      const anterior = qc.getQueryData<Carrinho>(qk.carrinho.atual);
      if (anterior)
        qc.setQueryData<Carrinho>(qk.carrinho.atual, aplicarQuantidade(anterior, itemId, 0));
      return { anterior };
    },

    onSuccess: (carrinho) => {
      if (qc.isMutating({ mutationKey: CHAVE_MUTACAO_QUANTIDADE }) === 1) {
        qc.setQueryData(qk.carrinho.atual, carrinho);
      }
    },

    onError: (erro, _v, ctx) => {
      if (ctx?.anterior) qc.setQueryData(qk.carrinho.atual, ctx.anterior);
      notificar({
        tipo: 'erro',
        titulo: 'O item não foi removido.',
        descricao: mensagemDeErro(erro, 'Tente de novo.'),
      });
    },

    onSettled: () => {
      if (qc.isMutating({ mutationKey: CHAVE_MUTACAO_QUANTIDADE }) === 1) {
        void qc.invalidateQueries({ queryKey: qk.carrinho.atual });
      }
    },
  });
}

export function useEsvaziarCarrinho() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => carrinhoApi.esvaziar(),
    onSuccess: (carrinho) => qc.setQueryData(qk.carrinho.atual, carrinho),
    onError: (erro) =>
      notificar({
        tipo: 'erro',
        titulo: 'O carrinho não foi esvaziado.',
        descricao: mensagemDeErro(erro),
      }),
  });
}
