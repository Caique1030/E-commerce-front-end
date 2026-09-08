import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LinhaItem } from '@/components/carrinho/linha-item';
import type { ItemCarrinho } from '@/lib/tipos';

function item(sobrescrever: Partial<ItemCarrinho> = {}): ItemCarrinho {
  return {
    id: 'item-1',
    produto: {
      id: '11111111-1111-4111-8111-111111111111',
      sku: 'DJ-1',
      nome: 'Fone Bluetooth XZ',
      imagemUrl: null,
      tipo: 'SIMPLE',
    },
    quantidade: 1,
    precoUnitCentavos: 10000,
    precoNoCarrinhoCentavos: 10000,
    precoAlterado: false,
    agendadoPara: null,
    subtotalCentavos: 10000,
    disponivel: true,
    ...sobrescrever,
  };
}

describe('LinhaItem', () => {
  it('com quantidade 1, o botão de diminuir vira "remover" e dispara quantidade zero', async () => {
    const aoAlterar = vi.fn();
    render(
      <ul>
        <LinhaItem item={item()} aoAlterarQuantidade={aoAlterar} aoRemover={vi.fn()} />
      </ul>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Diminuir quantidade de Fone Bluetooth XZ para zero' }),
    );
    expect(aoAlterar).toHaveBeenCalledWith('item-1', 0);
  });

  it('digitar 0 no campo e sair dele também remove', async () => {
    const aoAlterar = vi.fn();
    render(
      <ul>
        <LinhaItem
          item={item({ quantidade: 3, subtotalCentavos: 30000 })}
          aoAlterarQuantidade={aoAlterar}
          aoRemover={vi.fn()}
        />
      </ul>,
    );

    const campo = screen.getByRole('textbox', { name: 'Quantidade de Fone Bluetooth XZ' });
    await userEvent.clear(campo);
    await userEvent.type(campo, '0');
    await userEvent.tab();
    expect(aoAlterar).toHaveBeenCalledWith('item-1', 0);
  });

  it('esvaziar o campo e sair não remove: volta para a quantidade atual', async () => {
    // `Number('')` é 0, e 0 significa remover: apagar o campo para redigitar apagava o item.
    const aoAlterar = vi.fn();
    render(
      <ul>
        <LinhaItem
          item={item({ quantidade: 3, subtotalCentavos: 30000 })}
          aoAlterarQuantidade={aoAlterar}
          aoRemover={vi.fn()}
        />
      </ul>,
    );

    const campo = screen.getByRole('textbox', { name: 'Quantidade de Fone Bluetooth XZ' });
    await userEvent.clear(campo);
    await userEvent.tab();

    expect(aoAlterar).not.toHaveBeenCalled();
    expect(campo).toHaveValue('3');
  });

  it('aumentar chama a quantidade seguinte e "Remover" chama o callback próprio', async () => {
    const aoAlterar = vi.fn();
    const aoRemover = vi.fn();
    render(
      <ul>
        <LinhaItem
          item={item({ quantidade: 2, subtotalCentavos: 20000 })}
          aoAlterarQuantidade={aoAlterar}
          aoRemover={aoRemover}
        />
      </ul>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade de Fone Bluetooth XZ' }),
    );
    expect(aoAlterar).toHaveBeenCalledWith('item-1', 3);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover Fone Bluetooth XZ do carrinho' }),
    );
    expect(aoRemover).toHaveBeenCalledWith('item-1');
  });

  it('avisa quando o preço mudou e quando o item saiu de venda', () => {
    render(
      <ul>
        <LinhaItem
          item={item({ precoAlterado: true, precoNoCarrinhoCentavos: 9000 })}
          aoAlterarQuantidade={vi.fn()}
          aoRemover={vi.fn()}
        />
        <LinhaItem
          item={item({ id: 'item-2', disponivel: false })}
          aoAlterarQuantidade={vi.fn()}
          aoRemover={vi.fn()}
        />
      </ul>,
    );
    expect(screen.getByText('Preço atualizado desde que você adicionou.')).toBeInTheDocument();
    expect(screen.getByText('Não está mais à venda')).toBeInTheDocument();
  });
});
