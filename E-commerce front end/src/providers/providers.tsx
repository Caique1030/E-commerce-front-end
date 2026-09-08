'use client';

import type { ReactNode } from 'react';
import '@/lib/schemas'; // configura as mensagens do Zod em português
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from './query-provider';
import { SessaoProvider } from './sessao-provider';

export function Providers({
  children,
  temSessaoInicial,
}: {
  children: ReactNode;
  temSessaoInicial: boolean;
}) {
  return (
    <QueryProvider>
      <SessaoProvider temSessaoInicial={temSessaoInicial}>
        {children}
        <Toaster />
      </SessaoProvider>
    </QueryProvider>
  );
}
