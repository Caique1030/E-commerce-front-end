import 'server-only';
import { cookies } from 'next/headers';
import '@/lib/schemas/locale'; // mensagens do Zod em português também no servidor
import type { RespostaAuthBack, SessaoPublica } from '@/lib/tipos';
import { COOKIE_MARCADOR, COOKIE_SESSAO } from './cookies';

/**
 * BFF de autenticação. O back devolve accessToken + refreshToken; guardar os dois no
 * localStorage é vulnerável a XSS. Aqui o refresh token vira um cookie httpOnly restrito a
 * /api/auth, e o navegador só recebe o access token (curto, em memória) e os dados públicos.
 *
 * Trade-off: uma camada a mais de indireção em troca de nunca expor o refresh token ao JS.
 */

export { COOKIE_MARCADOR, COOKIE_SESSAO };
const SETE_DIAS = 60 * 60 * 24 * 7;

const seguro = process.env.NODE_ENV === 'production';

export function urlApiServidor(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('API_URL não definida');
  return url.replace(/\/+$/, '');
}

export async function chamarBack(caminho: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${urlApiServidor()}${caminho}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
    cache: 'no-store',
  });
}

export async function lerRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_SESSAO)?.value ?? null;
}

export async function gravarSessao(refreshToken: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_SESSAO, refreshToken, {
    httpOnly: true,
    secure: seguro,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: SETE_DIAS,
  });
  // Marcador legível pelo proxy (redirecionar rotas privadas) e pelo cliente (tentar renovar).
  store.set(COOKIE_MARCADOR, '1', {
    httpOnly: false,
    secure: seguro,
    sameSite: 'lax',
    path: '/',
    maxAge: SETE_DIAS,
  });
}

export async function limparSessao(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_SESSAO, '', {
    httpOnly: true,
    secure: seguro,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0,
  });
  store.set(COOKIE_MARCADOR, '', {
    httpOnly: false,
    secure: seguro,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/** Grava o cookie e devolve só o que o navegador pode ver. */
export async function responderComSessao(dados: RespostaAuthBack): Promise<Response> {
  await gravarSessao(dados.refreshToken);
  const publico: SessaoPublica = {
    usuario: dados.user,
    accessToken: dados.accessToken,
    expiresIn: dados.expiresIn,
  };
  return Response.json(publico);
}

/** Repassa o envelope de erro do back sem alterar (mesmo status, mesmo código). */
export async function repassarErro(res: Response): Promise<Response> {
  const corpo: unknown = await res.json().catch(() => ({
    statusCode: res.status,
    error: 'ERRO_DESCONHECIDO',
    message: 'Não foi possível completar a operação',
  }));
  return Response.json(corpo, { status: res.status });
}

export function erroBff(status: number, error: string, message: string): Response {
  return Response.json({ statusCode: status, error, message }, { status });
}

/**
 * Route handlers não têm a proteção de origem que o Next aplica a Server Actions, e
 * `Request.json()` aceita o corpo independentemente do Content-Type. Sem esta checagem, um
 * formulário em outro site pode postar em /api/auth/entrar e logar a vítima na conta do
 * atacante (o Set-Cookie da resposta é gravado numa navegação top-level, mesmo com SameSite=Lax).
 */
export function mesmaOrigem(req: Request): boolean {
  // Estas rotas só são chamadas pelo próprio front (fetch com credentials: 'same-origin'),
  // então o valor legítimo é sempre 'same-origin'. Um POST de formulário externo traz
  // 'cross-site'. O Origin é a reserva para clientes sem Sec-Fetch-Site.
  const site = req.headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  const origin = req.headers.get('origin');
  if (origin) return origin === new URL(req.url).origin;
  return false;
}

export function erroOrigem(): Response {
  return erroBff(403, 'ORIGEM_INVALIDA', 'Requisição bloqueada por origem inválida');
}

/**
 * Renovações concorrentes com o MESMO refresh token (duas abas, dois componentes) devem
 * dividir uma única chamada ao back: a segunda tentativa de uso de um token rotacionado
 * é tratada como roubo e revoga a família inteira.
 */
const renovacoes = new Map<string, Promise<{ status: number; corpo: unknown }>>();

export function renovarNoBack(refreshToken: string): Promise<{ status: number; corpo: unknown }> {
  const existente = renovacoes.get(refreshToken);
  if (existente) return existente;

  const promessa = chamarBack('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => ({ status: res.status, corpo: await res.json().catch(() => ({})) }))
    .finally(() => {
      // Mantém o resultado por alguns segundos para absorver a corrida entre abas.
      setTimeout(() => renovacoes.delete(refreshToken), 5_000);
    });

  renovacoes.set(refreshToken, promessa);
  return promessa;
}
