import Link from 'next/link';
import { NOME_LOJA } from '@/lib/constantes';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  href?: string;
  /** Versão clara para o chrome escuro do admin. */
  light?: boolean;
  suffix?: string;
  /** Só a marca desenhada, sem o wordmark (cabeçalho estreito no celular). */
  markOnly?: boolean;
}

/**
 * A marca: o toldo de um balcão de rua, em amarelo sobre a placa da loja, com o tampo branco
 * embaixo. É o único desenho da identidade — o resto da interface é tipo, cor e espaço.
 */
function Mark({ light, className }: { light: boolean; className?: string }) {
  const plate = light ? '#FFFFFF' : 'currentColor';
  const counter = light ? '#1F1F1F' : '#FFFFFF';
  return (
    <svg viewBox="0 0 28 28" className={cn('size-7 shrink-0', className)} aria-hidden>
      <rect width="28" height="28" rx="8" fill={plate} />
      <path d="M5 9h18v7q-3 3-6 0-3 3-6 0-3 3-6 0z" fill="#FFE600" />
      <rect x="7" y="19.5" width="14" height="2.5" rx="1.25" fill={counter} />
    </svg>
  );
}

export function Logo({
  className,
  href = '/',
  light = false,
  suffix,
  markOnly = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 leading-none',
        light ? 'text-branco' : 'text-tinta',
        className,
      )}
      aria-label={`${NOME_LOJA}${suffix ? ` ${suffix}` : ''} — início`}
    >
      <Mark light={light} />
      {!markOnly && <span className="wordmark text-[1.35rem]">{NOME_LOJA}</span>}
      {suffix && (
        <span className="text-apoio font-semibold tracking-wide uppercase opacity-70">
          {suffix}
        </span>
      )}
    </Link>
  );
}
