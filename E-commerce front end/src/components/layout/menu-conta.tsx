'use client';

import { ChevronDown, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Botao } from '@/components/ui/botao';
import { Esqueleto } from '@/components/ui/esqueleto';
import {
  MenuConteudo,
  MenuGatilho,
  MenuItem,
  MenuRaiz,
  MenuRotulo,
  MenuSeparador,
} from '@/components/ui/menu';
import { ROTULO_PAPEL } from '@/lib/constantes';
import { iniciais } from '@/lib/formatadores';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';

/** Entrar / menu da conta no cabeçalho. Enquanto a sessão carrega, um esqueleto do mesmo tamanho. */
export function MenuConta() {
  const { status, usuario, ehEquipe, sair } = useSessao();
  const router = useRouter();

  if (status === 'carregando') return <Esqueleto className="h-9 w-24" />;

  if (status === 'anonimo' || !usuario) {
    return (
      <div className="flex items-center gap-1">
        <Botao asChild variante="fantasma" tamanho="sm" className="hidden sm:inline-flex">
          <Link href="/criar-conta">Criar conta</Link>
        </Botao>
        <Botao asChild variante="secundario" tamanho="sm">
          <Link href="/entrar">Entrar</Link>
        </Botao>
      </div>
    );
  }

  async function aoSair() {
    await sair();
    notificar({ tipo: 'info', titulo: 'Você saiu da sua conta.' });
    router.push('/');
  }

  return (
    <MenuRaiz>
      <MenuGatilho asChild>
        <button
          type="button"
          className="rounded-campo text-corpo hover:bg-papel-2 data-[state=open]:bg-papel-2 flex h-9 items-center gap-2 px-2"
          aria-label={`Conta de ${usuario.nome}`}
        >
          <span
            className="bg-tinta text-micro text-branco flex size-7 items-center justify-center rounded-full font-semibold"
            aria-hidden
          >
            {iniciais(usuario.nome)}
          </span>
          <span className="hidden max-w-32 truncate md:inline">{usuario.nome.split(' ')[0]}</span>
          <ChevronDown className="text-suave size-4" aria-hidden />
        </button>
      </MenuGatilho>
      <MenuConteudo>
        <MenuRotulo>
          <span className="text-tinta block truncate font-medium">{usuario.nome}</span>
          <span className="block truncate">{usuario.email}</span>
          <span className="text-micro mt-0.5 block tracking-wide uppercase">
            {ROTULO_PAPEL[usuario.role]}
          </span>
        </MenuRotulo>
        <MenuSeparador />
        {!ehEquipe && (
          <MenuItem asChild>
            <Link href="/meus-pedidos">
              <Package className="text-suave size-4" aria-hidden />
              Meus pedidos
            </Link>
          </MenuItem>
        )}
        <MenuItem asChild>
          <Link href="/conta">
            <UserRound className="text-suave size-4" aria-hidden />
            Minha conta
          </Link>
        </MenuItem>
        {ehEquipe && (
          <MenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard className="text-suave size-4" aria-hidden />
              Área administrativa
            </Link>
          </MenuItem>
        )}
        <MenuSeparador />
        <MenuItem onSelect={() => void aoSair()}>
          <LogOut className="text-suave size-4" aria-hidden />
          Sair
        </MenuItem>
      </MenuConteudo>
    </MenuRaiz>
  );
}
