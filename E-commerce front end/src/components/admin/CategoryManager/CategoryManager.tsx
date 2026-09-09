'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ErrorState } from '@/components/estados/ErrorState';
import { CategoryTreeSkeleton } from '@/components/estados/Skeletons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, NativeSelect } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Dialog';
import { achatarCategorias } from '@/lib/api/categorias';
import { ehApiError, mensagemDeErro } from '@/lib/api/cliente';
import {
  useArvoreCategorias,
  useAtualizarCategoria,
  useCriarCategoria,
  useRemoverCategoria,
} from '@/lib/hooks/use-categorias';
import { formularioCategoriaSchema, type FormularioCategoria } from '@/lib/schemas/categoria';
import type { Categoria } from '@/lib/tipos';
import { gerarSlug } from '@/lib/utils';
import { notificar } from '@/stores/ui-store';
import * as S from './style';

type ModalState =
  | { modo: 'criar'; parentId: string | null }
  | { modo: 'editar'; categoria: Categoria }
  | { modo: 'excluir'; categoria: Categoria }
  | null;

/** Árvore com criar, renomear, reordenar, desativar e excluir. Só ADMIN escreve (o back garante). */
export function CategoryManager() {
  const arvore = useArvoreCategorias(true);
  const [modal, setModal] = useState<ModalState>(null);

  if (arvore.isPending) return <CategoryTreeSkeleton />;
  if (arvore.isError) {
    return (
      <ErrorState
        error={arvore.error}
        title="Não foi possível carregar as categorias."
        onRetry={() => void arvore.refetch()}
        retrying={arvore.isFetching}
      />
    );
  }

  return (
    <S.Root>
      <S.Toolbar>
        <Button
          icon={<Plus size={16} aria-hidden />}
          onClick={() => setModal({ modo: 'criar', parentId: null })}
        >
          Nova categoria
        </Button>
      </S.Toolbar>

      <S.Tree aria-label="Árvore de categorias">
        {arvore.data.map((raiz, i) => (
          <CategoryNode
            key={raiz.id}
            categoria={raiz}
            irmaos={arvore.data}
            indice={i}
            onOpenModal={setModal}
          />
        ))}
      </S.Tree>

      <>
        {modal?.modo === 'criar' && (
          <CategoryModal
            parentId={modal.parentId}
            todas={arvore.data}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.modo === 'editar' && (
          <CategoryModal
            categoria={modal.categoria}
            todas={arvore.data}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.modo === 'excluir' && (
          <DeleteModal categoria={modal.categoria} onClose={() => setModal(null)} />
        )}
      </>
    </S.Root>
  );
}

interface CategoryNodeProps {
  categoria: Categoria;
  irmaos: Categoria[];
  indice: number;
  onOpenModal: (m: ModalState) => void;
}

function CategoryNode({ categoria, irmaos, indice, onOpenModal }: CategoryNodeProps) {
  const atualizar = useAtualizarCategoria();
  const nested = categoria.nivel > 0;

  /** Reordena trocando de posição com o vizinho e regravando `ordem` como o índice de cada irmão. */
  async function mover(direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= irmaos.length) return;
    const nova = [...irmaos];
    [nova[indice], nova[destino]] = [nova[destino], nova[indice]];
    try {
      for (let i = 0; i < nova.length; i++) {
        if (nova[i].ordem !== i) {
          await atualizar.mutateAsync({ id: nova[i].id, dados: { ordem: i } });
        }
      }
    } catch (erro) {
      // A gravação é uma por irmão: falhar no meio deixa a ordem parcial. Avisa e deixa a
      // invalidação do sucesso anterior (ou o próximo refetch) mostrar o estado real do servidor.
      notificar({
        tipo: 'erro',
        titulo: 'A ordem não foi alterada por completo.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  function alternarAtivo() {
    atualizar.mutate(
      { id: categoria.id, dados: { ativo: !categoria.ativo } },
      {
        onSuccess: () =>
          notificar({
            tipo: 'sucesso',
            titulo: categoria.ativo ? 'Categoria desativada.' : 'Categoria ativada.',
          }),
        onError: (erro) =>
          notificar({
            tipo: 'erro',
            titulo: 'A categoria não foi alterada.',
            descricao: mensagemDeErro(erro),
          }),
      },
    );
  }

  return (
    <S.Node $nested={nested}>
      <S.NodeRow $nested={nested}>
        <S.NodeInfo>
          <S.NodeName $root={!nested}>{categoria.nome}</S.NodeName>
          <S.NodeSlug>/{categoria.slug}</S.NodeSlug>
          {!categoria.ativo && <Badge variant="danger">Inativa</Badge>}
        </S.NodeInfo>
        <S.NodeActions role="group" aria-label={`Ações para ${categoria.nome}`}>
          <S.ActionButton
            type="button"
            onClick={() => void mover(-1)}
            disabled={indice === 0 || atualizar.isPending}
            aria-label={`Subir ${categoria.nome}`}
          >
            <ArrowUp size={16} aria-hidden />
          </S.ActionButton>
          <S.ActionButton
            type="button"
            onClick={() => void mover(1)}
            disabled={indice === irmaos.length - 1 || atualizar.isPending}
            aria-label={`Descer ${categoria.nome}`}
          >
            <ArrowDown size={16} aria-hidden />
          </S.ActionButton>
          {!nested && (
            <S.ActionButton
              type="button"
              onClick={() => onOpenModal({ modo: 'criar', parentId: categoria.id })}
            >
              Subcategoria
            </S.ActionButton>
          )}
          <S.ActionButton type="button" onClick={() => onOpenModal({ modo: 'editar', categoria })}>
            Editar
          </S.ActionButton>
          <S.ActionButton type="button" onClick={alternarAtivo} disabled={atualizar.isPending}>
            {categoria.ativo ? 'Desativar' : 'Ativar'}
          </S.ActionButton>
          <S.ActionButton
            type="button"
            onClick={() => onOpenModal({ modo: 'excluir', categoria })}
            $danger
          >
            Excluir
          </S.ActionButton>
        </S.NodeActions>
      </S.NodeRow>
      {categoria.filhos.length > 0 && (
        <S.Subtree>
          {categoria.filhos.map((f, i) => (
            <CategoryNode
              key={f.id}
              categoria={f}
              irmaos={categoria.filhos}
              indice={i}
              onOpenModal={onOpenModal}
            />
          ))}
        </S.Subtree>
      )}
    </S.Node>
  );
}

function CategoryModal({
  categoria,
  parentId,
  todas,
  onClose,
}: {
  categoria?: Categoria;
  parentId?: string | null;
  todas: Categoria[];
  onClose: () => void;
}) {
  const criar = useCriarCategoria();
  const atualizar = useAtualizarCategoria();
  const editando = !!categoria;
  const raizes = todas.filter((c) => c.id !== categoria?.id);

  const form = useForm<FormularioCategoria>({
    resolver: zodResolver(formularioCategoriaSchema),
    defaultValues: {
      nome: categoria?.nome ?? '',
      slug: categoria?.slug ?? '',
      parentId: categoria?.parentId ?? parentId ?? '',
    },
    mode: 'onBlur',
  });
  const nome = useWatch({ control: form.control, name: 'nome' });
  const slugTocado = form.formState.dirtyFields.slug;

  // Slug sugerido a partir do nome, enquanto o usuário não o editar à mão.
  useEffect(() => {
    if (!editando && !slugTocado) form.setValue('slug', gerarSlug(nome));
  }, [nome, editando, slugTocado, form]);

  async function aoEnviar(dados: FormularioCategoria) {
    const payload = { nome: dados.nome, slug: dados.slug, parentId: dados.parentId || null };
    try {
      if (editando) {
        await atualizar.mutateAsync({ id: categoria.id, dados: payload });
        notificar({ tipo: 'sucesso', titulo: 'Categoria salva.' });
      } else {
        await criar.mutateAsync(payload);
      }
      onClose();
    } catch (erro) {
      if (ehApiError(erro, 'SLUG_JA_EXISTE') || ehApiError(erro, 'REGISTRO_DUPLICADO')) {
        form.setError('slug', { message: 'já existe uma categoria com este slug' });
        return;
      }
      notificar({
        tipo: 'erro',
        titulo: 'A categoria não foi salva.',
        descricao: mensagemDeErro(erro),
      });
    }
  }

  const enviando = criar.isPending || atualizar.isPending;
  const erros = form.formState.errors;

  return (
    <Modal
      open
      onOpenChange={(aberto) => !aberto && onClose()}
      title={editando ? `Editar ${categoria.nome}` : 'Nova categoria'}
      description="Mover uma categoria recalcula o caminho de toda a subárvore."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button form="form-categoria" type="submit" loading={enviando}>
            {editando ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <S.ModalForm id="form-categoria" onSubmit={form.handleSubmit(aoEnviar)} noValidate>
        <Field label="Nome" error={erros.nome?.message} required>
          {(a11y) => <Input {...a11y} {...form.register('nome')} disabled={enviando} />}
        </Field>
        <Field
          label="Slug"
          error={erros.slug?.message}
          hint="Aparece na URL: /categoria/slug"
          required
        >
          {(a11y) => (
            <Input {...a11y} {...form.register('slug')} className="preco" disabled={enviando} />
          )}
        </Field>
        <Field label="Categoria pai" error={erros.parentId?.message} hint="Vazio = categoria raiz.">
          {(a11y) => (
            <NativeSelect {...a11y} {...form.register('parentId')} disabled={enviando}>
              <option value="">Nenhuma (raiz)</option>
              {raizes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
      </S.ModalForm>
    </Modal>
  );
}

function DeleteModal({ categoria, onClose }: { categoria: Categoria; onClose: () => void }) {
  const remover = useRemoverCategoria();
  const temFilhos = categoria.filhos.length > 0;
  const total = achatarCategorias([categoria]).length - 1;
  return (
    <Modal
      open
      onOpenChange={(aberto) => !aberto && onClose()}
      title={`Excluir ${categoria.nome}?`}
      description="Só é possível excluir categorias sem subcategorias e sem produtos. Para tirar da loja sem excluir, use Desativar."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Manter
          </Button>
          <Button
            variant="danger"
            loading={remover.isPending}
            disabled={temFilhos}
            onClick={() => remover.mutate(categoria.id, { onSuccess: onClose })}
          >
            Excluir
          </Button>
        </>
      }
    >
      {temFilhos ? (
        <S.ModalText>
          Esta categoria tem {total} {total === 1 ? 'subcategoria' : 'subcategorias'}. Exclua ou
          mova as subcategorias primeiro.
        </S.ModalText>
      ) : (
        <S.ModalText>Se houver produtos nela, a API recusa a exclusão e nada muda.</S.ModalText>
      )}
    </Modal>
  );
}
