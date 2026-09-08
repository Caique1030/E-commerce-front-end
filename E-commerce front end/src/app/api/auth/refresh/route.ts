import {
  erroBff,
  lerRefreshToken,
  limparSessao,
  renovarNoBack,
  responderComSessao,
} from '@/lib/auth/bff';
import type { RespostaAuthBack } from '@/lib/tipos';

/**
 * Troca o cookie httpOnly por um novo par de tokens (rotação). Se o back recusar, o cookie é
 * apagado: o cliente vira anônimo em vez de ficar num laço de tentativas.
 */
export async function POST(): Promise<Response> {
  const refreshToken = await lerRefreshToken();
  if (!refreshToken) return erroBff(401, 'SEM_SESSAO', 'Nenhuma sessão ativa');

  const { status, corpo } = await renovarNoBack(refreshToken);

  if (status < 200 || status >= 300) {
    await limparSessao();
    const erro = (corpo ?? {}) as { error?: string; message?: string };
    return erroBff(401, erro.error ?? 'REFRESH_INVALIDO', erro.message ?? 'Sessão expirada');
  }

  return responderComSessao(corpo as RespostaAuthBack);
}
