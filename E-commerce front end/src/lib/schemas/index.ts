import { z } from 'zod';
import { pt } from 'zod/locales';

/** Mensagens padrão do Zod em português (as customizadas dos schemas têm prioridade). */
z.config(pt());

export * from './auth';
export * from './catalogo';
export * from './categoria';
export * from './checkout';
export * from './enums';
export * from './pedido';
export * from './produto';
export * from './usuario';
