import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROTULO_PAPEL } from '@/lib/constantes';
import type { Papel } from '@/lib/tipos';

const canDo: Record<Papel, string> = {
  CLIENTE: 'navegar pela loja, montar o carrinho, finalizar compras e acompanhar seus pedidos.',
  COMERCIAL: 'ver todos os pedidos, mudar o status deles e acompanhar o painel de vendas.',
  ADMIN: 'tudo do comercial e ainda cadastrar produtos, categorias e usuários.',
};

interface NoPermissionProps {
  role: Papel;
  /** O que a tela atual exige, em linguagem de gente. */
  requirement: string;
}

/** Diz o que a conta atual pode fazer, não só "acesso negado". */
export function NoPermission({ role, requirement }: NoPermissionProps) {
  return (
    <div
      className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center"
      role="alert"
    >
      <ShieldAlert className="text-aviso size-8" strokeWidth={1.5} aria-hidden />
      <p className="text-h2">Esta área é {requirement}.</p>
      <p className="text-corpo text-suave">
        Sua conta é do tipo <strong className="text-tinta">{ROTULO_PAPEL[role]}</strong> e pode{' '}
        {canDo[role]}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button as={Link} href="/" variant="secondary">
          Ir para a loja
        </Button>
        <Button as={Link} href="/entrar" variant="ghost">
          Entrar com outra conta
        </Button>
      </div>
    </div>
  );
}
