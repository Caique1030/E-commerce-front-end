import type { HTMLAttributes, ReactNode } from 'react';
import { ROTULO_STATUS } from '@/lib/constantes';
import type { StatusPedido } from '@/lib/tipos';
import { cn } from '@/lib/utils';

export type VarianteBadge = 'neutro' | 'verde' | 'agenda' | 'alerta' | 'aviso' | 'tinta';

const variantes: Record<VarianteBadge, string> = {
  neutro: 'bg-papel-2 text-tinta-3 border-borda',
  verde: 'bg-verde-suave text-verde border-verde/25',
  agenda: 'bg-agenda-suave text-agenda border-agenda/20',
  alerta: 'bg-alerta-suave text-alerta border-alerta/20',
  aviso: 'bg-aviso-suave text-aviso border-aviso/20',
  tinta: 'bg-tinta text-branco border-tinta',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variante?: VarianteBadge;
  icone?: ReactNode;
}

export function Badge({ variante = 'neutro', icone, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-micro inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium tracking-wide uppercase',
        variantes[variante],
        className,
      )}
      {...props}
    >
      {icone}
      {children}
    </span>
  );
}

const varianteStatus: Record<StatusPedido, VarianteBadge> = {
  PENDENTE: 'aviso',
  PAGO: 'verde',
  SEPARANDO: 'agenda',
  ENVIADO: 'agenda',
  ENTREGUE: 'verde',
  CANCELADO: 'alerta',
};

/** Status do pedido sempre com texto: a cor apoia, não carrega a informação sozinha. */
export function BadgeStatus({ status, className }: { status: StatusPedido; className?: string }) {
  return (
    <Badge
      variante={varianteStatus[status]}
      className={cn('tracking-normal normal-case', className)}
    >
      {ROTULO_STATUS[status]}
    </Badge>
  );
}
