import type { ErroApi } from '@/lib/tipos';
import { obterTokenAtual, obterTokenValido, renovarToken } from './auth-token';

/**
 * Erro de API com código estável em SCREAMING_SNAKE. A interface trata pelo `codigo`,
 * nunca parseando a mensagem. `status` 0 significa falha de rede (sem resposta).
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    message: string,
    public readonly detalhes?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get ehRede(): boolean {
    return this.status === 0;
  }

  get ehClienteError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

export type ValorQuery = string | number | boolean | null | undefined;

export interface OpcoesApi extends Omit<RequestInit, 'body'> {
  /** Corpo serializado como JSON. */
  body?: unknown;
  /** Query string; valores vazios/undefined são omitidos. */
  query?: Record<string, ValorQuery>;
  /** Envia o Bearer token quando houver (padrão: true). */
  auth?: boolean;
  /**
   * Segundos de cache de dados do Next. Vale só no servidor e só para conteúdo público:
   * no navegador quem controla a frescura é o TanStack Query, e requisição autenticada
   * nunca passa por aqui (o servidor não manda Bearer). Sem isto, todo render de página
   * pública refaz a chamada à API.
   */
  revalidar?: number;
  /** Interno: evita laço de renovação. */
  _tentouRenovar?: boolean;
}

const ehServidor = typeof window === 'undefined';

/** No servidor Next usa API_URL (rede interna); no navegador usa a pública. */
export function urlBaseApi(): string {
  const url = ehServidor
    ? (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL não definida. Copie .env.local.example para .env.local.');
  }
  return url.replace(/\/+$/, '');
}

export function montarQuery(query?: Record<string, ValorQuery>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(query)) {
    if (valor === undefined || valor === null || valor === '') continue;
    params.set(chave, String(valor));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function api<T>(caminho: string, opcoes: OpcoesApi = {}): Promise<T> {
  const { body, query, auth = true, revalidar, _tentouRenovar, headers, ...init } = opcoes;

  const cabecalhos = new Headers(headers);
  if (body !== undefined && !cabecalhos.has('Content-Type')) {
    cabecalhos.set('Content-Type', 'application/json');
  }
  cabecalhos.set('Accept', 'application/json');

  let tokenUsado: string | null = null;
  if (auth && !ehServidor) {
    tokenUsado = _tentouRenovar ? obterTokenAtual() : await obterTokenValido();
    if (tokenUsado) cabecalhos.set('Authorization', `Bearer ${tokenUsado}`);
  }

  // Só o servidor pode participar do cache de dados do Next; no navegador tudo é no-store e a
  // frescura fica com o TanStack Query.
  const politicaCache: RequestInit =
    ehServidor && revalidar !== undefined
      ? { next: { revalidate: revalidar } }
      : { cache: 'no-store' };

  let res: Response;
  try {
    res = await fetch(`${urlBaseApi()}${caminho}${montarQuery(query)}`, {
      ...init,
      ...politicaCache,
      headers: cabecalhos,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'REDE', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (res.status === 204) return undefined as T;

  const corpo = (await res.json().catch(() => ({}))) as Partial<ErroApi> & Record<string, unknown>;

  // Access token vencido no meio do caminho: renova uma vez e repete a mesma chamada.
  if (res.status === 401 && tokenUsado && !_tentouRenovar && !ehServidor) {
    const novo = await renovarToken();
    if (novo) return api<T>(caminho, { ...opcoes, _tentouRenovar: true });
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof corpo.error === 'string' ? corpo.error : 'ERRO_DESCONHECIDO',
      typeof corpo.message === 'string' ? corpo.message : 'Não foi possível completar a operação',
      corpo.details,
    );
  }
  return corpo as T;
}

/** Mensagem legível para qualquer erro, com fallback neutro (sem "ops", sem exclamação). */
export function mensagemDeErro(
  erro: unknown,
  padrao = 'Não foi possível completar a operação',
): string {
  if (erro instanceof ApiError) return erro.message || padrao;
  if (erro instanceof Error && erro.message) return erro.message;
  return padrao;
}

export function ehApiError(erro: unknown, codigo?: string): erro is ApiError {
  return erro instanceof ApiError && (codigo === undefined || erro.codigo === codigo);
}
