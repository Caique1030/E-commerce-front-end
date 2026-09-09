import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Tabela densa para o admin. O contêiner rola horizontalmente; a página nunca. */
export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="rounded-card border-borda bg-branco shadow-card overflow-x-auto border">
      <table
        className={cn('text-corpo w-full min-w-[640px] border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'border-borda bg-papel-2 text-apoio text-suave border-b px-3 py-2.5 text-left font-medium whitespace-nowrap',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('border-borda border-b px-3 py-2.5 align-middle', className)} {...props}>
      {children}
    </td>
  );
}
