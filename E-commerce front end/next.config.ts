import type { NextConfig } from 'next';

const CDN_IMAGENS = 'https://cdn.dummyjson.com';

/** Origem da API para o connect-src: o navegador fala com ela direto (Bearer). */
function origemApi(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/**
 * CSP sem nonce de propósito: gerar um nonce por requisição exigiria ler algo do request no
 * layout raiz e tiraria o site inteiro do render estático. Sem nonce o Next precisa de
 * 'unsafe-inline' nos scripts de bootstrap, então esta política não é uma barreira contra XSS —
 * ela fecha o resto: nada de script/estilo/imagem de terceiros, nada de <base> injetada,
 * nada de formulário postando para fora e nada de enquadrar o site.
 */
function csp(): string {
  const api = origemApi();
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${CDN_IMAGENS}`,
    "font-src 'self' data:",
    `connect-src 'self'${api ? ` ${api}` : ''}`,
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ');
}

const nextConfig: NextConfig = {
  images: {
    // Único CDN de imagens do catálogo (seed da DummyJSON). Qualquer outro host é bloqueado.
    remotePatterns: [new URL(`${CDN_IMAGENS}/**`)],
  },
  // Cabeçalhos de segurança do front. A API tem o helmet dela; aqui cobrimos o que o Next serve.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp() },
          // Só faz sentido sobre HTTPS; em dev o navegador ignoraria, mas nem enviamos.
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
