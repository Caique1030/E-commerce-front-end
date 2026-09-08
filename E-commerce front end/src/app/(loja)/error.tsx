'use client';

import Link from 'next/link';
import { Erro } from '@/components/estados/erro';
import { Botao } from '@/components/ui/botao';

export default function ErroLoja({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Erro
      titulo="Não foi possível mostrar esta página."
      descricao="Tente de novo. Se continuar, volte para o catálogo."
      aoTentarDeNovo={reset}
      acaoExtra={
        <Botao asChild variante="fantasma">
          <Link href="/">Ver produtos</Link>
        </Botao>
      }
      className="mx-auto max-w-lg"
    />
  );
}
