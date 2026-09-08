'use client';

import { ROTULO_PAPEL } from '@/lib/constantes';
import type { Papel } from '@/lib/tipos';

/** Contas criadas pelo seed do back-end (documentadas no README). Só aparecem com a flag ligada. */
export const CONTAS_TESTE: { email: string; senha: string; papel: Papel }[] = [
  { email: 'cliente@loja.local', senha: 'Cliente@123', papel: 'CLIENTE' },
  { email: 'comercial@loja.local', senha: 'Comercial@123', papel: 'COMERCIAL' },
  { email: 'admin@loja.local', senha: 'Admin@123', papel: 'ADMIN' },
];

export function contasDeTesteVisiveis(): boolean {
  return process.env.NEXT_PUBLIC_CONTAS_TESTE === 'true';
}

export function ContasDeTeste({
  aoEscolher,
}: {
  aoEscolher: (email: string, senha: string) => void;
}) {
  if (!contasDeTesteVisiveis()) return null;
  return (
    <details className="rounded-card border-borda bg-papel-2/60 text-apoio border px-4 py-3">
      <summary className="text-tinta cursor-pointer font-medium">
        Contas de teste (seed do back-end)
      </summary>
      <ul className="mt-3 flex flex-col gap-2">
        {CONTAS_TESTE.map((c) => (
          <li key={c.email} className="flex items-center justify-between gap-3">
            <span>
              <span className="text-tinta font-medium">{ROTULO_PAPEL[c.papel]}</span>
              <span className="text-suave block">{c.email}</span>
            </span>
            <button
              type="button"
              onClick={() => aoEscolher(c.email, c.senha)}
              className="rounded-campo border-borda-forte bg-branco text-apoio hover:border-tinta shrink-0 border px-2.5 py-1"
            >
              Preencher
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
