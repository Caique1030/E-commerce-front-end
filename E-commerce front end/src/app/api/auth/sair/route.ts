import { chamarBack, erroOrigem, lerRefreshToken, limparSessao, mesmaOrigem } from '@/lib/auth/bff';

/**
 * Revoga o refresh token no back (melhor esforço) e apaga os cookies. Sair nunca falha para
 * o usuário: se a API estiver fora, a sessão local some do mesmo jeito.
 *
 * A revogação depende só do refresh token que o BFF já tem em mãos. Condicioná-la ao header
 * Authorization deixaria a sessão viva no back sempre que o access token ainda não estivesse em
 * memória (logo após um reload) ou já tivesse vencido — o cookie sumia daqui e o token seguia
 * válido lá. O Authorization vai junto quando existe, porque ajuda o back a auditar quem saiu.
 */
export async function POST(req: Request): Promise<Response> {
  if (!mesmaOrigem(req)) return erroOrigem();

  const refreshToken = await lerRefreshToken();
  const authorization = req.headers.get('authorization');

  if (refreshToken) {
    await chamarBack('/auth/logout', {
      method: 'POST',
      headers: authorization ? { Authorization: authorization } : undefined,
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  await limparSessao();
  return new Response(null, { status: 204 });
}
