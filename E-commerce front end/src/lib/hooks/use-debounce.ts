'use client';

import { useEffect, useRef } from 'react';

/** Chama `fn` depois de `ms` sem novas chamadas. */
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
