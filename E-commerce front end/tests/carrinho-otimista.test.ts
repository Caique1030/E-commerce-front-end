import { describe, expect, it } from 'vitest';
import { aplicarQuantidade } from '@/lib/hooks/use-carrinho';
import type { Carrinho, ItemCarrinho } from '@/lib/tipos';

function item(sobrescrever: Partial<ItemCarrinho> = {}): ItemCarrinho {
  return {
    id: 'item-1',
    produto: {
      id: 'p-1',
      sku: 'SKU-1',
      nome: 'Fone Bluetooth XZ',
      imagemUrl: null,
      tipo: 'SIMPLE',
    },
    quantidade: 2,
    precoUnitCentavos: 10000,
    precoNoCarrinhoCentavos: 10000,
    precoAlterado: false,
    agendadoPara: null,
    subtotalCentavos: 20000,
    disponivel: true,
    ...sobrescrever,
  };
}

function carrinho(itens: ItemCarrinho[]): Carrinho {
  return {
    id: 'c-1',
    status: 'ATIVO',
    itens,
    totalItens: itens.reduce((s, i) => s + i.quantidade, 0),
    subtotalCentavos: itens.reduce((s, i) => s + i.subtotalCentavos, 0),
    atualizadoEm: '2026-09-07T12:00:00.000Z',
  };
}

describe('aplicarQuantidade (otimismo do carrinho)', () => {
  it('recalcula subtotal do item e o total do carrinho junto', () => {
    const antes = carrinho([
      item(),
      item({
        id: 'item-2',
        produto: { ...item().produto, id: 'p-2' },
        quantidade: 1,
        subtotalCentavos: 10000,
      }),
    ]);
    const depois = aplicarQuantidade(antes, 'item-1', 5);

    expect(depois.itens[0].quantidade).toBe(5);
    expect(depois.itens[0].subtotalCentavos).toBe(50000);
    expect(depois.totalItens).toBe(6);
    expect(depois.subtotalCentavos).toBe(60000);
  });

  it('quantidade zero remove a linha (mesma regra do back)', () => {
    const depois = aplicarQuantidade(carrinho([item()]), 'item-1', 0);
    expect(depois.itens).toHaveLength(0);
    expect(depois.totalItens).toBe(0);
    expect(depois.subtotalCentavos).toBe(0);
  });

  it('item indisponível não entra no total, mas continua na lista', () => {
    const antes = carrinho([
      item(),
      item({ id: 'item-2', disponivel: false, quantidade: 1, subtotalCentavos: 10000 }),
    ]);
    const depois = aplicarQuantidade(antes, 'item-1', 3);
    expect(depois.itens).toHaveLength(2);
    expect(depois.subtotalCentavos).toBe(30000);
    expect(depois.totalItens).toBe(4);
  });

  it('não muta o carrinho original', () => {
    const antes = carrinho([item()]);
    aplicarQuantidade(antes, 'item-1', 9);
    expect(antes.itens[0].quantidade).toBe(2);
    expect(antes.subtotalCentavos).toBe(20000);
  });
});
