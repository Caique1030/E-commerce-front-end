'use client';

import { ExternalLink, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { GuardaSessao } from '@/components/layout/guardas';
import { Esqueleto } from '@/components/ui/esqueleto';
import { Logo } from '@/components/ui/logo';
import { ROTULO_PAPEL } from '@/lib/constantes';
import { cn } from '@/lib/utils';
import { useSessao } from '@/providers/sessao-provider';

const LINKS = [
  { href: '/admin', rotulo: 'Resumo', exato: true },
  { href: '/admin/produtos', rotulo: 'Produtos' },
  { href: '/admin/pedidos', rotulo: 'Pedidos' },
  { href: '/admin/categorias', rotulo: 'Categorias' },
  { href: '/admin/usuarios', rotulo: 'Usuários', soAdmin: true },
];

/** Inclui a faixa do cabeçalho para a barra em tinta não aparecer só depois da checagem. */
function EsqueletoAdmin() {
  return (
    <>
      <div className="bg-tinta h-[3.25rem]" aria-hidden />
      <div
        className="mx-auto flex max-w-[88rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        aria-busy
      >
        <Esqueleto className="h-7 w-48" />
        <Esqueleto className="h-64 w-full" />
      </div>
    </>
  );
}

/**
 * Chrome visualmente distinto da loja: cabeçalho em tinta, densidade maior, sem a serifa.
 * Quem entra aqui precisa saber num relance que está numa ferramenta interna.
 */
export function ChromeAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, ehAdmin, sair } = useSessao();

  return (
    <div className="bg-papel-2/70 flex min-h-full flex-1 flex-col">
      {/*
        Cabeçalho dentro do guarda: fora dele, um CLIENTE que abrisse /admin via URL veria a
        barra da ferramenta interna, a navegação e o botão "Sair" por cima do "sem permissão".
        Também garante que "Sair" só exista com a sessão já resolvida (com access token em mãos).
      */}
      <GuardaSessao exige="equipe" esqueleto={<EsqueletoAdmin />}>
        <header className="bg-tinta text-branco">
          <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
            <Logo clara semSerifa sufixo="Admin" href="/admin" />
            <nav
              aria-label="Administração"
              className="rolagem-discreta order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto"
            >
              {LINKS.filter((l) => !l.soAdmin || ehAdmin).map((l) => {
                const ativo = l.exato ? pathname === l.href : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={ativo ? 'page' : undefined}
                    className={cn(
                      'rounded-campo text-apoio text-branco/75 hover:bg-branco/10 hover:text-branco px-3 py-1.5 font-medium whitespace-nowrap',
                      ativo && 'bg-branco/15 text-branco',
                    )}
                  >
                    {l.rotulo}
                  </Link>
                );
              })}
            </nav>
            <div className="text-apoio ml-auto flex items-center gap-2">
              <Link
                href="/"
                className="rounded-campo text-branco/75 hover:bg-branco/10 hover:text-branco inline-flex items-center gap-1 px-2 py-1.5"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Ver loja
              </Link>
              {usuario && (
                <span className="text-branco/75 hidden md:inline" title={usuario.email}>
                  {usuario.nome.split(' ')[0]} · {ROTULO_PAPEL[usuario.role]}
                </span>
              )}
              <button
                type="button"
                onClick={() => void sair().then(() => router.push('/'))}
                className="rounded-campo text-branco/75 hover:bg-branco/10 hover:text-branco inline-flex items-center gap-1 px-2 py-1.5"
              >
                <LogOut className="size-3.5" aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </GuardaSessao>
    </div>
  );
}

/** Título de página do admin com ações à direita. */
export function PaginaAdmin({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1">{titulo}</h1>
          {descricao && <p className="text-apoio text-suave mt-0.5">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
      </div>
      {children}
    </div>
  );
}
