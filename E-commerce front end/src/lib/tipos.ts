/**
 * Contrato da API (espelho dos DTOs de saída do back-end).
 * Dinheiro sempre em centavos inteiros; datas em ISO 8601 UTC.
 */

export type TipoProduto = 'SIMPLE' | 'BOOKING';
export type Papel = 'CLIENTE' | 'COMERCIAL' | 'ADMIN';
export type StatusPedido = 'PENDENTE' | 'PAGO' | 'SEPARANDO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
export type StatusCarrinho = 'ATIVO' | 'CONVERTIDO' | 'ABANDONADO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Papel;
  ativo: boolean;
  criadoEm: string;
}

export interface Categoria {
  id: string;
  slug: string;
  nome: string;
  parentId: string | null;
  caminho: string;
  nivel: number;
  ordem: number;
  ativo: boolean;
  filhos: Categoria[];
}

export interface CategoriaResumo {
  id: string;
  slug: string;
  nome: string;
  caminho: string;
}

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  descricao: string;
  precoCentavos: number;
  estoque: number;
  imagemUrl: string | null;
  marca: string | null;
  tipo: TipoProduto;
  categoria: CategoriaResumo;
  duracaoMin: number | null;
  capacidadeSlot: number | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Slot {
  inicio: string;
  fim: string;
  capacidade: number;
  reservados: number;
  vagas: number;
}

export interface ItemCarrinho {
  id: string;
  produto: {
    id: string;
    sku: string;
    nome: string;
    imagemUrl: string | null;
    tipo: TipoProduto;
  };
  quantidade: number;
  /** Preço atual do produto. */
  precoUnitCentavos: number;
  /** Preço quando o item foi adicionado. */
  precoNoCarrinhoCentavos: number;
  precoAlterado: boolean;
  agendadoPara: string | null;
  subtotalCentavos: number;
  /** false se o produto foi desativado/removido desde então. */
  disponivel: boolean;
}

export interface Carrinho {
  id: string;
  status: StatusCarrinho;
  itens: ItemCarrinho[];
  totalItens: number;
  subtotalCentavos: number;
  atualizadoEm: string;
}

export interface ItemPedido {
  id: string;
  produtoId: string;
  produtoNome: string;
  produtoSku: string;
  precoUnitCentavos: number;
  quantidade: number;
  subtotalCentavos: number;
  agendadoPara: string | null;
}

export interface HistoricoPedido {
  de: StatusPedido | null;
  para: StatusPedido;
  observacao: string | null;
  usuarioId: string | null;
  criadoEm: string;
}

export interface ResumoPedido {
  id: string;
  codigo: string;
  status: StatusPedido;
  totalCentavos: number;
  totalItens: number;
  cliente: { id: string; nome: string; email: string };
  criadoEm: string;
}

export interface Pedido extends ResumoPedido {
  subtotalCentavos: number;
  descontoCentavos: number;
  itens: ItemPedido[];
  historico: HistoricoPedido[];
  atualizadoEm: string;
}

export type MotivoProblema =
  'INDISPONIVEL' | 'ESTOQUE_INSUFICIENTE' | 'SLOT_SEM_VAGA' | 'HORARIO_INVALIDO';

/** Detalhe devolvido no 409 ITENS_INDISPONIVEIS. */
export interface ProblemaItem {
  produtoId: string;
  nome?: string;
  motivo: MotivoProblema;
  solicitado?: number;
  disponivel?: number;
  agendadoPara?: string | null;
}

export interface MetaPaginacao {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginado<T> {
  data: T[];
  meta: MetaPaginacao;
}

export type Ordenacao = 'preco' | 'nome' | 'recente';
export type Direcao = 'asc' | 'desc';

export interface FiltrosProduto {
  categoria?: string;
  busca?: string;
  tipo?: TipoProduto;
  /** Em centavos. */
  precoMin?: number;
  precoMax?: number;
  ordenar?: Ordenacao;
  direcao?: Direcao;
  page?: number;
  limit?: number;
  incluirInativos?: boolean;
}

export interface FiltrosPedido {
  status?: StatusPedido;
  usuarioId?: string;
  page?: number;
  limit?: number;
}

export interface FiltrosUsuario {
  role?: Papel;
  busca?: string;
  incluirInativos?: boolean;
  page?: number;
  limit?: number;
}

export interface ResumoDashboard {
  periodo: { de: string | null; ate: string | null };
  faturamentoCentavos: number;
  pedidos: number;
  ticketMedioCentavos: number;
  itensVendidos: number;
  porStatus: Record<StatusPedido, number>;
  serieDiaria: { data: string; faturamentoCentavos: number; pedidos: number }[];
}

export interface TopProduto {
  produtoId: string;
  nome: string;
  sku: string;
  quantidadeVendida: number;
  faturamentoCentavos: number;
}

/** Resposta bruta de /auth/login, /auth/register e /auth/refresh do back. Só o BFF a enxerga. */
export interface RespostaAuthBack {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: Usuario;
}

/** O que o BFF devolve ao navegador: nunca o refresh token. */
export interface SessaoPublica {
  usuario: Usuario;
  accessToken: string;
  /** Validade do accessToken em segundos. */
  expiresIn: number;
}

export interface ErroApi {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  timestamp?: string;
  path?: string;
}

export interface ProblemaValidacao {
  campo: string;
  mensagem: string;
  codigo: string;
}
