import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ChromeAdmin } from '@/components/admin/chrome-admin';
import { NOME_LOJA } from '@/lib/constantes';

export const metadata: Metadata = {
  title: { default: 'Administração', template: `%s · Admin · ${NOME_LOJA}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ChromeAdmin>{children}</ChromeAdmin>;
}
