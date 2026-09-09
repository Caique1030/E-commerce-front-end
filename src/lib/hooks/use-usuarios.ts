'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mensagemDeErro } from '@/lib/api/cliente';
import { usuariosApi } from '@/lib/api/usuarios';
import { qk } from '@/lib/query-keys';
import type { AtualizarPerfil, AtualizarUsuario } from '@/lib/schemas/usuario';
import type { FiltrosUsuario } from '@/lib/tipos';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';

export function useUsuarios(filtros: FiltrosUsuario) {
  const { status, ehAdmin } = useSessao();
  return useQuery({
    queryKey: qk.usuarios.lista(filtros),
    queryFn: () => usuariosApi.listar(filtros),
    enabled: status === 'autenticado' && ehAdmin,
    placeholderData: keepPreviousData,
  });
}

export function useAtualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: AtualizarUsuario }) =>
      usuariosApi.atualizar(id, dados),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.usuarios.todos }),
    onError: (erro) =>
      notificar({
        tipo: 'erro',
        titulo: 'O usuário não foi alterado.',
        descricao: mensagemDeErro(erro),
      }),
  });
}

export function useRemoverUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.remover(id),
    onSuccess: () => {
      notificar({ tipo: 'sucesso', titulo: 'Usuário removido.' });
      void qc.invalidateQueries({ queryKey: qk.usuarios.todos });
    },
    onError: (erro) =>
      notificar({
        tipo: 'erro',
        titulo: 'O usuário não foi removido.',
        descricao: mensagemDeErro(erro),
      }),
  });
}

/** Atualiza o próprio perfil e reflete na sessão (o cabeçalho mostra o nome novo na hora). */
export function useAtualizarPerfil() {
  const { atualizarUsuario } = useSessao();
  return useMutation({
    mutationFn: (dados: AtualizarPerfil) => usuariosApi.atualizarPerfil(dados),
    onSuccess: (usuario) => atualizarUsuario(usuario),
  });
}
