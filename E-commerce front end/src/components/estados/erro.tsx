'use client';

import { WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Botao } from '@/components/ui/botao';
import { ApiError } from '@/lib/api/cliente';
import { cn } from '@/lib/utils';

interface ErroProps {
  erro?: unknown;
  titulo?: string;
  descricao?: string;
  aoTentarDeNovo?: () => void;
  tentandoDeNovo?: boolean;
  acaoExtra?: ReactNode;
  className?: string;
  compacto?: boolean;
}

/** Explica o que houve e oferece "Tentar de novo". Sem "ops", sem pedir desculpa. */
export function Erro({
  erro,
  titulo,
  descricao,
  aoTentarDeNovo,
  tentandoDeNovo,
  acaoExtra,
  className,
  compacto = false,
}: ErroProps) {
  const rede = erro instanceof ApiError && erro.ehRede;
  const tituloFinal =
    titulo ??
    (rede ? 'Não foi possível carregar os dados.' : 'Não foi possível carregar esta parte.');
  const descricaoFinal =
    descricao ??
    (rede
      ? 'Verifique sua conexão e se a API está no ar.'
      : erro instanceof ApiError
        ? erro.message
        : 'Tente de novo em instantes.');

  return (
    <div
      role="alert"
      className={cn(
        'rounded-card border-alerta/25 bg-alerta-suave/40 flex flex-col items-center justify-center border text-center',
        compacto ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12',
        className,
      )}
    >
      {rede && <WifiOff className="text-alerta size-8" aria-hidden strokeWidth={1.5} />}
      <p className="text-h2 text-tinta">{tituloFinal}</p>
      <p className="text-corpo text-suave max-w-md">{descricaoFinal}</p>
      {(aoTentarDeNovo || acaoExtra) && (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {aoTentarDeNovo && (
            <Botao variante="secundario" onClick={aoTentarDeNovo} carregando={tentandoDeNovo}>
              Tentar de novo
            </Botao>
          )}
          {acaoExtra}
        </div>
      )}
    </div>
  );
}
