'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Erro } from '@/components/estados/erro';
import { EsqueletoArvore } from '@/components/estados/skeletons';
import { Badge } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Campo, Input, Selecao } from '@/components/ui/campo';
import { DialogRaiz, ModalConteudo } from '@/components/ui/dialog';
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
import { cn, gerarSlug } from '@/lib/utils';
import { notificar } from '@/stores/ui-store';

type Modal =
  | { modo: 'criar'; parentId: string | null }
  | { modo: 'editar'; categoria: Categoria }
  | { modo: 'excluir'; categoria: Categoria }
  | null;

/** Árvore com criar, renomear, reordenar, desativar e excluir. Só ADMIN escreve (o back garante). */
export function GerenciarCategorias() {
  const arvore = useArvoreCategorias(true);
  const [modal, setModal] = useState<Modal>(null);

  if (arvore.isPending) return <EsqueletoArvore />;
  if (arvore.isError) {
    return (
      <Erro
        erro={arvore.error}
        titulo="Não foi possível carregar as categorias."
        aoTentarDeNovo={() => void arvore.refetch()}
        tentandoDeNovo={arvore.isFetching}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Botao
          icone={<Plus className="size-4" aria-hidden />}
          onClick={() => setModal({ modo: 'criar', parentId: null })}
        >
          Nova categoria
        </Botao>
      </div>

      <ul className="flex flex-col gap-2" aria-label="Árvore de categorias">
        {arvore.data.map((raiz, i) => (
          <NoCategoria
            key={raiz.id}
            categoria={raiz}
            irmaos={arvore.data}
            indice={i}
            abrirModal={setModal}
          />
        ))}
      </ul>

      <DialogRaiz open={!!modal} onOpenChange={(aberto) => !aberto && setModal(null)}>
        {modal?.modo === 'criar' && (
          <ModalCategoria
            parentId={modal.parentId}
            todas={arvore.data}
            aoFechar={() => setModal(null)}
          />
        )}
        {modal?.modo === 'editar' && (
          <ModalCategoria
            categoria={modal.categoria}
            todas={arvore.data}
            aoFechar={() => setModal(null)}
          />
        )}
        {modal?.modo === 'excluir' && (
          <ModalExcluir categoria={modal.categoria} aoFechar={() => setModal(null)} />
        )}
      </DialogRaiz>
    </div>
  );
}

interface NoProps {
  categoria: Categoria;
  irmaos: Categoria[];
  indice: number;
  abrirModal: (m: Modal) => void;
}

function NoCategoria({ categoria, irmaos, indice, abrirModal }: NoProps) {
  const atualizar = useAtualizarCategoria();

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

  const botao =
    'rounded-campo px-2 py-1 text-apoio font-medium text-suave hover:bg-papel-2 hover:text-tinta disabled:opacity-40';

  return (
    <li
      className={cn(
        'rounded-card border-borda bg-branco shadow-card border',
        categoria.nivel > 0 && 'border-0 border-l bg-transparent',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2',
          categoria.nivel > 0 && 'pl-4',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn(
              'truncate',
              categoria.nivel === 0 ? 'text-corpo font-medium' : 'text-corpo',
            )}
          >
            {categoria.nome}
          </span>
          <span className="preco text-micro text-suave truncate">/{categoria.slug}</span>
          {!categoria.ativo && <Badge variante="alerta">Inativa</Badge>}
        </div>
        <div
          className="flex items-center gap-0.5"
          role="group"
          aria-label={`Ações para ${categoria.nome}`}
        >
          <button
            type="button"
            onClick={() => void mover(-1)}
            disabled={indice === 0 || atualizar.isPending}
            className={botao}
            aria-label={`Subir ${categoria.nome}`}
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void mover(1)}
            disabled={indice === irmaos.length - 1 || atualizar.isPending}
            className={botao}
            aria-label={`Descer ${categoria.nome}`}
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
          {categoria.nivel === 0 && (
            <button
              type="button"
              onClick={() => abrirModal({ modo: 'criar', parentId: categoria.id })}
              className={botao}
            >
              Subcategoria
            </button>
          )}
          <button
            type="button"
            onClick={() => abrirModal({ modo: 'editar', categoria })}
            className={botao}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={atualizar.isPending}
            className={botao}
          >
            {categoria.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            type="button"
            onClick={() => abrirModal({ modo: 'excluir', categoria })}
            className={cn(botao, 'hover:text-alerta')}
          >
            Excluir
          </button>
        </div>
      </div>
      {categoria.filhos.length > 0 && (
        <ul className="border-borda ml-4 flex flex-col border-l pb-2">
          {categoria.filhos.map((f, i) => (
            <NoCategoria
              key={f.id}
              categoria={f}
              irmaos={categoria.filhos}
              indice={i}
              abrirModal={abrirModal}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function ModalCategoria({
  categoria,
  parentId,
  todas,
  aoFechar,
}: {
  categoria?: Categoria;
  parentId?: string | null;
  todas: Categoria[];
  aoFechar: () => void;
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
      aoFechar();
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
    <ModalConteudo
      titulo={editando ? `Editar ${categoria.nome}` : 'Nova categoria'}
      descricao="Mover uma categoria recalcula o caminho de toda a subárvore."
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={enviando}>
            Cancelar
          </Botao>
          <Botao form="form-categoria" type="submit" carregando={enviando}>
            {editando ? 'Salvar' : 'Criar'}
          </Botao>
        </>
      }
    >
      <form
        id="form-categoria"
        onSubmit={form.handleSubmit(aoEnviar)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Campo rotulo="Nome" erro={erros.nome?.message} obrigatorio>
          {(a11y) => <Input {...a11y} {...form.register('nome')} disabled={enviando} />}
        </Campo>
        <Campo
          rotulo="Slug"
          erro={erros.slug?.message}
          dica="Aparece na URL: /categoria/slug"
          obrigatorio
        >
          {(a11y) => (
            <Input {...a11y} {...form.register('slug')} className="preco" disabled={enviando} />
          )}
        </Campo>
        <Campo rotulo="Categoria pai" erro={erros.parentId?.message} dica="Vazio = categoria raiz.">
          {(a11y) => (
            <Selecao {...a11y} {...form.register('parentId')} disabled={enviando}>
              <option value="">Nenhuma (raiz)</option>
              {raizes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </Selecao>
          )}
        </Campo>
      </form>
    </ModalConteudo>
  );
}

function ModalExcluir({ categoria, aoFechar }: { categoria: Categoria; aoFechar: () => void }) {
  const remover = useRemoverCategoria();
  const temFilhos = categoria.filhos.length > 0;
  const total = achatarCategorias([categoria]).length - 1;
  return (
    <ModalConteudo
      titulo={`Excluir ${categoria.nome}?`}
      descricao="Só é possível excluir categorias sem subcategorias e sem produtos. Para tirar da loja sem excluir, use Desativar."
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Manter
          </Botao>
          <Botao
            variante="perigo"
            carregando={remover.isPending}
            disabled={temFilhos}
            onClick={() => remover.mutate(categoria.id, { onSuccess: aoFechar })}
          >
            Excluir
          </Botao>
        </>
      }
    >
      {temFilhos ? (
        <p className="text-corpo text-suave">
          Esta categoria tem {total} {total === 1 ? 'subcategoria' : 'subcategorias'}. Exclua ou
          mova as subcategorias primeiro.
        </p>
      ) : (
        <p className="text-corpo text-suave">
          Se houver produtos nela, a API recusa a exclusão e nada muda.
        </p>
      )}
    </ModalConteudo>
  );
}
