import type { Metadata, Viewport } from 'next';
import { Archivo, Fraunces } from 'next/font/google';
import { cookies } from 'next/headers';
import { COOKIE_MARCADOR } from '@/lib/auth/bff';
import { DESCRICAO_LOJA, NOME_LOJA } from '@/lib/constantes';
import { Providers } from '@/providers/providers';
import './globals.css';

/* Archivo em toda a interface; Fraunces só no wordmark e nos títulos de seção da home. */
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-archivo',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

export const metadata: Metadata = {
  title: { default: NOME_LOJA, template: `%s · ${NOME_LOJA}` },
  description: DESCRICAO_LOJA,
  applicationName: NOME_LOJA,
};

export const viewport: Viewport = {
  themeColor: '#FBFAF8',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // O marcador não autentica nada; só diz ao cliente se vale a pena renovar a sessão.
  const temSessaoInicial = (await cookies()).has(COOKIE_MARCADOR);

  return (
    <html lang="pt-BR" className={`${archivo.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers temSessaoInicial={temSessaoInicial}>{children}</Providers>
      </body>
    </html>
  );
}
