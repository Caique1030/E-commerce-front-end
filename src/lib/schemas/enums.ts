import { z } from 'zod';

/** Enums do domínio (espelho de src/common/enums do back-end). */
export const PapelEnum = z.enum(['CLIENTE', 'COMERCIAL', 'ADMIN']);
export const TipoProdutoEnum = z.enum(['SIMPLE', 'BOOKING']);
export const StatusPedidoEnum = z.enum([
  'PENDENTE',
  'PAGO',
  'SEPARANDO',
  'ENVIADO',
  'ENTREGUE',
  'CANCELADO',
]);

/** Boolean vindo como texto ("true"/"false") em query string. */
export const zodBooleanString = z.enum(['true', 'false']).transform((v) => v === 'true');
