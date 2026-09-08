import type { DadosCadastro, DadosLogin } from '@/lib/schemas/auth';
import type { ErroApi, SessaoPublica } from '@/lib/tipos';
import { ApiError } from './cliente';

/**
 * Chamadas ao BFF (route handlers do próprio Next em /api/auth/*).
 * Aqui não vai Bearer: a sessão é o cookie httpOnly que só o BFF lê.
 */
async function bff<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/auth/${caminho}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'REDE', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }
  if (res.status === 204) return undefined as T;
  const corpo = (await res.json().catch(() => ({}))) as Partial<ErroApi>;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      corpo.error ?? 'ERRO_DESCONHECIDO',
      corpo.message ?? 'Não foi possível completar a operação',
      corpo.details,
    );
  }
  return corpo as T;
}

const CHAVE_LOCK = 'balcao-sessao';

/** Abas concorrentes não podem renovar ao mesmo tempo: o refresh token é de uso único. */
async function comLockEntreAbas<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(CHAVE_LOCK, fn);
  }
  return fn();
}

export const sessaoApi = {
  entrar: (dados: DadosLogin) =>
    bff<SessaoPublica>('entrar', { method: 'POST', body: JSON.stringify(dados) }),

  criarConta: (dados: DadosCadastro) =>
    bff<SessaoPublica>('criar-conta', { method: 'POST', body: JSON.stringify(dados) }),

  renovar: () => comLockEntreAbas(() => bff<SessaoPublica>('refresh', { method: 'POST' })),

  sair: (accessToken: string | null) =>
    bff<void>('sair', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),
};
