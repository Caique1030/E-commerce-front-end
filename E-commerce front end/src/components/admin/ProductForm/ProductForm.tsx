'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, NativeSelect, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Dialog';
import { ProductImage } from '@/components/ui/ProductImage';
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
import * as S from './style';

export interface ProductFormProps {
  /** Ausente = criação. */
  produto?: Produto;
}

const TIPOS = [
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
] as const;

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
export function ProductForm({ produto }: ProductFormProps) {
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
    <S.Root onSubmit={form.handleSubmit(aoEnviar)} noValidate>
      <S.Card>
        <S.StackFieldset>
          <S.Legend>Tipo</S.Legend>
          <S.TypeOptions>
            {TIPOS.map((o) => (
              <S.TypeOption
                key={o.valor}
                $selected={tipo === o.valor}
                $booking={o.valor === 'BOOKING'}
              >
                <S.TypeRadio
                  type="radio"
                  value={o.valor}
                  {...form.register('tipo')}
                  disabled={enviando}
                />
                <span>
                  <S.TypeLabel>{o.rotulo}</S.TypeLabel>
                  <S.TypeDescription>{o.descricao}</S.TypeDescription>
                </span>
              </S.TypeOption>
            ))}
          </S.TypeOptions>
        </S.StackFieldset>

        <S.GridFieldset>
          <S.Legend>Identificação</S.Legend>
          <Field label="Nome" error={erros.nome?.message} required className="sm:col-span-2">
            {(a11y) => <Input {...a11y} {...form.register('nome')} disabled={enviando} />}
          </Field>
          <Field
            label="SKU"
            error={erros.sku?.message}
            hint="Letras, números, ponto, hífen ou underscore."
            required
          >
            {(a11y) => (
              <Input {...a11y} {...form.register('sku')} className="preco" disabled={enviando} />
            )}
          </Field>
          <Field label="Marca" error={erros.marca?.message}>
            {(a11y) => <Input {...a11y} {...form.register('marca')} disabled={enviando} />}
          </Field>
          <Field
            label="Categoria"
            error={erros.categoriaId?.message}
            required
            className="sm:col-span-2"
          >
            {(a11y) => (
              <NativeSelect
                {...a11y}
                {...form.register('categoriaId')}
                disabled={enviando || arvore.isPending}
              >
                <option value="">
                  {arvore.isPending ? 'Carregando…' : 'Escolha uma categoria'}
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.nivel)}
                    {c.nome}
                    {c.ativo ? '' : ' (inativa)'}
                  </option>
                ))}
              </NativeSelect>
            )}
          </Field>
          <Field
            label="Descrição"
            error={erros.descricao?.message}
            required
            className="sm:col-span-2"
          >
            {(a11y) => (
              <Textarea {...a11y} {...form.register('descricao')} rows={5} disabled={enviando} />
            )}
          </Field>
        </S.GridFieldset>

        <S.GridFieldset>
          <S.Legend>Preço e disponibilidade</S.Legend>
          <Field label="Preço" error={erros.preco?.message} hint="Em reais, ex.: 1.299,90" required>
            {(a11y) => (
              <Input
                {...a11y}
                {...form.register('preco', { onBlur: formatarPrecoAoSair })}
                inputMode="decimal"
                className="preco"
                disabled={enviando}
              />
            )}
          </Field>
          {booking ? (
            <>
              <Field
                label="Duração (minutos)"
                error={erros.duracaoMin?.message}
                hint="Entre 5 e 1440. Define os horários do dia."
                required
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
              </Field>
              <Field
                label="Capacidade por horário"
                error={erros.capacidadeSlot?.message}
                hint="Quantos atendimentos cabem no mesmo horário."
                required
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
              </Field>
            </>
          ) : (
            <Field label="Estoque" error={erros.estoque?.message} required>
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
            </Field>
          )}
        </S.GridFieldset>

        <S.StackFieldset>
          <S.Legend>Imagem</S.Legend>
          <Field
            label="URL da imagem"
            error={erros.imagemUrl?.message}
            hint="Só https://cdn.dummyjson.com é otimizado pelo Next; outros hosts precisam entrar em next.config.ts."
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
          </Field>
        </S.StackFieldset>

        {!editando && (
          <Checkbox
            label="Ativo (visível na loja)"
            {...form.register('ativo')}
            disabled={enviando}
          />
        )}
      </S.Card>

      <S.Sidebar>
        <S.PreviewCard>
          <ProductImage
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
          <S.PreviewCaption>
            {booking
              ? 'Serviços sem foto mostram a faixa de agenda.'
              : 'Pré-visualização da imagem do catálogo.'}
          </S.PreviewCaption>
        </S.PreviewCard>

        <S.ActionsCard>
          <Button type="submit" size="lg" loading={enviando}>
            {editando ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/produtos')}
            disabled={enviando}
          >
            Voltar para a lista
          </Button>
          {editando && produto && (
            <S.DangerZone>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void alternarAtivo()}
                disabled={enviando}
              >
                {produto.ativo ? 'Desativar produto' : 'Reativar produto'}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmandoRemocao(true)}
                disabled={enviando}
              >
                Remover produto
              </Button>
              <Modal
                open={confirmandoRemocao}
                onOpenChange={setConfirmandoRemocao}
                title="Remover este produto?"
                description="Ele sai do catálogo e do carrinho dos clientes. Pedidos antigos continuam com o histórico intacto (remoção lógica)."
                footer={
                  <>
                    <Button variant="secondary" onClick={() => setConfirmandoRemocao(false)}>
                      Manter
                    </Button>
                    <Button
                      variant="danger"
                      loading={remover.isPending}
                      onClick={() =>
                        remover.mutate(produto.id, {
                          onSuccess: () => router.push('/admin/produtos'),
                        })
                      }
                    >
                      Remover
                    </Button>
                  </>
                }
              >
                <S.ConfirmText>
                  <S.ConfirmName>{produto.nome}</S.ConfirmName>{' '}
                  <S.ConfirmSku>({produto.sku})</S.ConfirmSku>
                </S.ConfirmText>
              </Modal>
            </S.DangerZone>
          )}
        </S.ActionsCard>
      </S.Sidebar>
    </S.Root>
  );
}
