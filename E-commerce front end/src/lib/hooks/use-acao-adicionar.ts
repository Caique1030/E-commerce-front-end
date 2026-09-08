'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdicionarItem } from '@/lib/api/carrinho';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';
import { useAdicionarAoCarrinho } from './use-carrinho';

const CHAVE_INTENCAO = 'balcao_intencao';

export interface Intencao extends AdicionarItem {
  voltar: string;
}

export function guardarIntencao(i: Intencao): void {
  try {
    sessionStorage.setItem(CHAVE_INTENCAO, JSON.stringify(i));
  } catch {
    // sessionStorage indisponível (modo privado restrito): o clique se perde, mas nada quebra.
  }
}

export function lerIntencao(): Intencao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_INTENCAO);
    return bruto ? (JSON.parse(bruto) as Intencao) : null;
  } catch {
    return null;
  }
}

export function limparIntencao(): void {
  try {
    sessionStorage.removeItem(CHAVE_INTENCAO);
  } catch {
    // idem
  }
}

/**
 * "Adicionar" com as três situações resolvidas num lugar só:
 *  - anônimo: guarda a intenção e manda para /entrar; o clique não se perde
 *  - equipe: explica que contas internas não compram
 *  - cliente: dispara a mutação e abre o drawer
 */
export function useAcaoAdicionar() {
  const { status, ehEquipe } = useSessao();
  const router = useRouter();
  const pathname = usePathname();
  const adicionar = useAdicionarAoCarrinho();
  const [produtoPendente, setProdutoPendente] = useState<string | null>(null);

  const executar = useCallback(
    (dados: AdicionarItem, voltar?: string) => {
      if (status === 'carregando') return;
      const destino = voltar ?? pathname;

      if (status === 'anonimo') {
        guardarIntencao({ ...dados, voltar: destino });
        router.push(`/entrar?voltar=${encodeURIComponent(destino)}`);
        return;
      }
      if (ehEquipe) {
        notificar({
          tipo: 'info',
          titulo: 'Contas da equipe não compram.',
          descricao: 'Entre com uma conta de cliente para testar o carrinho.',
        });
        return;
      }
      setProdutoPendente(dados.produtoId);
      adicionar.mutate(dados, { onSettled: () => setProdutoPendente(null) });
    },
    [status, ehEquipe, pathname, router, adicionar],
  );

  return {
    executar,
    pendenteParaProduto: (produtoId: string) =>
      adicionar.isPending && produtoPendente === produtoId,
    sessaoCarregando: status === 'carregando',
  };
}

/** Depois do login, retoma a intenção guardada (uma vez) e volta para onde o usuário estava. */
export function useRetomarIntencao() {
  const { status, ehCliente, ehEquipe } = useSessao();
  const adicionar = useAdicionarAoCarrinho();
  const router = useRouter();
  const executou = useRef(false);

  useEffect(() => {
    if (status !== 'autenticado' || executou.current) return;
    const intencao = lerIntencao();
    if (!intencao) return;
    executou.current = true;
    limparIntencao();

    if (ehEquipe) {
      notificar({
        tipo: 'info',
        titulo: 'Contas da equipe não compram.',
        descricao:
          'O item não foi adicionado. Entre com uma conta de cliente para testar o carrinho.',
      });
      return;
    }
    if (!ehCliente) return;

    const { voltar, ...dados } = intencao;
    adicionar.mutate(dados);
    if (voltar) router.replace(voltar);
  }, [status, ehCliente, ehEquipe, adicionar, router]);
}
