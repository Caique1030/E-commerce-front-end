import Link from 'next/link';
import { Vazio } from '@/components/estados/vazio';
import { Botao } from '@/components/ui/botao';

export default function NaoEncontrado() {
  return (
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
  );
}
