import Link from 'next/link';
import { NOME_LOJA } from '@/lib/constantes';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  href?: string;
  /** Versão clara para o chrome escuro do admin. */
  clara?: boolean;
  sufixo?: string;
  /** Admin: sem a serifa da vitrine. */
  semSerifa?: boolean;
}

/** O wordmark é o único lugar (além dos títulos da home) em que a serifa aparece. */
export function Logo({
  className,
  href = '/',
  clara = false,
  sufixo,
  semSerifa = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-baseline gap-2 leading-none',
        semSerifa
          ? 'font-ui text-[1.25rem] font-semibold tracking-tight'
          : 'wordmark text-[1.6rem]',
        clara ? 'text-branco' : 'text-tinta',
        className,
      )}
      aria-label={`${NOME_LOJA}${sufixo ? ` ${sufixo}` : ''} — início`}
    >
      <span>{NOME_LOJA}</span>
      {sufixo && (
        <span className="font-ui text-apoio font-medium tracking-wide uppercase opacity-70">
          {sufixo}
        </span>
      )}
    </Link>
  );
}
