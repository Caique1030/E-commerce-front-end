'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { DialogRaiz, DrawerConteudo } from '@/components/ui/dialog';
import { Logo } from '@/components/ui/logo';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import { ArvoreCategorias } from './arvore-categorias';
import { BotaoCarrinho } from './botao-carrinho';
import { Busca } from './busca';
import { MenuConta } from './menu-conta';

function BuscaFallback() {
  return (
    <div className="rounded-campo border-borda-forte bg-branco h-10 w-full border" aria-hidden />
  );
}

/**
 * Cabeçalho da loja. Desktop: wordmark, busca, conta, carrinho. Mobile: menu, wordmark,
 * carrinho e a busca numa segunda linha. O menu mobile traz as categorias e a conta.
 */
export function Cabecalho() {
  const menuAberto = useUiStore((s) => s.menuMobileAberto);
  const definirMenu = useUiStore((s) => s.definirMenuMobile);
  const { status, usuario, ehEquipe } = useSessao();

  return (
    <header className="border-borda bg-papel/95 supports-[backdrop-filter]:bg-papel/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <DialogRaiz open={menuAberto} onOpenChange={definirMenu}>
            <button
              type="button"
              onClick={() => definirMenu(true)}
              className="rounded-campo hover:bg-papel-2 flex size-10 items-center justify-center lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <DrawerConteudo
              titulo="Menu"
              descricao="Categorias da loja e acesso à conta"
              lado="esquerda"
              className="max-w-xs"
            >
              <div className="flex flex-col gap-6 px-5 py-4">
                <div className="rounded-card border-borda bg-papel flex flex-col gap-2 border p-3">
                  {status === 'autenticado' && usuario ? (
                    <>
                      <p className="text-corpo font-medium">{usuario.nome}</p>
                      <p className="text-apoio text-suave -mt-1">{usuario.email}</p>
                      <div className="text-corpo mt-1 flex flex-col gap-1">
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
                    <div className="text-corpo flex flex-col gap-1">
                      <Link
                        href="/entrar"
                        onClick={() => definirMenu(false)}
                        className="py-1 font-medium hover:underline"
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
                  <p className="text-apoio text-suave mb-2 font-medium tracking-wide uppercase">
                    Categorias
                  </p>
                  <ArvoreCategorias aoNavegar={() => definirMenu(false)} />
                </div>
              </div>
            </DrawerConteudo>
          </DialogRaiz>

          <Logo />

          <div className="hidden flex-1 md:block md:max-w-xl">
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
      </div>
    </header>
  );
}
