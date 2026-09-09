import type { Metadata } from 'next';
import { Account } from '@/views/Account/Account';

export const metadata: Metadata = { title: 'Minha conta' };

export default function ContaPage() {
  return <Account />;
}
