'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/estados/ErrorState';
import { TableSkeleton } from '@/components/estados/Skeletons';
import { EmptyState } from '@/components/estados/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, NativeSelect } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Dialog';
import { Pagination } from '@/components/ui/Pagination';
import { Table, Td, Th } from '@/components/ui/Table';
import { LIMITE_TABELA, ROTULO_PAPEL } from '@/lib/constantes';
import { formatarData, pluralizar } from '@/lib/formatadores';
import { useChamadaComAtraso } from '@/lib/hooks/use-debounce';
import { useAtualizarUsuario, useRemoverUsuario, useUsuarios } from '@/lib/hooks/use-usuarios';
import type { Papel, Usuario } from '@/lib/tipos';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';
import { VisuallyHidden } from '@/styles/primitives';
import * as S from './style';

const PAPEIS: Papel[] = ['CLIENTE', 'COMERCIAL', 'ADMIN'];

export function UsersTable() {
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
    <S.Root>
      <S.FilterBar>
        <S.SearchBox>
          <S.SearchLabel htmlFor="busca-usuarios">Buscar usuários</S.SearchLabel>
          <S.SearchIcon aria-hidden>
            <Search size={16} />
          </S.SearchIcon>
          <S.SearchInput
            id="busca-usuarios"
            type="search"
            value={textoBusca}
            onChange={(e) => {
              setTextoBusca(e.target.value);
              buscarComAtraso(e.target.value);
            }}
            placeholder="Nome ou e-mail"
          />
        </S.SearchBox>
        <S.FilterLabel>
          <S.FilterCaption>Papel</S.FilterCaption>
          <NativeSelect
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
          </NativeSelect>
        </S.FilterLabel>
        <Checkbox
          label="Incluir inativos"
          checked={inativos}
          onChange={(e) => atualizar({ inativos: e.target.checked ? '1' : undefined })}
          className="pb-2"
        />
      </S.FilterBar>

      {usuarios.isPending ? (
        <TableSkeleton columns={5} />
      ) : usuarios.isError ? (
        <ErrorState
          error={usuarios.error}
          title="Não foi possível carregar os usuários."
          onRetry={() => void usuarios.refetch()}
          retrying={usuarios.isFetching}
        />
      ) : usuarios.data.data.length === 0 ? (
        <EmptyState
          title="Nenhum usuário com esses filtros."
          compact
          action={
            <Button variant="secondary" onClick={() => router.replace('/admin/usuarios')}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <>
          <S.Count aria-live="polite">
            {pluralizar(usuarios.data.meta.total, 'usuário', 'usuários')}
          </S.Count>
          <Table className={usuarios.isPlaceholderData ? 'opacity-60' : undefined}>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Papel</Th>
                <Th>Desde</Th>
                <Th>Situação</Th>
                <Th>
                  <VisuallyHidden>Ações</VisuallyHidden>
                </Th>
              </tr>
            </thead>
            <tbody>
              {usuarios.data.data.map((u) => {
                const souEu = u.id === eu?.id;
                return (
                  <S.Row key={u.id} $inactive={!u.ativo}>
                    <Td>
                      <S.Name>{u.nome}</S.Name>
                      {souEu && <S.Me>(você)</S.Me>}
                    </Td>
                    <Td>
                      <S.Email>{u.email}</S.Email>
                    </Td>
                    <Td>
                      <S.HiddenLabel htmlFor={`papel-${u.id}`}>Papel de {u.nome}</S.HiddenLabel>
                      <NativeSelect
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
                      </NativeSelect>
                    </Td>
                    <Td className="preco">
                      <S.CreatedAt>{formatarData(u.criadoEm)}</S.CreatedAt>
                    </Td>
                    <Td>
                      {u.ativo ? (
                        <Badge variant="green">Ativo</Badge>
                      ) : (
                        <Badge variant="danger">Inativo</Badge>
                      )}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <S.ToggleButton
                        type="button"
                        disabled={souEu || alterar.isPending}
                        onClick={() => alterar.mutate({ id: u.id, dados: { ativo: !u.ativo } })}
                      >
                        {u.ativo ? 'Desativar' : 'Reativar'}
                      </S.ToggleButton>
                      <S.RemoveButton
                        type="button"
                        disabled={souEu}
                        onClick={() => setRemovendo(u)}
                      >
                        Remover
                      </S.RemoveButton>
                    </Td>
                  </S.Row>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            page={page}
            totalPages={usuarios.data.meta.totalPages}
            onChange={(p) => atualizar({ page: p > 1 ? String(p) : undefined }, true)}
          />
        </>
      )}

      {removendo && (
        <Modal
          open
          onOpenChange={(aberto) => !aberto && setRemovendo(null)}
          title={`Remover ${removendo.nome}?`}
          description="A conta deixa de existir para login. Pedidos antigos continuam no histórico."
          footer={
            <>
              <Button variant="secondary" onClick={() => setRemovendo(null)}>
                Manter
              </Button>
              <Button
                variant="danger"
                loading={remover.isPending}
                onClick={() =>
                  remover.mutate(removendo.id, { onSuccess: () => setRemovendo(null) })
                }
              >
                Remover
              </Button>
            </>
          }
        >
          <S.ModalText>{removendo.email}</S.ModalText>
        </Modal>
      )}
    </S.Root>
  );
}
