import Link from 'next/link';
import { Vazio } from '@/components/estados/vazio';
import { Botao } from '@/components/ui/botao';

export default function ProdutoNaoEncontrado() {
  return (
    <Vazio
      ilustracao="busca"
      titulo="Este produto não está mais à venda."
      descricao="Ele pode ter sido removido do catálogo ou o endereço está errado."
      acao={
        <Botao asChild>
          <Link href="/">Ver produtos</Link>
        </Botao>
      }
    />
  );
}
