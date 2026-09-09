/**
 * Guarda do access token no navegador. Vive só em memória: some ao recarregar a página e é
 * recuperado em silêncio pelo BFF (/api/auth/refresh), que lê o cookie httpOnly.
 * O JavaScript da página nunca enxerga o refresh token.
 */

type Renovador = () => Promise<string | null>;

let accessToken: string | null = null;
let expiraEmMs = 0;
let renovador: Renovador | null = null;
let renovacaoEmAndamento: Promise<string | null> | null = null;

const MARGEM_MS = 30_000;

export function definirToken(token: string | null, expiresInSegundos?: number): void {
  accessToken = token;
  expiraEmMs = token && expiresInSegundos ? Date.now() + expiresInSegundos * 1000 : 0;
}

export function obterTokenAtual(): string | null {
  return accessToken;
}

export function tokenExpiraEmBreve(margemMs = MARGEM_MS): boolean {
  return !accessToken || expiraEmMs - Date.now() < margemMs;
}

/** O provider de sessão registra aqui como renovar; o cliente HTTP só chama. */
export function registrarRenovador(fn: Renovador | null): void {
  renovador = fn;
}

/** Uma renovação por vez: várias requisições com 401 simultâneas dividem a mesma promessa. */
export function renovarToken(): Promise<string | null> {
  if (!renovador) return Promise.resolve(null);
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = renovador().finally(() => {
      renovacaoEmAndamento = null;
    });
  }
  return renovacaoEmAndamento;
}

/** Token pronto para uso; renova antes de expirar para evitar um 401 previsível. */
export async function obterTokenValido(): Promise<string | null> {
  if (accessToken && !tokenExpiraEmBreve()) return accessToken;
  if (!accessToken && !renovador) return null;
  return renovarToken();
}
