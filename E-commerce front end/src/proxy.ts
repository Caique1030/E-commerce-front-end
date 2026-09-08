import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proteção de rota em duas camadas. Esta é a primeira: sem o marcador de sessão, rotas
 * privadas redirecionam para /entrar antes de renderizar. A segunda é o layout de /admin,
 * que confere o papel.
 *
 * Isto é conveniência de UX, não segurança. A autorização real é do back-end: qualquer
 * requisição sem token válido (ou com papel errado) é recusada lá, independentemente do
 * que o front esconde ou mostra.
 */
const COOKIE_MARCADOR = 'balcao_logado';

export function proxy(request: NextRequest): NextResponse {
  if (request.cookies.has(COOKIE_MARCADOR)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const destino = request.nextUrl.clone();
  destino.pathname = '/entrar';
  destino.search = '';
  destino.searchParams.set('voltar', `${pathname}${search}`);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: [
    '/carrinho/:path*',
    '/checkout/:path*',
    '/pedido/:path*',
    '/meus-pedidos/:path*',
    '/conta/:path*',
    '/admin/:path*',
  ],
};
