import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Drawer, Modal } from '@/components/ui/Dialog';

describe('Modal (dialog nativo)', () => {
  it('aberto, expõe role dialog com o título como nome acessível e a descrição ligada', () => {
    render(
      <Modal open onOpenChange={vi.fn()} title="Esvaziar o carrinho?" description="Tudo sai.">
        <p>Conteúdo</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Esvaziar o carrinho?' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription('Tudo sai.');
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('fechado, não renderiza o conteúdo', () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('o botão Fechar e o Esc (evento cancel) pedem para fechar sem fechar sozinhos', async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    const dialog = screen.getByRole('dialog', { name: 'Título' });
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    // Quem fecha é o dono do estado: até lá o diálogo continua aberto.
    expect(dialog).toHaveAttribute('open');
  });

  it('clique no fundo escurecido fecha; clique no conteúdo não', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText('Conteúdo'));
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog', { name: 'Título' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ao fechar, o conteúdo some depois da animação de saída', async () => {
    const { rerender } = render(
      <Modal open onOpenChange={vi.fn()} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );
    rerender(
      <Modal open={false} onOpenChange={vi.fn()} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );
    // Ainda montado: a animação de saída precisa de algo para animar.
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    // O jsdom não roda animações; vale o tempo de segurança do próprio componente.
    await waitFor(() => expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Drawer', () => {
  it('é um dialog nomeado pelo título, com rodapé', () => {
    render(
      <Drawer open onOpenChange={vi.fn()} title="Carrinho" footer={<button>Finalizar</button>}>
        <p>Itens</p>
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Carrinho' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finalizar' })).toBeInTheDocument();
  });
});
