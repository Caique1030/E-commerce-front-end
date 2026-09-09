'use client';

import { ROTULO_PAPEL } from '@/lib/constantes';
import type { Papel } from '@/lib/tipos';
import * as S from './style';

/** Contas criadas pelo seed do back-end (documentadas no README). Só aparecem com a flag ligada. */
export const CONTAS_TESTE: { email: string; senha: string; papel: Papel }[] = [
  { email: 'cliente@loja.local', senha: 'Cliente@123', papel: 'CLIENTE' },
  { email: 'comercial@loja.local', senha: 'Comercial@123', papel: 'COMERCIAL' },
  { email: 'admin@loja.local', senha: 'Admin@123', papel: 'ADMIN' },
];

export function contasDeTesteVisiveis(): boolean {
  return process.env.NEXT_PUBLIC_CONTAS_TESTE === 'true';
}

export function TestAccounts({ onPick }: { onPick: (email: string, senha: string) => void }) {
  if (!contasDeTesteVisiveis()) return null;
  return (
    <S.Root>
      <S.Summary>Contas de teste (seed do back-end)</S.Summary>
      <S.List>
        {CONTAS_TESTE.map((c) => (
          <S.Item key={c.email}>
            <span>
              <S.Role>{ROTULO_PAPEL[c.papel]}</S.Role>
              <S.Email>{c.email}</S.Email>
            </span>
            <S.FillButton type="button" onClick={() => onPick(c.email, c.senha)}>
              Preencher
            </S.FillButton>
          </S.Item>
        ))}
      </S.List>
    </S.Root>
  );
}
