'use client';

import type { ReactNode } from 'react';
import '@/lib/schemas/locale'; // configura as mensagens do Zod em português
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from './query-provider';
import { SessaoProvider } from './sessao-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessaoProvider>
        {children}
        <Toaster />
      </SessaoProvider>
    </QueryProvider>
  );
}
