'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Erro } from '@/components/estados/erro';
import { EsqueletoTabela } from '@/components/estados/skeletons';
import { Vazio } from '@/components/estados/vazio';
import { Badge } from '@/components/ui/badge';
import { Botao } from '@/components/ui/botao';
import { Caixa, Selecao } from '@/components/ui/campo';
import { DialogRaiz, ModalConteudo } from '@/components/ui/dialog';
import { Paginacao } from '@/components/ui/paginacao';
import { Tabela, Td, Th } from '@/components/ui/tabela';
import { LIMITE_TABELA, ROTULO_PAPEL } from '@/lib/constantes';
import { formatarData, pluralizar } from '@/lib/formatadores';
import { useChamadaComAtraso } from '@/lib/hooks/use-debounce';
import { useAtualizarUsuario, useRemoverUsuario, useUsuarios } from '@/lib/hooks/use-usuarios';
import type { Papel, Usuario } from '@/lib/tipos';
import { cn } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';

const PAPEIS: Papel[] = ['CLIENTE', 'COMERCIAL', 'ADMIN'];

export function TabelaUsuarios() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { usuario: eu } = useSessao();
  const busca = searchParams.get('busca') ?? '';
  const role = (searchParams.get('role') as Papel | null) ?? '';
  const inativos = searchParams.get('inativos') === '1';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const [textoBusca, setTextoBusca] = useState(busca);
  const [buscaAnterior, setBuscaAnterior] = useState(busca);
  const [removendo, setRemovendo] = useState<Usuario | null>(null);
  if (busca !== buscaAnterior) {
    setBuscaAnterior(busca);
    setTextoBusca(busca);
  }

  function atualizar(mudancas: Record<string, string | undefined>, manterPagina = false) {
    const q = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    if (!manterPagina) q.delete('page');
    const s = q.toString();
    router.replace(s ? `/admin/usuarios?${s}` : '/admin/usuarios', { scroll: false });
  }
  const buscarComAtraso = useChamadaComAtraso(
    (v: string) => atualizar({ busca: v.trim() || undefined }),
    400,
  );

  const usuarios = useUsuarios({
    busca: busca || undefined,
    role: role || undefined,
    incluirInativos: inativos || undefined,
    page,
    limit: LIMITE_TABELA,
  });
  const alterar = useAtualizarUsuario();
  const remover = useRemoverUsuario();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border-borda bg-branco shadow-card flex flex-wrap items-end gap-3 border px-4 py-3">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="busca-usuarios" className="sr-only">
            Buscar usuários
          </label>
          <Search
            className="text-suave pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            id="busca-usuarios"
            type="search"
            value={textoBusca}
            onChange={(e) => {
              setTextoBusca(e.target.value);
              buscarComAtraso(e.target.value);
            }}
            placeholder="Nome ou e-mail"
            className="rounded-campo border-borda-forte bg-branco text-corpo focus:border-tinta h-10 w-full border pr-3 pl-9 focus:outline-none"
          />
        </div>
        <label className="text-apoio flex flex-col gap-1">
          <span className="font-medium">Papel</span>
          <Selecao
            value={role}
            onChange={(e) => atualizar({ role: e.target.value || undefined })}
            className="min-w-44"
          >
            <option value="">Todos</option>
            {PAPEIS.map((p) => (
              <option key={p} value={p}>
                {ROTULO_PAPEL[p]}
              </option>
            ))}
          </Selecao>
        </label>
        <Caixa
          rotulo="Incluir inativos"
          checked={inativos}
          onChange={(e) => atualizar({ inativos: e.target.checked ? '1' : undefined })}
          className="pb-2"
        />
      </div>

      {usuarios.isPending ? (
        <EsqueletoTabela colunas={5} />
      ) : usuarios.isError ? (
        <Erro
          erro={usuarios.error}
          titulo="Não foi possível carregar os usuários."
          aoTentarDeNovo={() => void usuarios.refetch()}
          tentandoDeNovo={usuarios.isFetching}
        />
      ) : usuarios.data.data.length === 0 ? (
        <Vazio
          titulo="Nenhum usuário com esses filtros."
          compacto
          acao={
            <Botao variante="secundario" onClick={() => router.replace('/admin/usuarios')}>
              Limpar filtros
            </Botao>
          }
        />
      ) : (
        <>
          <p className="text-apoio text-suave" aria-live="polite">
            {pluralizar(usuarios.data.meta.total, 'usuário', 'usuários')}
          </p>
          <Tabela className={cn(usuarios.isPlaceholderData && 'opacity-60')}>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Papel</Th>
                <Th>Desde</Th>
                <Th>Situação</Th>
                <Th>
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {usuarios.data.data.map((u) => {
                const souEu = u.id === eu?.id;
                return (
                  <tr key={u.id} className={cn(!u.ativo && 'text-suave')}>
                    <Td className="font-medium">
                      {u.nome}
                      {souEu && (
                        <span className="text-micro text-suave ml-2 font-normal">(você)</span>
                      )}
                    </Td>
                    <Td className="text-apoio">{u.email}</Td>
                    <Td>
                      <label className="sr-only" htmlFor={`papel-${u.id}`}>
                        Papel de {u.nome}
                      </label>
                      <Selecao
                        id={`papel-${u.id}`}
                        value={u.role}
                        disabled={souEu || alterar.isPending}
                        onChange={(e) =>
                          alterar.mutate(
                            { id: u.id, dados: { role: e.target.value as Papel } },
                            {
                              onSuccess: () =>
                                notificar({
                                  tipo: 'sucesso',
                                  titulo: `${u.nome} agora é ${ROTULO_PAPEL[e.target.value as Papel]}.`,
                                }),
                            },
                          )
                        }
                        className="text-apoio h-8 min-w-36"
                      >
                        {PAPEIS.map((p) => (
                          <option key={p} value={p}>
                            {ROTULO_PAPEL[p]}
                          </option>
                        ))}
                      </Selecao>
                    </Td>
                    <Td className="preco text-apoio">{formatarData(u.criadoEm)}</Td>
                    <Td>
                      {u.ativo ? (
                        <Badge variante="verde">Ativo</Badge>
                      ) : (
                        <Badge variante="alerta">Inativo</Badge>
                      )}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={souEu || alterar.isPending}
                        onClick={() => alterar.mutate({ id: u.id, dados: { ativo: !u.ativo } })}
                        className="text-apoio text-acao disabled:text-suave mr-3 font-medium hover:underline disabled:no-underline"
                      >
                        {u.ativo ? 'Desativar' : 'Reativar'}
                      </button>
                      <button
                        type="button"
                        disabled={souEu}
                        onClick={() => setRemovendo(u)}
                        className="text-apoio text-alerta disabled:text-suave font-medium hover:underline disabled:no-underline"
                      >
                        Remover
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Tabela>
          <Paginacao
            pagina={page}
            totalPaginas={usuarios.data.meta.totalPages}
            aoMudar={(p) => atualizar({ page: p > 1 ? String(p) : undefined }, true)}
          />
        </>
      )}

      <DialogRaiz open={!!removendo} onOpenChange={(aberto) => !aberto && setRemovendo(null)}>
        {removendo && (
          <ModalConteudo
            titulo={`Remover ${removendo.nome}?`}
            descricao="A conta deixa de existir para login. Pedidos antigos continuam no histórico."
            rodape={
              <>
                <Botao variante="secundario" onClick={() => setRemovendo(null)}>
                  Manter
                </Botao>
                <Botao
                  variante="perigo"
                  carregando={remover.isPending}
                  onClick={() =>
                    remover.mutate(removendo.id, { onSuccess: () => setRemovendo(null) })
                  }
                >
                  Remover
                </Botao>
              </>
            }
          >
            <p className="text-corpo text-suave">{removendo.email}</p>
          </ModalConteudo>
        )}
      </DialogRaiz>
    </div>
  );
}
