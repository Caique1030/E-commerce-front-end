import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CardProduto } from '@/components/produto/card-produto';
import type { Produto } from '@/lib/tipos';

function produto(sobrescrever: Partial<Produto> = {}): Produto {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    sku: 'DJ-1',
    nome: 'Fone Bluetooth XZ',
    descricao: 'Um fone.',
    precoCentavos: 129900,
    estoque: 12,
    imagemUrl: null,
    marca: 'Acme',
    tipo: 'SIMPLE',
    categoria: { id: 'c1', slug: 'eletronicos', nome: 'Eletrônicos', caminho: 'eletronicos' },
    duracaoMin: null,
    capacidadeSlot: null,
    ativo: true,
    criadoEm: '2026-09-01T00:00:00.000Z',
    atualizadoEm: '2026-09-01T00:00:00.000Z',
    ...sobrescrever,
  };
}

describe('CardProduto', () => {
  it('produto físico mostra "Adicionar", estoque e chama o callback', async () => {
    const aoAdicionar = vi.fn();
    render(<CardProduto produto={produto()} aoAdicionar={aoAdicionar} />);

    expect(screen.getByRole('heading', { name: 'Fone Bluetooth XZ' })).toBeInTheDocument();
    expect(screen.getByText('12 em estoque')).toBeInTheDocument();
    // O formatador usa espaço não separável depois de "R$"; o regex só confere o valor.
    expect(screen.getByText(/1\.299,00/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /adicionar fone bluetooth xz/i }));
    expect(aoAdicionar).toHaveBeenCalledWith(expect.objectContaining({ id: produto().id }));
  });

  it('serviço agendado mostra "Escolher data" (link para o produto), rótulo e faixa de agenda', () => {
    render(
      <CardProduto
        produto={produto({
          tipo: 'BOOKING',
          nome: 'Montagem de Móveis',
          duracaoMin: 90,
          capacidadeSlot: 3,
          estoque: 0,
        })}
        aoAdicionar={vi.fn()}
      />,
    );

    expect(screen.getByText('Serviço agendado')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /escolher data para montagem de móveis/i });
    expect(link).toHaveAttribute('href', `/produto/${produto().id}`);
    expect(screen.queryByRole('button', { name: /adicionar/i })).not.toBeInTheDocument();
    // Aparece no card e na legenda da faixa (esta última oculta para leitores de tela).
    expect(screen.getAllByText('1h30 · até 3 por horário').length).toBeGreaterThan(0);
    // A área da imagem do card é decorativa (aria-hidden): o link do título é o acessível.
    expect(
      screen.getByRole('img', { hidden: true, name: /atendimento das 9h às 18h/i }),
    ).toBeInTheDocument();
  });

  it('produto esgotado desabilita o botão e diz o motivo', () => {
    render(<CardProduto produto={produto({ estoque: 0 })} aoAdicionar={vi.fn()} />);
    const botao = screen.getByRole('button', { name: /esgotado/i });
    expect(botao).toBeDisabled();
    expect(screen.getAllByText('Esgotado').length).toBeGreaterThan(0);
  });
});
