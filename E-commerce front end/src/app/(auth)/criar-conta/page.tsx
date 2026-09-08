import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormularioCadastro } from '@/components/conta/formulario-cadastro';
import { Esqueleto } from '@/components/ui/esqueleto';

export const metadata: Metadata = { title: 'Criar conta' };

export default function CriarContaPage() {
  return (
    <Suspense fallback={<Esqueleto className="h-96 w-full" />}>
      <FormularioCadastro />
    </Suspense>
  );
}
