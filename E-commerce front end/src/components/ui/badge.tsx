import type { HTMLAttributes, ReactNode } from 'react';
import { ROTULO_STATUS } from '@/lib/constantes';
import type { StatusPedido } from '@/lib/tipos';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'neutral' | 'green' | 'schedule' | 'danger' | 'warning' | 'ink';

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-papel-2 text-tinta-3 border-borda',
  green: 'bg-verde-suave text-verde border-verde/25',
  schedule: 'bg-agenda-suave text-agenda border-agenda/20',
  danger: 'bg-alerta-suave text-alerta border-alerta/20',
  warning: 'bg-aviso-suave text-aviso border-aviso/20',
  ink: 'bg-tinta text-branco border-tinta',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

export function Badge({ variant = 'neutral', icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-micro inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium tracking-wide uppercase',
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

const statusVariant: Record<StatusPedido, BadgeVariant> = {
  PENDENTE: 'warning',
  PAGO: 'green',
  SEPARANDO: 'schedule',
  ENVIADO: 'schedule',
  ENTREGUE: 'green',
  CANCELADO: 'danger',
};

/** Status do pedido sempre com texto: a cor apoia, não carrega a informação sozinha. */
export function StatusBadge({ status, className }: { status: StatusPedido; className?: string }) {
  return (
    <Badge variant={statusVariant[status]} className={cn('tracking-normal normal-case', className)}>
      {ROTULO_STATUS[status]}
    </Badge>
  );
}
