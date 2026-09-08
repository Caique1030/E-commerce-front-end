import type { Metadata, Viewport } from 'next';
import { Archivo, Fraunces } from 'next/font/google';
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

/**
 * Layout raiz sem nenhuma API dinâmica: ler cookie aqui tirava o site inteiro do render
 * estático (toda rota virava `ƒ`). Quem decide se há sessão é o provider, no navegador.
 *
 * `data-scroll-behavior="smooth"` é exigido pelo Next 16 para que o `scroll-behavior: smooth`
 * do CSS não seja aplicado às trocas de rota — sem ele, cada paginação vira uma animação.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${fraunces.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
