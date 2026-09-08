import type { Metadata, Viewport } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { DESCRICAO_LOJA, NOME_LOJA } from '@/lib/constantes';
import { Providers } from '@/providers/providers';
import './globals.css';

/*
 * Uma família só, do wordmark ao rótulo de 11px. Nunito Sans é humanista e levemente
 * arredondada — a mesma temperatura das lojas brasileiras que o cliente já conhece — e tem
 * peso 200 a 900, o que sustenta preço leve e título pesado sem trocar de fonte.
 */
const nunito = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: NOME_LOJA, template: `%s · ${NOME_LOJA}` },
  description: DESCRICAO_LOJA,
  applicationName: NOME_LOJA,
};

export const viewport: Viewport = {
  themeColor: '#FFF159',
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
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${nunito.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
