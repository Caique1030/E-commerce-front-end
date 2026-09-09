import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/Menu';

function montar(onSelect = vi.fn()) {
  render(
    <>
      <Menu>
        <MenuTrigger aria-label="Conta de Ana">Ana</MenuTrigger>
        <MenuContent>
          <MenuLabel>ana@loja.local</MenuLabel>
          <MenuSeparator />
          <MenuItem as="a" href="/meus-pedidos">
            Meus pedidos
          </MenuItem>
          <MenuItem as="a" href="/conta">
            Minha conta
          </MenuItem>
          <MenuItem onSelect={onSelect}>Sair</MenuItem>
        </MenuContent>
      </Menu>
      <button type="button">Depois do menu</button>
    </>,
  );
  return { gatilho: screen.getByRole('button', { name: 'Conta de Ana' }), onSelect };
}

describe('Menu (menu suspenso)', () => {
  it('fechado por padrão, com aria-haspopup e aria-expanded no gatilho', () => {
    const { gatilho } = montar();
    expect(gatilho).toHaveAttribute('aria-haspopup', 'menu');
    expect(gatilho).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clique abre, foca o primeiro item e liga aria-controls', async () => {
    const { gatilho } = montar();
    await userEvent.click(gatilho);
    const menu = screen.getByRole('menu');
    expect(gatilho).toHaveAttribute('aria-expanded', 'true');
    expect(gatilho).toHaveAttribute('aria-controls', menu.id);
    expect(screen.getByRole('menuitem', { name: 'Meus pedidos' })).toHaveFocus();
  });

  it('setas, Home e End percorrem os itens com volta nas pontas', async () => {
    const { gatilho } = montar();
    await userEvent.click(gatilho);
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Minha conta' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Meus pedidos' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Meus pedidos' })).toHaveFocus();
  });

  it('Esc fecha e devolve o foco ao gatilho', async () => {
    const { gatilho } = montar();
    await userEvent.click(gatilho);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(gatilho).toHaveFocus();
  });

  it('escolher um item chama onSelect e fecha o menu', async () => {
    const { gatilho, onSelect } = montar();
    await userEvent.click(gatilho);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicar fora fecha o menu sem puxar o foco de volta ao gatilho', async () => {
    const { gatilho } = montar();
    await userEvent.click(gatilho);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(gatilho).not.toHaveFocus();
  });

  it('Tab fecha o menu e segue para o elemento seguinte ao gatilho', async () => {
    const { gatilho } = montar();
    await userEvent.click(gatilho);
    await userEvent.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(gatilho).not.toHaveFocus();
    expect(screen.getByRole('button', { name: 'Depois do menu' })).toHaveFocus();
  });
});
