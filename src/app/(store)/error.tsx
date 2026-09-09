'use client';

import Link from 'next/link';
import { ErrorState } from '@/components/estados/ErrorState';
import { Button } from '@/components/ui/Button';

export default function ErroLoja({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Não foi possível mostrar esta página."
      description="Tente de novo. Se continuar, volte para o catálogo."
      onRetry={reset}
      extraAction={
        <Button as={Link} href="/" variant="ghost">
          Ver produtos
        </Button>
      }
      className="painel mx-auto max-w-lg px-6 py-10"
    />
  );
}
