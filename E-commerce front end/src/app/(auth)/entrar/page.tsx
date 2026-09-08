import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormularioEntrar } from '@/components/conta/formulario-entrar';
import { Esqueleto } from '@/components/ui/esqueleto';

export const metadata: Metadata = { title: 'Entrar' };

export default function EntrarPage() {
  return (
    <Suspense fallback={<Esqueleto className="h-80 w-full" />}>
      <FormularioEntrar />
    </Suspense>
  );
}
