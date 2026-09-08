import { expect, test, type Page } from '@playwright/test';

/**
 * Fluxo completo contra o back real com o seed:
 * entrar → adicionar produto → alterar quantidade → finalizar → tela de confirmação.
 * Pré-requisito: API em http://localhost:3000 com `npm run seed` executado.
 */
const CLIENTE = { email: 'cliente@loja.local', senha: 'Cliente@123' };

async function entrar(page: Page) {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(CLIENTE.email);
  await page.getByLabel('Senha').fill(CLIENTE.senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: /conta de/i })).toBeVisible();
}

test.describe('compra de produto físico', () => {
  test('entrar, adicionar, alterar quantidade, finalizar e ver a confirmação', async ({ page }) => {
    await entrar(page);

    // Catálogo com a grade carregada
    const grade = page
      .getByRole('list')
      .filter({ has: page.getByRole('article') })
      .first();
    await expect(grade.getByRole('article').first()).toBeVisible();

    // Adiciona o primeiro produto físico disponível
    const adicionar = page.getByRole('button', { name: /^Adicionar .* ao carrinho$/ }).first();
    const nomeProduto = (await adicionar.getAttribute('aria-label'))!
      .replace(/^Adicionar /, '')
      .replace(/ ao carrinho$/, '');
    await adicionar.click();

    // Drawer abre com o item destacado
    const drawer = page.getByRole('dialog', { name: 'Carrinho' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link', { name: nomeProduto }).first()).toBeVisible();

    // Aumenta a quantidade (otimista) e confere o campo
    const campoQuantidade = drawer.getByRole('textbox', { name: `Quantidade de ${nomeProduto}` });
    const antes = Number(await campoQuantidade.inputValue());
    await drawer.getByRole('button', { name: `Aumentar quantidade de ${nomeProduto}` }).click();
    await expect(campoQuantidade).toHaveValue(String(antes + 1));

    // Vai para o checkout e finaliza
    await drawer.getByRole('button', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL('/checkout');
    await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();

    const finalizar = page.getByRole('button', { name: 'Finalizar compra' });
    await finalizar.click();

    // Confirmação com código do pedido
    await expect(page).toHaveURL(/\/pedido\/[0-9a-f-]{36}$/);
    await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible();
    await expect(page.getByText(/^PED-\d{8}-[A-Z2-9]{6}$/)).toBeVisible();
    await expect(page.getByText('Aguardando pagamento')).toBeVisible();
  });
});

test.describe('serviço agendado', () => {
  test('escolher data e horário e adicionar ao carrinho', async ({ page }) => {
    await entrar(page);
    await page.goto('/categoria/servicos');

    await page
      .getByRole('link', { name: /^Escolher data para/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/produto\//);

    // Primeiro dia habilitado do calendário: dias bloqueados têm o motivo entre parênteses no rótulo.
    const calendario = page.getByRole('group', { name: /^Calendário de/ });
    const dia = calendario.getByRole('button', { name: /-feira, \d+ de [a-zç]+$/ }).first();
    await dia.click();

    // Primeiro horário livre
    const horario = page.getByRole('button', { name: /^\d{2}:\d{2}, \d+ vagas?$/ }).first();
    await expect(horario).toBeVisible();
    await horario.click();

    const agendar = page.getByRole('button', { name: 'Agendar e adicionar' });
    await expect(agendar).toBeEnabled();
    await agendar.click();

    const drawer = page.getByRole('dialog', { name: 'Carrinho' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/às \d{2}:\d{2}/).first()).toBeVisible();
  });
});
