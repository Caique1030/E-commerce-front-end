'use client';

import { useRetomarIntencao } from '@/lib/hooks/use-acao-adicionar';

/** Depois do login, adiciona ao carrinho o item que o visitante tentou adicionar antes de entrar. */
export function RetomarIntencao() {
  useRetomarIntencao();
  return null;
}
