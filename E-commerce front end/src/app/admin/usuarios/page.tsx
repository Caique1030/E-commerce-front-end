'use client';

import { Suspense } from 'react';
import { PaginaAdmin } from '@/components/admin/chrome-admin';
import { TabelaUsuarios } from '@/components/admin/tabela-usuarios';
import { EsqueletoTabela } from '@/components/estados/skeletons';
import { GuardaSessao } from '@/components/layout/guardas';

export default function AdminUsuariosPage() {
  return (
    <GuardaSessao exige="admin" esqueleto={<EsqueletoTabela colunas={5} />}>
      <PaginaAdmin
        titulo="Usuários"
        descricao="Papéis e situação das contas. Você não pode alterar a própria conta por aqui."
      >
        <Suspense fallback={<EsqueletoTabela colunas={5} />}>
          <TabelaUsuarios />
        </Suspense>
      </PaginaAdmin>
    </GuardaSessao>
  );
}
