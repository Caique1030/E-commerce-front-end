import type { AtualizarPerfil, AtualizarUsuario } from '@/lib/schemas/usuario';
import type { FiltrosUsuario, Paginado, Usuario } from '@/lib/tipos';
import { api } from './cliente';

export const usuariosApi = {
  perfil: () => api<Usuario>('/auth/me'),

  atualizarPerfil: (dados: AtualizarPerfil) =>
    api<Usuario>('/usuarios/me', { method: 'PATCH', body: dados }),

  listar: (filtros: FiltrosUsuario) =>
    api<Paginado<Usuario>>('/usuarios', {
      query: { ...filtros, incluirInativos: filtros.incluirInativos ? 'true' : undefined },
    }),

  atualizar: (id: string, dados: AtualizarUsuario) =>
    api<Usuario>(`/usuarios/${id}`, { method: 'PATCH', body: dados }),

  remover: (id: string) => api<void>(`/usuarios/${id}`, { method: 'DELETE' }),
};
