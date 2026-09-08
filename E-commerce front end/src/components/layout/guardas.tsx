'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { SemPermissao } from '@/components/estados/sem-permissao';
import { useSessao } from '@/providers/sessao-provider';

type Exigencia = 'autenticado' | 'cliente' | 'equipe' | 'admin';

interface GuardaProps {
  exige?: Exigencia;
  /** Mostrado enquanto a sessão carrega (e durante o redirecionamento de anônimos). */
  esqueleto: ReactNode;
  children: ReactNode;
}

const descricaoExigencia: Record<Exclude<Exigencia, 'autenticado'>, string> = {
  cliente: 'para clientes da loja',
  equipe: 'da equipe da loja',
  admin: 'só para administradores',
};

/**
 * Segunda camada da proteção de rota (a primeira é o proxy, que confere o cookie).
 * Aqui a sessão já está resolvida: anônimo vai para /entrar; papel errado vê o que a conta pode fazer.
 * Lembrete: isto é UX. A autorização real acontece no back-end a cada requisição.
 */
export function GuardaSessao({ exige = 'autenticado', esqueleto, children }: GuardaProps) {
  const { status, usuario, ehCliente, ehEquipe, ehAdmin } = useSessao();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== 'anonimo') return;
    const query = searchParams.toString();
    const voltar = `${pathname}${query ? `?${query}` : ''}`;
    router.replace(`/entrar?voltar=${encodeURIComponent(voltar)}`);
  }, [status, pathname, searchParams, router]);

  if (status !== 'autenticado' || !usuario) return <>{esqueleto}</>;

  const permitido =
    exige === 'autenticado' ||
    (exige === 'cliente' && ehCliente) ||
    (exige === 'equipe' && ehEquipe) ||
    (exige === 'admin' && ehAdmin);

  if (!permitido) {
    return (
      <SemPermissao
        papel={usuario.role}
        exige={descricaoExigencia[exige as Exclude<Exigencia, 'autenticado'>]}
      />
    );
  }
  return <>{children}</>;
}
