'use client';

import { CalendarDays, ChevronDown, Menu, Package, Tag, Truck } from 'lucide-react';
import { Suspense } from 'react';
import { Drawer } from '@/components/ui/Dialog';
import { Logo } from '@/components/ui/Logo';
import { FRETE_GRATIS_MINIMO_CENTAVOS } from '@/lib/comercial';
import { centavosParaBRL } from '@/lib/formatadores';
import { useSessao } from '@/providers/sessao-provider';
import { useUiStore } from '@/stores/ui-store';
import { AccountMenu } from '../AccountMenu/AccountMenu';
import { CartButton } from '../CartButton/CartButton';
import { CategoryTree } from '../CategoryTree/CategoryTree';
import { SearchBar } from '../SearchBar/SearchBar';
import * as S from './style';

function SearchFallback() {
  return <S.SearchFallback aria-hidden />;
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
export function StoreHeader() {
  const menuAberto = useUiStore((s) => s.menuMobileAberto);
  const definirMenu = useUiStore((s) => s.definirMenuMobile);
  const { status, usuario, ehEquipe } = useSessao();

  return (
    <S.Root>
      <S.Content>
        <S.TopRow>
          <S.MenuButton type="button" onClick={() => definirMenu(true)} aria-label="Abrir menu">
            <Menu size={20} aria-hidden />
          </S.MenuButton>

          <Logo className="shrink-0" />

          <S.DesktopSearch>
            <Suspense fallback={<SearchFallback />}>
              <SearchBar />
            </Suspense>
          </S.DesktopSearch>

          <S.Actions>
            <AccountMenu />
            <CartButton />
          </S.Actions>
        </S.TopRow>

        <S.MobileSearch>
          <Suspense fallback={<SearchFallback />}>
            <SearchBar />
          </Suspense>
        </S.MobileSearch>

        {/* Faixa de atalhos: some no celular, onde o menu lateral já leva aos mesmos lugares. */}
        <S.Shortcuts aria-label="Atalhos da loja">
          <S.CategoriesButton type="button" onClick={() => definirMenu(true)}>
            Categorias
            <ChevronDown size={14} aria-hidden />
          </S.CategoriesButton>
          {atalhos.map(({ href, rotulo, icone: Icone }) => (
            <S.ShortcutLink key={href} href={href}>
              <Icone size={14} aria-hidden />
              {rotulo}
            </S.ShortcutLink>
          ))}
          <S.Shipping>
            <Truck size={16} aria-hidden />
            Frete grátis a partir de{' '}
            <S.ShippingAmount>{centavosParaBRL(FRETE_GRATIS_MINIMO_CENTAVOS)}</S.ShippingAmount>
          </S.Shipping>
        </S.Shortcuts>
      </S.Content>

      <Drawer
        open={menuAberto}
        onOpenChange={definirMenu}
        title="Menu"
        description="Categorias da loja e acesso à conta"
        side="left"
        className="max-w-xs"
      >
        <S.DrawerBody>
          <S.AccountCard>
            {status === 'autenticado' && usuario ? (
              <>
                <S.UserName>{usuario.nome}</S.UserName>
                <S.UserEmail>{usuario.email}</S.UserEmail>
                <S.AccountLinks $spaced>
                  {!ehEquipe && (
                    <S.AccountLink href="/meus-pedidos" onClick={() => definirMenu(false)}>
                      Meus pedidos
                    </S.AccountLink>
                  )}
                  <S.AccountLink href="/conta" onClick={() => definirMenu(false)}>
                    Minha conta
                  </S.AccountLink>
                  {ehEquipe && (
                    <S.AccountLink href="/admin" onClick={() => definirMenu(false)}>
                      Área administrativa
                    </S.AccountLink>
                  )}
                </S.AccountLinks>
              </>
            ) : (
              <S.AccountLinks $spaced={false}>
                <S.AccountLink href="/entrar" onClick={() => definirMenu(false)} $strong>
                  Entrar
                </S.AccountLink>
                <S.AccountLink href="/criar-conta" onClick={() => definirMenu(false)}>
                  Criar conta
                </S.AccountLink>
              </S.AccountLinks>
            )}
          </S.AccountCard>

          <div>
            <S.SectionTitle>Atalhos</S.SectionTitle>
            <S.ShortcutList>
              {atalhos.map(({ href, rotulo, icone: Icone }) => (
                <li key={href}>
                  <S.DrawerShortcutLink href={href} onClick={() => definirMenu(false)}>
                    <S.MutedIcon>
                      <Icone size={16} aria-hidden />
                    </S.MutedIcon>
                    {rotulo}
                  </S.DrawerShortcutLink>
                </li>
              ))}
            </S.ShortcutList>
          </div>

          <div>
            <S.SectionTitle>Categorias</S.SectionTitle>
            <CategoryTree onNavigate={() => definirMenu(false)} />
          </div>
        </S.DrawerBody>
      </Drawer>
    </S.Root>
  );
}
