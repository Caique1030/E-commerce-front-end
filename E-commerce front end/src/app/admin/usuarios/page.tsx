import type { Metadata } from 'next';
import { AdminUsers } from '@/views/AdminUsers/AdminUsers';

export const metadata: Metadata = { title: 'Usuários' };

export default function AdminUsuariosPage() {
  return <AdminUsers />;
}
