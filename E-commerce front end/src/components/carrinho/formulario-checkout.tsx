'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Botao } from '@/components/ui/botao';
import { Campo, Input } from '@/components/ui/campo';
import { mesmoInstante } from '@/lib/agenda';
import { carrinhoApi } from '@/lib/api/carrinho';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import { acaoParaProblema, descreverProblema } from '@/lib/constantes';
import { useFinalizarCompra } from '@/lib/hooks/use-pedidos';
import { useAtualizarPerfil } from '@/lib/hooks/use-usuarios';
import { qk } from '@/lib/query-keys';
import { checkoutSchema, type DadosCheckout } from '@/lib/schemas/checkout';
import type { Carrinho, ProblemaItem } from '@/lib/tipos';
import { gerarChaveIdempotencia } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';
import { LinhaItem } from './linha-item';
import { ResumoValores } from './resumo-valores';

const semAcao = () => undefined;

/**
 * Um formulário só (React Hook Form + Zod). O back não recebe corpo no POST /pedidos: o pedido
 * nasce do carrinho e o nome vem da conta. Por isso o nome editável aqui vai para
 * PATCH /usuarios/me antes de finalizar, e é o que entra no snapshot do pedido e no e-mail.
 */
export function FormularioCheckout({ carrinho }: { carrinho: Carrinho }) {
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
      if (usuario && nome !== usuario.nome) await atualizarPerfil.mutateAsync({ nome });
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
    <form
      onSubmit={form.handleSubmit(aoEnviar)}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10"
    >
      <section aria-labelledby="titulo-checkout" className="flex flex-col gap-4">
        <h1 id="titulo-checkout" className="text-h1">
          Finalizar compra
        </h1>

        {problemas && (
          <div
            role="alert"
            className="rounded-card border-alerta/30 bg-alerta-suave flex flex-col gap-3 border p-4"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-alerta mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-corpo text-tinta font-medium">
                  Alguns itens mudaram desde que você os adicionou.
                </p>
                <p className="text-apoio text-suave">
                  O carrinho é uma foto, não uma reserva: o estoque é confirmado só ao finalizar.
                </p>
              </div>
            </div>
            <ul className="text-corpo flex flex-col gap-1 pl-7">
              {problemas.map((p, i) => (
                <li key={`${p.produtoId}-${i}`}>
                  <span className="font-medium">{p.nome ?? 'Item'}</span>: {descreverProblema(p)}.
                </li>
              ))}
              {problemas.length === 0 && <li>Um ou mais itens ficaram indisponíveis.</li>}
            </ul>
            <div className="pl-7">
              <Botao
                variante="secundario"
                onClick={() => void corrigirCarrinho()}
                carregando={corrigindo}
              >
                Atualizar carrinho e continuar
              </Botao>
            </div>
          </div>
        )}

        {temIndisponivel && !problemas && (
          <p
            className="rounded-card border-alerta/25 bg-alerta-suave text-apoio text-alerta border px-4 py-3"
            role="status"
          >
            Um item saiu de venda.{' '}
            <Link href="/carrinho" className="font-medium underline underline-offset-4">
              Remova-o no carrinho
            </Link>{' '}
            para continuar.
          </p>
        )}

        <ul
          className="divide-borda rounded-card border-borda bg-branco divide-y border px-5"
          aria-label="Itens da compra"
        >
          {carrinho.itens.map((item) => (
            <LinhaItem
              key={item.id}
              item={item}
              somenteLeitura
              aoAlterarQuantidade={semAcao}
              aoRemover={semAcao}
            />
          ))}
        </ul>
        <p className="text-apoio text-suave">
          Precisa mudar alguma quantidade?{' '}
          <Link href="/carrinho" className="hover:text-tinta underline underline-offset-4">
            Volte ao carrinho
          </Link>
          .
        </p>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border-borda bg-branco flex flex-col gap-5 border p-5">
          <fieldset className="flex flex-col gap-4">
            <legend className="text-h2">Dados do comprador</legend>
            <Campo rotulo="Nome completo" erro={form.formState.errors.nome?.message} obrigatorio>
              {(a11y) => (
                <Input
                  {...a11y}
                  {...form.register('nome')}
                  autoComplete="name"
                  disabled={enviando}
                />
              )}
            </Campo>
            <div className="flex flex-col gap-1">
              <p className="text-apoio font-medium">E-mail</p>
              <p className="text-corpo">{usuario?.email}</p>
              <p className="text-apoio text-suave">A confirmação da compra vai para este e-mail.</p>
            </div>
          </fieldset>

          <div className="border-borda border-t pt-4">
            <ResumoValores
              subtotalCentavos={carrinho.subtotalCentavos}
              totalItens={carrinho.totalItens}
            />
          </div>

          {erroGeral && (
            <p
              role="alert"
              className="rounded-campo bg-alerta-suave text-apoio text-alerta px-3 py-2"
            >
              {erroGeral}
            </p>
          )}

          <Botao
            type="submit"
            tamanho="lg"
            disabled={bloqueado}
            carregando={enviando}
            aria-describedby="nota-checkout"
          >
            {enviando ? 'Finalizando…' : 'Finalizar compra'}
          </Botao>
          <p id="nota-checkout" className="text-apoio text-suave">
            Ao finalizar, o estoque e os horários são confirmados e o pedido fica aguardando
            pagamento.
            {mailpit && (
              <>
                {' '}
                Nesta demonstração, os e-mails caem na{' '}
                <a
                  href={mailpit}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-tinta underline underline-offset-4"
                >
                  caixa local
                </a>
                .
              </>
            )}
          </p>
        </div>
      </aside>
    </form>
  );
}
