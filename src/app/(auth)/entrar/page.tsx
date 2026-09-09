import type { Metadata } from 'next';
import { Login } from '@/views/Login/Login';

export const metadata: Metadata = { title: 'Entrar' };

export default function EntrarPage() {
  return <Login />;
}
