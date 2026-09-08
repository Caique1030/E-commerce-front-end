import { chamarBack, lerRefreshToken, limparSessao } from '@/lib/auth/bff';

/**
 * Revoga o refresh token no back (melhor esforço) e apaga os cookies. Sair nunca falha para
 * o usuário: se a API estiver fora, a sessão local some do mesmo jeito.
 */
export async function POST(req: Request): Promise<Response> {
  const refreshToken = await lerRefreshToken();
  const authorization = req.headers.get('authorization');

  if (refreshToken && authorization) {
    await chamarBack('/auth/logout', {
      method: 'POST',
      headers: { Authorization: authorization },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  await limparSessao();
  return new Response(null, { status: 204 });
}
