import type { Metadata } from 'next';
import { Register } from '@/views/Register/Register';

export const metadata: Metadata = { title: 'Criar conta' };

export default function CriarContaPage() {
  return <Register />;
}
