import type { FiltrosProduto } from '@/lib/tipos';
import { AtalhosCategorias } from './atalhos-categorias';
import { CarrosselBanners } from './carrossel-banners';
import { FaixaBeneficios } from './faixa-beneficios';
import { TrilhoProdutos } from './trilho-produtos';

const LIMITE_TRILHO = 12;

/**
 * Filtros dos trilhos. Exportados porque a página faz o prefetch no servidor com exatamente
 * estes objetos — a chave da query precisa ser a mesma dos dois lados, ou o cliente busca de novo.
 */
export const FILTROS_VITRINE = {
  ofertas: {
    ordenar: 'preco',
    direcao: 'asc',
    page: 1,
    limit: LIMITE_TRILHO,
  } satisfies FiltrosProduto,
  servicos: {
    tipo: 'BOOKING',
    ordenar: 'recente',
    direcao: 'desc',
    page: 1,
    limit: LIMITE_TRILHO,
  } satisfies FiltrosProduto,
};

/**
 * A vitrine da home, na ordem em que o cliente decide: primeiro o que a loja promete
 * (carrossel), depois por onde entrar (categorias), depois o que já dá para levar (trilhos).
 * A grade completa do catálogo vem logo abaixo, na própria página.
 */
export function Vitrine() {
  return (
    <div className="flex flex-col gap-4">
      <CarrosselBanners />
      <AtalhosCategorias />
      <TrilhoProdutos
        titulo="Começa em conta"
        descricao="Os menores preços do catálogo agora"
        filtros={FILTROS_VITRINE.ofertas}
        verTodosHref="/?ordenar=preco-asc"
      />
      <TrilhoProdutos
        titulo="Agende um serviço"
        descricao="Escolha a data e a hora; o horário sai da agenda na mesma compra"
        filtros={FILTROS_VITRINE.servicos}
        verTodosHref="/categoria/servicos"
        tom="agenda"
      />
      <FaixaBeneficios />
    </div>
  );
}
