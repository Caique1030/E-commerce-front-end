'use client';

import { useEffect, useRef, useState } from 'react';

/** Devolve o valor só depois de `ms` sem mudanças. */
export function useValorComAtraso<T>(valor: T, ms = 400): T {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}

/** Versão com callback: chama `fn` depois de `ms` sem novas chamadas. */
export function useChamadaComAtraso<A extends unknown[]>(fn: (...args: A) => void, ms = 400) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (...args: A) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), ms);
  };
}
