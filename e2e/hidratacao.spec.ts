import { expect, test } from '@playwright/test';

/**
 * A árvore de categorias é dado do layout, não da página: ela precisa estar no cache antes do
 * loading.tsx da rota. Quando a primeira montagem de ArvoreCategorias acontece no fallback, a
 * query nasce vazia e o HydrationBoundary da página encontra uma query já existente — nesse caso
 * ele adia a hidratação para um efeito, que não roda no servidor. O servidor mandava o esqueleto
 * e o cliente hidratava com a árvore pronta: o React acusava divergência de hidratação.
 * Pré-requisito: API em http://localhost:3000 com `npm run seed` executado.
 */
test.describe('hidratação do catálogo', () => {
  test('a página de categoria hidrata sem divergência', async ({ page }) => {
    const erros: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') erros.push(msg.text());
    });
    page.on('pageerror', (erro) => erros.push(erro.message));

    const resposta = await page.goto('/categoria/eletronicos');

    // O HTML do servidor já traz a árvore; sem isso o cliente hidrataria outra marcação.
    expect(await resposta!.text()).toContain('aria-label="Categorias"');

    await expect(page.getByRole('navigation', { name: 'Categorias' })).toBeVisible();
    expect(erros.filter((e) => /hydrat/i.test(e))).toEqual([]);
  });
});
