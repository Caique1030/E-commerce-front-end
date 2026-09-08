'use client';

import { CalendarDays, ChevronDown, Menu, Package, Tag, Truck } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { DialogRaiz, DrawerConteudo } from '@/components/ui/dialog';
import { Logo } from '@/components/ui/logo';
import { FRETE_GRATIS_MINIMO_CENTAVOS } from '@/lib/comercial';
import { centavosParaBRL } from '@/lib/formatadores';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import { ArvoreCategorias } from './arvore-categorias';
import { BotaoCarrinho } from './botao-carrinho';
import { Busca } from './busca';
import { MenuConta } from './menu-conta';

function BuscaFallback() {
  return <div className="rounded-campo bg-branco shadow-card h-10 w-full" aria-hidden />;
}

const atalhos = [
  { href: '/?ordenar=preco-asc', rotulo: 'Ofertas', icone: Tag },
  { href: '/categoria/servicos', rotulo: 'Serviços agendados', icone: CalendarDays },
  { href: '/meus-pedidos', rotulo: 'Meus pedidos', icone: Package },
];

/**
 * Cabeçalho da loja, em duas faixas amarelas: a de cima com marca, busca e conta; a de baixo
 * com os atalhos e a promessa de frete. No celular a busca desce para a própria linha e os
 * atalhos viram o menu lateral.
 */
export function Cabecalho() {
  const menuAberto = useUiStore((s) => s.menuMobileAberto);
  const definirMenu = useUiStore((s) => s.definirMenuMobile);
  const { status, usuario, ehEquipe } = useSessao();

  return (
    <header className="bg-amarelo shadow-barra sticky top-0 z-40">
      <DialogRaiz open={menuAberto} onOpenChange={definirMenu}>
        <div className="conteudo flex flex-col gap-2 pt-2.5 pb-2 lg:gap-1 lg:pb-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => definirMenu(true)}
              className="rounded-campo hover:bg-tinta/10 flex size-10 items-center justify-center lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <Logo className="shrink-0" />

            <div className="hidden flex-1 md:block md:max-w-2xl">
              <Suspense fallback={<BuscaFallback />}>
                <Busca />
              </Suspense>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <MenuConta />
              <BotaoCarrinho />
            </div>
          </div>

          <div className="md:hidden">
            <Suspense fallback={<BuscaFallback />}>
              <Busca />
            </Suspense>
          </div>

          {/* Faixa de atalhos: some no celular, onde o menu lateral já leva aos mesmos lugares. */}
          <nav
            aria-label="Atalhos da loja"
            className="text-apoio hidden items-center gap-1 lg:flex"
          >
            <button
              type="button"
              onClick={() => definirMenu(true)}
              className="rounded-campo hover:bg-tinta/10 flex h-9 items-center gap-1.5 px-2 font-semibold"
            >
              Categorias
              <ChevronDown className="size-3.5" aria-hidden />
            </button>
            {atalhos.map(({ href, rotulo, icone: Icone }) => (
              <Link
                key={href}
                href={href}
                className="rounded-campo hover:bg-tinta/10 flex h-9 items-center gap-1.5 px-2"
              >
                <Icone className="size-3.5" aria-hidden />
                {rotulo}
              </Link>
            ))}
            <p className="text-tinta-2 ml-auto flex items-center gap-1.5 pr-1">
              <Truck className="size-4" aria-hidden />
              Frete grátis a partir de{' '}
              <strong className="preco font-semibold">
                {centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS)}
              </strong>
            </p>
          </nav>
        </div>

        <DrawerConteudo
          titulo="Menu"
          descricao="Categorias da loja e acesso à conta"
          lado="esquerda"
          className="max-w-xs"
        >
          <div className="flex flex-col gap-6 px-5 py-4">
            <div className="rounded-card bg-papel-2 flex flex-col gap-2 p-3">
              {status === 'autenticado' && usuario ? (
                <>
                  <p className="text-corpo font-semibold">{usuario.nome}</p>
                  <p className="text-apoio text-suave -mt-1">{usuario.email}</p>
                  <div className="text-corpo text-acao mt-1 flex flex-col gap-1">
                    {!ehEquipe && (
                      <Link
                        href="/meus-pedidos"
                        onClick={() => definirMenu(false)}
                        className="py-1 hover:underline"
                      >
                        Meus pedidos
                      </Link>
                    )}
                    <Link
                      href="/conta"
                      onClick={() => definirMenu(false)}
                      className="py-1 hover:underline"
                    >
                      Minha conta
                    </Link>
                    {ehEquipe && (
                      <Link
                        href="/admin"
                        onClick={() => definirMenu(false)}
                        className="py-1 hover:underline"
                      >
                        Área administrativa
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-corpo text-acao flex flex-col gap-1">
                  <Link
                    href="/entrar"
                    onClick={() => definirMenu(false)}
                    className="py-1 font-semibold hover:underline"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/criar-conta"
                    onClick={() => definirMenu(false)}
                    className="py-1 hover:underline"
                  >
                    Criar conta
                  </Link>
                </div>
              )}
            </div>

            <div>
              <p className="text-apoio text-suave mb-2 font-semibold tracking-wide uppercase">
                Atalhos
              </p>
              <ul className="text-corpo flex flex-col">
                {atalhos.map(({ href, rotulo, icone: Icone }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => definirMenu(false)}
                      className="rounded-campo hover:bg-papel-2 flex min-h-9 items-center gap-2 px-2"
                    >
                      <Icone className="text-suave size-4" aria-hidden />
                      {rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-apoio text-suave mb-2 font-semibold tracking-wide uppercase">
                Categorias
              </p>
              <ArvoreCategorias aoNavegar={() => definirMenu(false)} />
            </div>
          </div>
        </DrawerConteudo>
      </DialogRaiz>
    </header>
  );
}
