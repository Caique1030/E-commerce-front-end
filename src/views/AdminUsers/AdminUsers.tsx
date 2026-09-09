'use client';

import { Suspense } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader/AdminPageHeader';
import { UsersTable } from '@/components/admin/UsersTable/UsersTable';
import { TableSkeleton } from '@/components/estados/Skeletons';
import { SessionGuard } from '@/components/layout/SessionGuard';
import * as S from './style';

/** Só ADMIN vê as contas: o guarda aqui é mais estrito que o do AdminShell (equipe). */
export function AdminUsers() {
  return (
    <S.Root>
      <SessionGuard require="admin" fallback={<TableSkeleton columns={5} />}>
        <AdminPageHeader
          title="Usuários"
          description="Papéis e situação das contas. Você não pode alterar a própria conta por aqui."
        >
          <Suspense fallback={<TableSkeleton columns={5} />}>
            <UsersTable />
          </Suspense>
        </AdminPageHeader>
      </SessionGuard>
    </S.Root>
  );
}
