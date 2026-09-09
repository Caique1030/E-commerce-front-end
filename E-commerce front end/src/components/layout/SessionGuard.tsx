'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { NoPermission } from '@/components/estados/NoPermission';
import { useSessao } from '@/providers/sessao-provider';

type Requirement = 'autenticado' | 'cliente' | 'equipe' | 'admin';

interface SessionGuardProps {
  require?: Requirement;
  /** Mostrado enquanto a sessão carrega (e durante o redirecionamento de anônimos). */
  fallback: ReactNode;
  children: ReactNode;
}

const descricaoExigencia: Record<Exclude<Requirement, 'autenticado'>, string> = {
  cliente: 'para clientes da loja',
  equipe: 'da equipe da loja',
  admin: 'só para administradores',
};

/**
 * Segunda camada da proteção de rota (a primeira é o proxy, que confere o cookie).
 * Aqui a sessão já está resolvida: anônimo vai para /entrar; papel errado vê o que a conta pode fazer.
 * Lembrete: isto é UX. A autorização real acontece no back-end a cada requisição.
 */
export function SessionGuard({
  require: exige = 'autenticado',
  fallback,
  children,
}: SessionGuardProps) {
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

  if (status !== 'autenticado' || !usuario) return <>{fallback}</>;

  const permitido =
    exige === 'autenticado' ||
    (exige === 'cliente' && ehCliente) ||
    (exige === 'equipe' && ehEquipe) ||
    (exige === 'admin' && ehAdmin);

  if (!permitido) {
    return (
      <NoPermission
        role={usuario.role}
        requirement={descricaoExigencia[exige as Exclude<Requirement, 'autenticado'>]}
      />
    );
  }
  return <>{children}</>;
}
