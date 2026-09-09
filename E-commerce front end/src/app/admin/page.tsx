import type { Metadata } from 'next';
import { AdminDashboard } from '@/views/AdminDashboard/AdminDashboard';

export const metadata: Metadata = { title: 'Resumo' };

export default function AdminHomePage() {
  return <AdminDashboard />;
}
