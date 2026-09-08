import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { NOME_FUSO } from '@/lib/formatadores';

export function Rodape() {
  const mailpit = process.env.NEXT_PUBLIC_MAILPIT_URL;
  return (
    <footer className="border-borda bg-papel-2/60 mt-auto border-t">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-apoio text-suave max-w-xs">
            Loja de demonstração de um desafio técnico. Preços em reais; horários de serviço no{' '}
            {NOME_FUSO}.
          </p>
        </div>
        <nav
          aria-label="Rodapé"
          className="text-apoio grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3"
        >
          <Link href="/" className="hover:underline">
            Catálogo
          </Link>
          <Link href="/categoria/servicos" className="hover:underline">
            Serviços agendados
          </Link>
          <Link href="/meus-pedidos" className="hover:underline">
            Meus pedidos
          </Link>
          <Link href="/conta" className="hover:underline">
            Minha conta
          </Link>
          <Link href="/admin" className="hover:underline">
            Área administrativa
          </Link>
          {mailpit && (
            <a href={mailpit} target="_blank" rel="noreferrer" className="hover:underline">
              Caixa de e-mails (Mailpit)
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
