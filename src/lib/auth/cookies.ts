/**
 * Nomes dos cookies de sessão. Sem 'server-only' de propósito: o proxy e o provider de sessão
 * no navegador também precisam do marcador.
 */
export const COOKIE_SESSAO = 'balcao_sessao';
export const COOKIE_MARCADOR = 'balcao_logado';

/**
 * O marcador não autentica nada (é legível e forjável); só diz se vale a pena tentar renovar
 * a sessão, evitando um 401 gratuito em cada visita anônima.
 */
export function temMarcadorSessao(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some((c) => c.startsWith(`${COOKIE_MARCADOR}=`) && c.length > COOKIE_MARCADOR.length + 1);
}
