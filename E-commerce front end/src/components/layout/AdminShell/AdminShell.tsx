'use client';

import { ExternalLink, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { SessionGuard } from '@/components/layout/SessionGuard';
import { Logo } from '@/components/ui/Logo';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROTULO_PAPEL } from '@/lib/constantes';
import { useSessao } from '@/providers/sessao-provider';
import * as S from './style';

const LINKS = [
  { href: '/admin', label: 'Resumo', exact: true },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/categorias', label: 'Categorias' },
  { href: '/admin/usuarios', label: 'Usuários', adminOnly: true },
];

/** Inclui a faixa do cabeçalho para a barra em tinta não aparecer só depois da checagem. */
function AdminShellSkeleton() {
  return (
    <>
      <S.SkeletonBar aria-hidden />
      <S.SkeletonBody aria-busy>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </S.SkeletonBody>
    </>
  );
}

/**
 * Chrome visualmente distinto da loja: cabeçalho em tinta, densidade maior, sem a serifa.
 * Quem entra aqui precisa saber num relance que está numa ferramenta interna.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, ehAdmin, sair } = useSessao();

  return (
    <S.Root>
      {/*
        Cabeçalho dentro do guarda: fora dele, um CLIENTE que abrisse /admin via URL veria a
        barra da ferramenta interna, a navegação e o botão "Sair" por cima do "sem permissão".
        Também garante que "Sair" só exista com a sessão já resolvida (com access token em mãos).
      */}
      <SessionGuard require="equipe" fallback={<AdminShellSkeleton />}>
        <S.Header>
          <S.HeaderContent>
            <Logo light suffix="Admin" href="/admin" />
            <S.Nav aria-label="Administração">
              {LINKS.filter((l) => !l.adminOnly || ehAdmin).map((l) => {
                const ativo = l.exact ? pathname === l.href : pathname.startsWith(l.href);
                return (
                  <S.NavLink
                    key={l.href}
                    href={l.href}
                    aria-current={ativo ? 'page' : undefined}
                    $active={ativo}
                  >
                    {l.label}
                  </S.NavLink>
                );
              })}
            </S.Nav>
            <S.Actions>
              <S.StoreLink href="/">
                <ExternalLink size={14} aria-hidden />
                Ver loja
              </S.StoreLink>
              {usuario && (
                <S.UserName title={usuario.email}>
                  {usuario.nome.split(' ')[0]} · {ROTULO_PAPEL[usuario.role]}
                </S.UserName>
              )}
              <S.SignOutButton
                type="button"
                onClick={() => void sair().then(() => router.push('/'))}
              >
                <LogOut size={14} aria-hidden />
                Sair
              </S.SignOutButton>
            </S.Actions>
          </S.HeaderContent>
        </S.Header>

        <S.Main>{children}</S.Main>
      </SessionGuard>
    </S.Root>
  );
}
