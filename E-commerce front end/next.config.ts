import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Único CDN de imagens do catálogo (seed da DummyJSON). Qualquer outro host é bloqueado.
    remotePatterns: [new URL('https://cdn.dummyjson.com/**')],
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
        ],
      },
    ];
  },
};

export default nextConfig;
