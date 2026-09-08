import { z } from 'zod';
import { nomeSchema } from './usuario';

/**
 * O checkout do back (POST /pedidos) não recebe corpo: o pedido nasce do carrinho ativo e o
 * nome/e-mail do cliente são copiados da conta. O único dado editável na tela é o nome, que
 * segue para PATCH /usuarios/me com a mesma regra do back (nomeSchema) antes de finalizar.
 */
export const checkoutSchema = z.strictObject({
  nome: nomeSchema,
});
export type DadosCheckout = z.infer<typeof checkoutSchema>;
