import type { MotivoProblema, Papel, ProblemaItem, StatusPedido } from './tipos';

export const NOME_LOJA = 'Balcão';
export const DESCRICAO_LOJA = 'Compre produtos e agende serviços no mesmo lugar.';

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  PENDENTE: 'Aguardando pagamento',
  PAGO: 'Pago',
  SEPARANDO: 'Em separação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

/** Máquina de estados do pedido (espelho do back). ENTREGUE e CANCELADO são terminais. */
export const TRANSICOES: Record<StatusPedido, readonly StatusPedido[]> = {
  PENDENTE: ['PAGO', 'CANCELADO'],
  PAGO: ['SEPARANDO', 'CANCELADO'],
  SEPARANDO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGUE'],
  ENTREGUE: [],
  CANCELADO: [],
};

export const ORDEM_STATUS: readonly StatusPedido[] = [
  'PENDENTE',
  'PAGO',
  'SEPARANDO',
  'ENVIADO',
  'ENTREGUE',
  'CANCELADO',
];

export const ROTULO_PAPEL: Record<Papel, string> = {
  CLIENTE: 'Cliente',
  COMERCIAL: 'Comercial',
  ADMIN: 'Administrador',
};

export const PAPEIS_EQUIPE: readonly Papel[] = ['COMERCIAL', 'ADMIN'];

export const ehEquipe = (papel?: Papel | null): boolean => !!papel && PAPEIS_EQUIPE.includes(papel);

export const OPCOES_ORDENACAO = [
  { valor: 'recente', rotulo: 'Mais recentes' },
  { valor: 'preco-asc', rotulo: 'Menor preço' },
  { valor: 'preco-desc', rotulo: 'Maior preço' },
  { valor: 'nome-asc', rotulo: 'Nome A–Z' },
  { valor: 'nome-desc', rotulo: 'Nome Z–A' },
] as const;

export type ValorOrdenacao = (typeof OPCOES_ORDENACAO)[number]['valor'];

export const LIMITE_CATALOGO = 24;
export const LIMITE_TABELA = 20;

const ROTULO_MOTIVO: Record<MotivoProblema, (p: ProblemaItem) => string> = {
  INDISPONIVEL: () => 'não está mais à venda',
  ESTOQUE_INSUFICIENTE: (p) =>
    p.disponivel === 0
      ? `você pediu ${p.solicitado ?? '?'}, mas acabou o estoque`
      : `você pediu ${p.solicitado ?? '?'}, restam ${p.disponivel ?? '?'}`,
  SLOT_SEM_VAGA: (p) =>
    p.disponivel === 0
      ? 'o horário escolhido lotou'
      : `você pediu ${p.solicitado ?? '?'} vagas, restam ${p.disponivel ?? '?'} neste horário`,
  HORARIO_INVALIDO: () => 'o horário escolhido já passou ou saiu da agenda',
};

export function descreverProblema(p: ProblemaItem): string {
  return ROTULO_MOTIVO[p.motivo]?.(p) ?? 'ficou indisponível';
}

/** O que cada problema exige para o carrinho voltar a ser válido. */
export function acaoParaProblema(p: ProblemaItem): 'remover' | 'ajustar' {
  if (
    (p.motivo === 'ESTOQUE_INSUFICIENTE' || p.motivo === 'SLOT_SEM_VAGA') &&
    (p.disponivel ?? 0) > 0
  ) {
    return 'ajustar';
  }
  return 'remover';
}
