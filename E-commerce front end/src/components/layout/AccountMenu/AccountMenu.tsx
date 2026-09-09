'use client';

import { ChevronDown, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/Menu';
import { ROTULO_PAPEL } from '@/lib/constantes';
import { iniciais } from '@/lib/formatadores';
import { useSessao } from '@/providers/sessao-provider';
import { notificar } from '@/stores/ui-store';
import * as S from './style';

/** Entrar / menu da conta no cabeçalho. Enquanto a sessão carrega, um esqueleto do mesmo tamanho. */
export function AccountMenu() {
  const { status, usuario, ehEquipe, sair } = useSessao();
  const router = useRouter();

  if (status === 'carregando') return <Skeleton className="bg-tinta/10 h-9 w-24" />;

  if (status === 'anonimo' || !usuario) {
    return (
      <S.GuestLinks>
        <S.RegisterLink href="/criar-conta">Crie a sua conta</S.RegisterLink>
        <S.LoginLink href="/entrar">Entrar</S.LoginLink>
      </S.GuestLinks>
    );
  }

  async function aoSair() {
    await sair();
    notificar({ tipo: 'info', titulo: 'Você saiu da sua conta.' });
    router.push('/');
  }

  return (
    <Menu>
      <S.Trigger aria-label={`Conta de ${usuario.nome}`}>
        <S.Avatar aria-hidden>{iniciais(usuario.nome)}</S.Avatar>
        <S.FirstName>{usuario.nome.split(' ')[0]}</S.FirstName>
        <S.MutedIcon>
          <ChevronDown size={16} aria-hidden />
        </S.MutedIcon>
      </S.Trigger>
      <MenuContent>
        <MenuLabel>
          <S.LabelName>{usuario.nome}</S.LabelName>
          <S.LabelEmail>{usuario.email}</S.LabelEmail>
          <S.LabelRole>{ROTULO_PAPEL[usuario.role]}</S.LabelRole>
        </MenuLabel>
        <MenuSeparator />
        {!ehEquipe && (
          <MenuItem as={Link} href="/meus-pedidos">
            <S.MutedIcon>
              <Package size={16} aria-hidden />
            </S.MutedIcon>
            Meus pedidos
          </MenuItem>
        )}
        <MenuItem as={Link} href="/conta">
          <S.MutedIcon>
            <UserRound size={16} aria-hidden />
          </S.MutedIcon>
          Minha conta
        </MenuItem>
        {ehEquipe && (
          <MenuItem as={Link} href="/admin">
            <S.MutedIcon>
              <LayoutDashboard size={16} aria-hidden />
            </S.MutedIcon>
            Área administrativa
          </MenuItem>
        )}
        <MenuSeparator />
        <MenuItem onSelect={() => void aoSair()}>
          <S.MutedIcon>
            <LogOut size={16} aria-hidden />
          </S.MutedIcon>
          Sair
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
