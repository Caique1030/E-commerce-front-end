'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { useUiStore, type Toast } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const icones = {
  sucesso: <CheckCircle2 className="text-verde-nota size-5" aria-hidden />,
  erro: <AlertCircle className="text-alerta size-5" aria-hidden />,
  info: <Info className="text-agenda size-5" aria-hidden />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const dispensar = useUiStore((s) => s.dispensarToast);

  useEffect(() => {
    const t = setTimeout(() => dispensar(toast.id), toast.duracaoMs);
    return () => clearTimeout(t);
  }, [toast.id, toast.duracaoMs, dispensar]);

  return (
    <div
      role={toast.tipo === 'erro' ? 'alert' : 'status'}
      className={cn(
        'rounded-card bg-branco shadow-flutuante pointer-events-auto flex w-full max-w-sm items-start gap-3 border p-3.5',
        toast.tipo === 'erro' ? 'border-alerta/30' : 'border-borda',
      )}
    >
      {icones[toast.tipo]}
      <div className="min-w-0 flex-1">
        <p className="text-corpo font-medium">{toast.titulo}</p>
        {toast.descricao && <p className="text-apoio text-suave mt-0.5">{toast.descricao}</p>}
      </div>
      <button
        type="button"
        onClick={() => dispensar(toast.id)}
        className="rounded-campo text-suave hover:bg-papel-2 hover:text-tinta -mt-1 -mr-1 p-1"
        aria-label="Fechar aviso"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** Avisos curtos no canto inferior direito. A região é aria-live para o leitor de tela anunciar. */
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
