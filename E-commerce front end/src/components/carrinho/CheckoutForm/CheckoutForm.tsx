'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { mesmoInstante } from '@/lib/agenda';
import { carrinhoApi } from '@/lib/api/carrinho';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import { acaoParaProblema, descreverProblema } from '@/lib/constantes';
import { useFinalizarCompra } from '@/lib/hooks/use-pedidos';
import { useAtualizarPerfil } from '@/lib/hooks/use-usuarios';
import { qk } from '@/lib/query-keys';
import { checkoutSchema, type DadosCheckout } from '@/lib/schemas/checkout';
import { updateMeSchema } from '@/lib/schemas/usuario';
import type { Carrinho, ProblemaItem } from '@/lib/tipos';
import { gerarChaveIdempotencia } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';
import { CartLine } from '../CartLine/CartLine';
import { OrderSummary } from '../OrderSummary/OrderSummary';
import * as S from './style';

const semAcao = () => undefined;

/**
 * Um formulário só (React Hook Form + Zod). O back não recebe corpo no POST /pedidos: o pedido
 * nasce do carrinho e o nome vem da conta. Por isso o nome editável aqui vai para
 * PATCH /usuarios/me antes de finalizar, e é o que entra no snapshot do pedido e no e-mail.
 */
export function CheckoutForm({ carrinho }: { carrinho: Carrinho }) {
  const { usuario } = useSessao();
  const router = useRouter();
  const qc = useQueryClient();
  const finalizar = useFinalizarCompra();
  const atualizarPerfil = useAtualizarPerfil();

  // Gerada uma vez por tentativa (inicializador preguiçoso), não a cada render. Trocada só
  // quando o carrinho muda.
  const [chave, setChave] = useState(gerarChaveIdempotencia);
  const [problemas, setProblemas] = useState<ProblemaItem[] | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [corrigindo, setCorrigindo] = useState(false);

  const form = useForm<DadosCheckout>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { nome: usuario?.nome ?? '' },
    mode: 'onBlur',
  });

  const temIndisponivel = carrinho.itens.some((i) => !i.disponivel);
  const enviando = finalizar.isPending || atualizarPerfil.isPending;
  const bloqueado = temIndisponivel || !!problemas || enviando;

  async function aoEnviar(dados: DadosCheckout) {
    setErroGeral(null);
    try {
      const nome = dados.nome.trim();
      if (usuario && nome !== usuario.nome) {
        await atualizarPerfil.mutateAsync(updateMeSchema.parse({ nome }));
      }
      const pedido = await finalizar.mutateAsync(chave);
      router.push(`/pedido/${pedido.id}`);
    } catch (erro) {
      if (ehApiError(erro, 'ITENS_INDISPONIVEIS')) {
        setProblemas(Array.isArray(erro.detalhes) ? (erro.detalhes as ProblemaItem[]) : []);
        void qc.invalidateQueries({ queryKey: qk.carrinho.atual });
        return;
      }
      if (ehApiError(erro, 'CARRINHO_VAZIO')) {
        void qc.invalidateQueries({ queryKey: qk.carrinho.atual });
        router.replace('/carrinho');
        return;
      }
      setErroGeral(mensagemDeErro(erro));
    }
  }

  /** Remove ou ajusta cada item problemático; depois o usuário revê e finaliza de novo. */
  async function corrigirCarrinho() {
    if (!problemas) return;
    setCorrigindo(true);
    try {
      for (const p of problemas) {
        const linhas = carrinho.itens.filter(
          (i) =>
            i.produto.id === p.produtoId &&
            (p.agendadoPara === undefined || mesmoInstante(i.agendadoPara, p.agendadoPara ?? null)),
        );
        for (const linha of linhas) {
          if (acaoParaProblema(p) === 'ajustar') {
            await carrinhoApi.atualizarItem(linha.id, p.disponivel ?? 0);
          } else {
            await carrinhoApi.removerItem(linha.id);
          }
        }
      }
      await qc.invalidateQueries({ queryKey: qk.carrinho.atual });
      setChave(gerarChaveIdempotencia());
      setProblemas(null);
      notificar({
        tipo: 'sucesso',
        titulo: 'Carrinho atualizado.',
        descricao: 'Revise os itens e finalize de novo.',
      });
    } catch (erro) {
      notificar({
        tipo: 'erro',
        titulo: 'Não foi possível atualizar o carrinho.',
        descricao: mensagemDeErro(erro),
      });
    } finally {
      setCorrigindo(false);
    }
  }

  const mailpit = process.env.NEXT_PUBLIC_MAILPIT_URL;

  return (
    <S.Root onSubmit={form.handleSubmit(aoEnviar)} noValidate>
      <S.Items aria-labelledby="titulo-checkout">
        <S.Title id="titulo-checkout">Finalizar compra</S.Title>

        {problemas && (
          <S.ProblemPanel role="alert">
            <S.ProblemHeader>
              <S.ProblemIcon>
                <AlertTriangle size={20} aria-hidden />
              </S.ProblemIcon>
              <div>
                <S.ProblemTitle>Alguns itens mudaram desde que você os adicionou.</S.ProblemTitle>
                <S.ProblemText>
                  O carrinho é uma foto, não uma reserva: o estoque é confirmado só ao finalizar.
                </S.ProblemText>
              </div>
            </S.ProblemHeader>
            <S.ProblemList>
              {problemas.map((p, i) => (
                <li key={`${p.produtoId}-${i}`}>
                  <S.ProblemName>{p.nome ?? 'Item'}</S.ProblemName>: {descreverProblema(p)}.
                </li>
              ))}
              {problemas.length === 0 && <li>Um ou mais itens ficaram indisponíveis.</li>}
            </S.ProblemList>
            <S.ProblemAction>
              <Button
                variant="secondary"
                onClick={() => void corrigirCarrinho()}
                loading={corrigindo}
              >
                Atualizar carrinho e continuar
              </Button>
            </S.ProblemAction>
          </S.ProblemPanel>
        )}

        {temIndisponivel && !problemas && (
          <S.UnavailableNotice role="status">
            Um item saiu de venda.{' '}
            <S.NoticeLink href="/carrinho">Remova-o no carrinho</S.NoticeLink> para continuar.
          </S.UnavailableNotice>
        )}

        <S.ItemList aria-label="Itens da compra">
          {carrinho.itens.map((item) => (
            <CartLine
              key={item.id}
              item={item}
              readOnly
              onQuantityChange={semAcao}
              onRemove={semAcao}
            />
          ))}
        </S.ItemList>
        <S.Hint>
          Precisa mudar alguma quantidade?{' '}
          <S.HintLink href="/carrinho">Volte ao carrinho</S.HintLink>.
        </S.Hint>
      </S.Items>

      <S.Summary>
        <S.SummaryCard>
          <S.Buyer>
            <S.Legend>Dados do comprador</S.Legend>
            <Field label="Nome completo" error={form.formState.errors.nome?.message} required>
              {(a11y) => (
                <Input
                  {...a11y}
                  {...form.register('nome')}
                  autoComplete="name"
                  disabled={enviando}
                />
              )}
            </Field>
            <S.EmailBlock>
              <S.EmailLabel>E-mail</S.EmailLabel>
              <S.EmailValue>{usuario?.email}</S.EmailValue>
              <S.Hint>A confirmação da compra vai para este e-mail.</S.Hint>
            </S.EmailBlock>
          </S.Buyer>

          <S.Totals>
            <OrderSummary
              subtotalCentavos={carrinho.subtotalCentavos}
              totalItens={carrinho.totalItens}
            />
          </S.Totals>

          {erroGeral && <S.GeneralError role="alert">{erroGeral}</S.GeneralError>}

          <Button
            type="submit"
            size="lg"
            disabled={bloqueado}
            loading={enviando}
            aria-describedby="nota-checkout"
          >
            {enviando ? 'Finalizando…' : 'Finalizar compra'}
          </Button>
          <S.Note id="nota-checkout">
            Ao finalizar, o estoque e os horários são confirmados e o pedido fica aguardando
            pagamento.
            {mailpit && (
              <>
                {' '}
                Nesta demonstração, os e-mails caem na{' '}
                <S.ExternalLink href={mailpit} target="_blank" rel="noreferrer">
                  caixa local
                </S.ExternalLink>
                .
              </>
            )}
          </S.Note>
        </S.SummaryCard>
      </S.Summary>
    </S.Root>
  );
}
