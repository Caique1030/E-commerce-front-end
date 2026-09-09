import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/layout/AdminShell/AdminShell';
import { NOME_LOJA } from '@/lib/constantes';

export const metadata: Metadata = {
  title: { default: 'Administração', template: `%s · Admin · ${NOME_LOJA}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
