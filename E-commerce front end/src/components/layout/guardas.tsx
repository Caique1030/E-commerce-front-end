'use client';

import { usePathname, useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (status !== 'anonimo') return;
    // A query sai de window.location em vez de useSearchParams: o hook força a página inteira
    // para render no cliente (bailout), e este guarda embrulha quase toda rota privada.
    const voltar = `${pathname}${window.location.search}`;
    router.replace(`/entrar?voltar=${encodeURIComponent(voltar)}`);
  }, [status, pathname, router]);

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
