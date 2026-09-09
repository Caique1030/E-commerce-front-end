import { z } from 'zod';
import { pt } from 'zod/locales';

/**
 * Mensagens padrão do Zod em português (as customizadas dos schemas têm prioridade).
 *
 * Módulo separado do barril de schemas de propósito: quem só quer o idioma não deve arrastar
 * junto os schemas de produto, pedido e checkout para dentro do bundle.
 */
z.config(pt());
