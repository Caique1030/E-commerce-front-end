'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Botao } from '@/components/ui/botao';
import { Caixa, Campo, Input, Selecao, Textarea } from '@/components/ui/campo';
import { DialogRaiz, ModalConteudo } from '@/components/ui/dialog';
import { ImagemProduto } from '@/components/ui/imagem-produto';
import { achatarCategorias } from '@/lib/api/categorias';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import { brlParaCentavos, centavosParaBRL } from '@/lib/formatadores';
import { useArvoreCategorias } from '@/lib/hooks/use-categorias';
import { useAtualizarProduto, useCriarProduto, useRemoverProduto } from '@/lib/hooks/use-produtos';
import {
  createProductSchema,
  formularioParaPayload,
  formularioProdutoSchema,
  updateProductSchema,
  type FormularioProduto,
  type FormularioProdutoEntrada,
} from '@/lib/schemas/produto';
import type { ProblemaValidacao, Produto } from '@/lib/tipos';
import { notificar } from '@/stores/ui-store';

interface FormularioProdutoProps {
  /** Ausente = criação. */
  produto?: Produto;
}

function valoresIniciais(p?: Produto): FormularioProdutoEntrada {
  return {
    sku: p?.sku ?? '',
    nome: p?.nome ?? '',
    descricao: p?.descricao ?? '',
    preco: p ? centavosParaBRL(p.precoCentavos) : '',
    estoque: p?.estoque ?? 0,
    imagemUrl: p?.imagemUrl ?? '',
    marca: p?.marca ?? '',
    tipo: p?.tipo ?? 'SIMPLE',
    categoriaId: p?.categoria.id ?? '',
    duracaoMin: p?.duracaoMin ?? '',
    capacidadeSlot: p?.capacidadeSlot ?? '',
    ativo: p?.ativo ?? true,
  };
}

/**
 * Cadastro e edição. O campo `tipo` controla condicionalmente duração e capacidade
 * (watch + superRefine). Preço aceita "R$ 1.299,90" e vira centavos inteiros antes de enviar;
 * o payload final ainda passa pelo createProductSchema, o mesmo do back.
 */
export function FormularioProduto({ produto }: FormularioProdutoProps) {
  const router = useRouter();
  const editando = !!produto;
  const criar = useCriarProduto();
  const atualizar = useAtualizarProduto(produto?.id ?? '');
  const remover = useRemoverProduto();
  const arvore = useArvoreCategorias(true);
  const categorias = arvore.data ? achatarCategorias(arvore.data) : [];
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  const form = useForm<FormularioProdutoEntrada, unknown, FormularioProduto>({
    resolver: zodResolver(formularioProdutoSchema),
    defaultValues: valoresIniciais(produto),
    mode: 'onBlur',
  });

  const tipo = useWatch({ control: form.control, name: 'tipo' });
  const imagemUrl = useWatch({ control: form.control, name: 'imagemUrl' });
  const duracaoDigitada = useWatch({ control: form.control, name: 'duracaoMin' });
  const capacidadeDigitada = useWatch({ control: form.control, name: 'capacidadeSlot' });
  const booking = tipo === 'BOOKING';
  const erros = form.formState.errors;
  const enviando = criar.isPending || atualizar.isPending;

  function aplicarErrosDaApi(erro: unknown): boolean {
    if (ehApiError(erro, 'SKU_JA_EXISTE')) {
      form.setError('sku', { message: 'já existe um produto com este SKU' });
      return true;
    }
    if (ehApiError(erro, 'VALIDACAO') && Array.isArray(erro.detalhes)) {
      for (const d of erro.detalhes as ProblemaValidacao[]) {
        const campo = d.campo === 'precoCentavos' ? 'preco' : d.campo;
        if (campo in valoresIniciais()) {
          form.setError(campo as keyof FormularioProdutoEntrada, { message: d.mensagem });
        }
      }
      return true;
    }
    if (ehApiError(erro, 'CATEGORIA_INVALIDA')) {
      form.setError('categoriaId', { message: 'a categoria informada não existe' });
      return true;
    }
    return false;
  }

  async function aoEnviar(valores: FormularioProduto) {
    const payload = formularioParaPayload(valores);
    try {
      if (editando) {
        const dados = updateProductSchema.parse(payload);
        await atualizar.mutateAsync(dados);
        notificar({ tipo: 'sucesso', titulo: 'Produto salvo.' });
        form.reset(
          valoresIniciais({ ...produto, ...dados, categoria: produto.categoria } as Produto),
        );
      } else {
        const dados = createProductSchema.parse(payload);
        const novo = await criar.mutateAsync(dados);
        notificar({
          tipo: 'sucesso',
          titulo: 'Produto cadastrado.',
          descricao: `${novo.nome} já aparece na loja.`,
        });
        router.push(`/admin/produtos/${novo.id}`);
      }
    } catch (erro) {
      if (!aplicarErrosDaApi(erro)) {
        notificar({
          tipo: 'erro',
          titulo: 'O produto não foi salvo.',
          descricao: mensagemDeErro(erro),
        });
      }
    }
  }

  function formatarPrecoAoSair() {
    const v = form.getValues('preco');
    const cents = brlParaCentavos(v);
    if (cents !== null)
      form.setValue('preco', centavosParaBRL(cents), { shouldValidate: true, shouldDirty: true });
  }

  async function alternarAtivo() {
    if (!produto) return;
    try {
      const salvo = await atualizar.mutateAsync({ ativo: !produto.ativo });
      notificar({
        tipo: 'sucesso',
        titulo: salvo.ativo ? 'Produto reativado.' : 'Produto desativado.',
        descricao: salvo.ativo
          ? 'Voltou a aparecer na loja.'
          : 'Some da loja, mas continua no histórico de pedidos.',
      });
      form.setValue('ativo', salvo.ativo);
    } catch (erro) {
      notificar({
        tipo: 'erro',
        titulo: 'Não foi possível alterar a situação.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(aoEnviar)}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="rounded-card border-borda bg-branco flex flex-col gap-5 border p-5">
        <fieldset className="flex flex-col gap-4">
          <legend className="text-h2 mb-1">Tipo</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  valor: 'SIMPLE',
                  rotulo: 'Produto físico',
                  descricao: 'Tem estoque; o cliente adiciona ao carrinho.',
                },
                {
                  valor: 'BOOKING',
                  rotulo: 'Serviço agendado',
                  descricao: 'Tem duração e capacidade; o cliente escolhe data e horário.',
                },
              ] as const
            ).map((o) => (
              <label
                key={o.valor}
                className={`rounded-card flex cursor-pointer items-start gap-3 border p-3 ${tipo === o.valor ? (o.valor === 'BOOKING' ? 'border-agenda bg-agenda-suave/50' : 'border-verde-nota bg-verde-suave/50') : 'border-borda hover:border-borda-forte'}`}
              >
                <input
                  type="radio"
                  value={o.valor}
                  {...form.register('tipo')}
                  className="accent-verde-nota mt-1"
                  disabled={enviando}
                />
                <span>
                  <span className="text-corpo block font-medium">{o.rotulo}</span>
                  <span className="text-apoio text-suave block">{o.descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="text-h2 mb-1">Identificação</legend>
          <Campo rotulo="Nome" erro={erros.nome?.message} obrigatorio className="sm:col-span-2">
            {(a11y) => <Input {...a11y} {...form.register('nome')} disabled={enviando} />}
          </Campo>
          <Campo
            rotulo="SKU"
            erro={erros.sku?.message}
            dica="Letras, números, ponto, hífen ou underscore."
            obrigatorio
          >
            {(a11y) => (
              <Input {...a11y} {...form.register('sku')} className="preco" disabled={enviando} />
            )}
          </Campo>
          <Campo rotulo="Marca" erro={erros.marca?.message}>
            {(a11y) => <Input {...a11y} {...form.register('marca')} disabled={enviando} />}
          </Campo>
          <Campo
            rotulo="Categoria"
            erro={erros.categoriaId?.message}
            obrigatorio
            className="sm:col-span-2"
          >
            {(a11y) => (
              <Selecao
                {...a11y}
                {...form.register('categoriaId')}
                disabled={enviando || arvore.isPending}
              >
                <option value="">
                  {arvore.isPending ? 'Carregando…' : 'Escolha uma categoria'}
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.nivel)}
                    {c.nome}
                    {c.ativo ? '' : ' (inativa)'}
                  </option>
                ))}
              </Selecao>
            )}
          </Campo>
          <Campo
            rotulo="Descrição"
            erro={erros.descricao?.message}
            obrigatorio
            className="sm:col-span-2"
          >
            {(a11y) => (
              <Textarea {...a11y} {...form.register('descricao')} rows={5} disabled={enviando} />
            )}
          </Campo>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="text-h2 mb-1">Preço e disponibilidade</legend>
          <Campo
            rotulo="Preço"
            erro={erros.preco?.message}
            dica="Em reais, ex.: 1.299,90"
            obrigatorio
          >
            {(a11y) => (
              <Input
                {...a11y}
                {...form.register('preco', { onBlur: formatarPrecoAoSair })}
                inputMode="decimal"
                className="preco"
                disabled={enviando}
              />
            )}
          </Campo>
          {booking ? (
            <>
              <Campo
                rotulo="Duração (minutos)"
                erro={erros.duracaoMin?.message}
                dica="Entre 5 e 1440. Define os horários do dia."
                obrigatorio
              >
                {(a11y) => (
                  <Input
                    {...a11y}
                    {...form.register('duracaoMin')}
                    type="number"
                    min={5}
                    max={1440}
                    step={5}
                    className="preco"
                    disabled={enviando}
                  />
                )}
              </Campo>
              <Campo
                rotulo="Capacidade por horário"
                erro={erros.capacidadeSlot?.message}
                dica="Quantos atendimentos cabem no mesmo horário."
                obrigatorio
              >
                {(a11y) => (
                  <Input
                    {...a11y}
                    {...form.register('capacidadeSlot')}
                    type="number"
                    min={1}
                    max={1000}
                    className="preco"
                    disabled={enviando}
                  />
                )}
              </Campo>
            </>
          ) : (
            <Campo rotulo="Estoque" erro={erros.estoque?.message} obrigatorio>
              {(a11y) => (
                <Input
                  {...a11y}
                  {...form.register('estoque')}
                  type="number"
                  min={0}
                  step={1}
                  className="preco"
                  disabled={enviando}
                />
              )}
            </Campo>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="text-h2 mb-1">Imagem</legend>
          <Campo
            rotulo="URL da imagem"
            erro={erros.imagemUrl?.message}
            dica="Só https://cdn.dummyjson.com é otimizado pelo Next; outros hosts precisam entrar em next.config.ts."
          >
            {(a11y) => (
              <Input
                {...a11y}
                {...form.register('imagemUrl')}
                type="url"
                inputMode="url"
                disabled={enviando}
              />
            )}
          </Campo>
        </fieldset>

        {!editando && (
          <Caixa rotulo="Ativo (visível na loja)" {...form.register('ativo')} disabled={enviando} />
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-card border-borda bg-branco overflow-hidden border">
          <ImagemProduto
            src={
              typeof imagemUrl === 'string' && imagemUrl.startsWith('https://cdn.dummyjson.com/')
                ? imagemUrl
                : null
            }
            nome="Pré-visualização"
            tipo={tipo}
            duracaoMin={booking ? Number(duracaoDigitada) || 60 : null}
            capacidadeSlot={booking ? Number(capacidadeDigitada) || null : null}
            sizes="320px"
          />
          <p className="text-micro text-suave px-3 py-2">
            {booking
              ? 'Serviços sem foto mostram a faixa de agenda.'
              : 'Pré-visualização da imagem do catálogo.'}
          </p>
        </div>

        <div className="rounded-card border-borda bg-branco flex flex-col gap-2 border p-4">
          <Botao type="submit" tamanho="lg" carregando={enviando}>
            {editando ? 'Salvar alterações' : 'Cadastrar produto'}
          </Botao>
          <Botao
            type="button"
            variante="fantasma"
            onClick={() => router.push('/admin/produtos')}
            disabled={enviando}
          >
            Voltar para a lista
          </Botao>
          {editando && produto && (
            <div className="border-borda mt-2 flex flex-col gap-2 border-t pt-3">
              <Botao
                type="button"
                variante="secundario"
                onClick={() => void alternarAtivo()}
                disabled={enviando}
              >
                {produto.ativo ? 'Desativar produto' : 'Reativar produto'}
              </Botao>
              <DialogRaiz open={confirmandoRemocao} onOpenChange={setConfirmandoRemocao}>
                <Botao
                  type="button"
                  variante="perigo"
                  onClick={() => setConfirmandoRemocao(true)}
                  disabled={enviando}
                >
                  Remover produto
                </Botao>
                <ModalConteudo
                  titulo="Remover este produto?"
                  descricao="Ele sai do catálogo e do carrinho dos clientes. Pedidos antigos continuam com o histórico intacto (remoção lógica)."
                  rodape={
                    <>
                      <Botao variante="secundario" onClick={() => setConfirmandoRemocao(false)}>
                        Manter
                      </Botao>
                      <Botao
                        variante="perigo"
                        carregando={remover.isPending}
                        onClick={() =>
                          remover.mutate(produto.id, {
                            onSuccess: () => router.push('/admin/produtos'),
                          })
                        }
                      >
                        Remover
                      </Botao>
                    </>
                  }
                >
                  <p className="text-corpo">
                    <span className="font-medium">{produto.nome}</span>{' '}
                    <span className="preco text-suave">({produto.sku})</span>
                  </p>
                </ModalConteudo>
              </DialogRaiz>
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
