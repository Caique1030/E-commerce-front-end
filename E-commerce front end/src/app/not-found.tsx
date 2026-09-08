import Link from 'next/link';
import { Vazio } from '@/components/estados/vazio';
import { Botao } from '@/components/ui/botao';
import { Logo } from '@/components/ui/logo';

export default function NaoEncontradoGlobal() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-6 py-5">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <Vazio
          ilustracao="busca"
          titulo="Não encontramos esta página."
          descricao="Confira o endereço ou volte para o catálogo."
          acao={
            <Botao asChild>
              <Link href="/">Ir para a loja</Link>
            </Botao>
          }
        />
      </main>
    </div>
  );
}
