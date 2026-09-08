# Especificação Técnica — Front-end Web

Documento de referência para construção do front-end do desafio técnico.
Stack: **Next.js (App Router) + TypeScript + Tailwind + TanStack Query + React Hook Form + Zod**.

Consome a API especificada em `ESPECIFICACAO-BACKEND.md`.

---

## 1. Escopo e prioridades

### P0 — Obrigatório (cobrado explicitamente no enunciado)

- Listagem de produtos com nome, descrição e imagem
- Adicionar produto ao carrinho
- Visualizar carrinho com nome, quantidade e subtotal por item
- Atualizar quantidade e remover itens individualmente
- Valor total da compra
- Finalizar compra enviando os dados ao back-end

### P1 — Diferencial de alto retorno

- Todas as libs citadas nos diferenciais: RHF, TanStack Query, Zod, Tailwind, hooks
- Navegação por categorias hierárquicas
- Produto tipo **BOOKING** com seleção de data e horário
- Login e área administrativa com CRUD de produtos
- Estados tratados: loading com skeleton, vazio, erro, offline
- Atualização otimista no carrinho
- Acessibilidade: foco visível, navegação por teclado, ARIA nos componentes interativos

### P2 — Só se sobrar tempo

- Dashboard visual da operação
- Busca com debounce e filtros combinados na URL
- Paginação infinita no catálogo
- Tema escuro

---

## 2. Stack e justificativas

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 15 (App Router) | Citado no PDF; Server Components reduzem JS enviado |
| Linguagem | TypeScript strict | Contrato compartilhado com o back |
| Estilo | Tailwind CSS | Citado no PDF |
| Dados de servidor | TanStack Query v5 | Citado no PDF; cache, invalidação e otimismo |
| Formulários | React Hook Form | Citado no PDF; uncontrolled = menos re-render |
| Validação | Zod | Citado no PDF; **mesmos schemas do back** |
| Estado de UI | Zustand | Só para UI (drawer aberto, toasts). Dados de servidor são do Query |
| Componentes | Radix UI primitives | Acessibilidade de dialog/popover/select resolvida |
| Ícones | Lucide | Consistente e leve |
| Datas | date-fns + ptBR | Booking precisa de formatação e timezone |
| Testes | Vitest + Testing Library + Playwright | Unidade e um fluxo e2e |

**Regra que vale ponto:** os schemas Zod de entrada (login, cadastro, produto, checkout) ficam em `src/lib/schemas/` e são os mesmos usados no back-end. Se você conseguir extrair isso para um pacote compartilhado ou ao menos manter os arquivos idênticos, diga no README. Demonstra visão de monorepo sem precisar montar um.

**Estado de servidor não vai para Zustand.** Carrinho, produtos e pedidos vivem no TanStack Query. Zustand só guarda o que é puramente visual. Misturar os dois é o erro mais comum e um avaliador percebe rápido.

---

## 3. Direção visual

### O que a loja é

Um marketplace generalista que vende **produtos físicos** (eletrônicos, casa, moda, mercado) e **serviços agendados** (instalação, montagem, sessão de fotos). O público é comprador brasileiro comum, não especialista. O trabalho principal da interface é: encontrar, entender o preço, e comprar sem fricção.

A decisão central de design nasce daí: **os dois tipos de produto precisam ser distinguíveis no primeiro olhar**, porque a ação é diferente. Um você compra; o outro você agenda. Todo o sistema visual gira em torno de tornar isso óbvio sem precisar ler.

### Paleta

Duas cores de ação com significado fixo. Nunca use uma no papel da outra.

```css
--tinta:      #16202B;  /* texto, estrutura — azul-tinta, não preto */
--papel:      #FBFAF8;  /* fundo da página */
--branco:     #FFFFFF;  /* superfícies elevadas: cards, drawer, modal */
--verde-nota: #0E6B4F;  /* AÇÃO DE COMPRA: comprar, adicionar, confirmar */
--agenda:     #4B37A8;  /* AÇÃO DE AGENDAMENTO: escolher data, reservar */
--alerta:     #A8320F;  /* erro, estoque crítico, cancelado */
--borda:      #E4E1DB;  /* divisórias, contornos de card */
--suave:      #6B7580;  /* texto secundário, metadados */
```

Verde para comprar tem lógica de comércio (confirma, disponível, em estoque). Violeta para agendar cria um canal separado e memorável, e não é a dupla azul-e-laranja que toda loja usa.

Cor sozinha não pode carregar a informação. O tipo BOOKING também recebe um ícone de calendário e o rótulo textual "Agendar". Acessibilidade e clareza vêm juntas aqui.

### Tipografia

Duas famílias, papéis claramente distintos:

- **Archivo** — toda a interface: navegação, cards, formulários, tabelas. Pesos 400 / 500 / 600 / 700.
- **Fraunces** — apenas o wordmark da loja e os títulos de seção da home. Serifa variável, com personalidade, usada com parcimônia.

```css
--font-ui:      'Archivo', system-ui, sans-serif;
--font-display: 'Fraunces', Georgia, serif;
```

**Preços usam `font-variant-numeric: tabular-nums` sempre.** Numeral tabular alinha as casas decimais em listas e tabelas. É um detalhe pequeno que muda a percepção de qualidade de uma grade de produtos e mostra que você pensou no conteúdo, não só no layout.

Escala de tipo:

```
display   32/36  Fraunces 600     título de seção da home
h1        26/32  Archivo 700      nome do produto na página de detalhe
h2        20/28  Archivo 600      títulos de bloco
corpo     15/24  Archivo 400      descrição, texto geral
apoio     13/20  Archivo 400      metadados, marca, categoria
preço     22/28  Archivo 700 tab  preço principal
preço-sm  15/20  Archivo 600 tab  preço em card e linha de carrinho
```

Linha de texto de descrição: máximo 72 caracteres.

### Layout

Catálogo primeiro. **Sem carrossel promocional na home.** O elemento mais característico de um marketplace é o próprio acervo, então a home abre com a árvore de categorias e a grade de produtos. Banner de marketing seria decoração num projeto que não tem campanha nenhuma para anunciar.

```
DESKTOP — /  (home e catálogo)
┌──────────────────────────────────────────────────────────┐
│ [wordmark]   [busca ......................]  entrar  🛒3 │
├────────────┬─────────────────────────────────────────────┤
│ Eletrônicos│  Tudo na loja                    194 itens  │
│ Casa       │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐    │
│  Móveis    │  │ [img] │ │ [img] │ │ [img] │ │ [img] │    │
│  Decoração │  │ nome  │ │ nome  │ │ nome  │ │ nome  │    │
│ Moda       │  │R$ 000 │ │R$ 000 │ │R$ 000 │ │📅 000 │    │
│ Joias      │  │[Compr]│ │[Compr]│ │[Compr]│ │[Agend]│    │
│ Serviços   │  └───────┘ └───────┘ └───────┘ └───────┘    │
│            │  (…)                                        │
└────────────┴─────────────────────────────────────────────┘

MOBILE — filtro vira drawer, grade cai para 2 colunas
┌────────────────────┐
│ ≡  [wordmark]   🛒3│
│ [busca ..........] │
│ [Categorias ▾]     │
├────────────────────┤
│ ┌────────┐┌───────┐│
│ │ [img]  ││ [img] ││
│ │ nome   ││ nome  ││
│ │ R$ 000 ││📅 000 ││
│ └────────┘└───────┘│
└────────────────────┘
```

Alinhamento à esquerda em tudo. Grade de produto não centraliza texto — em listas escaneáveis, borda esquerda alinhada é o que permite ler em zigue-zague rápido.

**Carrinho é drawer lateral**, não página, para adicionar sem perder o lugar no catálogo. Existe também `/carrinho` como página cheia para a revisão antes do checkout, que é o que o enunciado pede como "visualizar o carrinho".

### Anatomia do card de produto

O card muda conforme o tipo. Essa é a aplicação concreta da decisão central.

```
SIMPLE                          BOOKING
┌─────────────────────┐         ┌─────────────────────┐
│ [imagem 4:3]        │         │ [imagem 4:3]        │
│                     │         │        ╲ faixa      │
├─────────────────────┤         ├───────── violeta ───┤
│ Marca               │         │ Serviço agendado  📅│
│ Nome do produto     │         │ Nome do serviço     │
│ em até duas linhas  │         │ em até duas linhas  │
│                     │         │ 2h · até 2 por dia  │
│ R$ 1.299,00         │         │ R$ 450,00           │
│ 12 em estoque       │         │                     │
│ [ Adicionar    ]    │         │ [ Escolher data  ]  │
└─────────────────────┘         └─────────────────────┘
       verde                           violeta
```

O card de booking tem uma faixa superior violeta de 3px e o rótulo do tipo. O botão nunca diz "Adicionar" — diz "Escolher data", porque o próximo passo é diferente e o botão precisa dizer exatamente o que acontece.

Sem sombra em card. Contorno de 1px em `--borda` e raio de 8px. Sombra fica reservada para o que realmente flutua: drawer, dropdown e modal. Isso cria hierarquia real em vez de aplicar o mesmo cartão a tudo.

### Movimento

Um único momento orquestrado: o **drawer do carrinho**, que entra em 180ms com `ease-out` e traz um destaque momentâneo na linha recém-adicionada. Isso responde a uma ação do usuário e mostra o que mudou.

Nada de entrada com fade-and-slide em cada seção, nada de transição de hover em todo card. Hover em card muda só a cor da borda, sem animação. `prefers-reduced-motion: reduce` desliga o deslocamento do drawer e mantém só a opacidade.

---

## 4. Estrutura de pastas

```
frontend/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # fontes, providers, header
│   │   ├── page.tsx                    # home = catálogo
│   │   ├── globals.css
│   │   ├── (loja)/
│   │   │   ├── categoria/[slug]/page.tsx
│   │   │   ├── produto/[id]/page.tsx
│   │   │   ├── carrinho/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   └── pedido/[codigo]/page.tsx
│   │   ├── (auth)/
│   │   │   ├── entrar/page.tsx
│   │   │   └── criar-conta/page.tsx
│   │   ├── (conta)/
│   │   │   ├── meus-pedidos/page.tsx
│   │   │   └── meus-pedidos/[codigo]/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx              # chrome próprio + guard de papel
│   │   │   ├── page.tsx                # dashboard
│   │   │   ├── produtos/page.tsx
│   │   │   ├── produtos/novo/page.tsx
│   │   │   ├── produtos/[id]/page.tsx
│   │   │   ├── pedidos/page.tsx
│   │   │   └── categorias/page.tsx
│   │   └── api/
│   │       └── auth/[...rota]/route.ts # BFF: troca token por cookie httpOnly
│   ├── components/
│   │   ├── ui/                         # botão, input, badge, skeleton, dialog
│   │   ├── produto/
│   │   │   ├── card-produto.tsx
│   │   │   ├── grade-produtos.tsx
│   │   │   ├── seletor-agendamento.tsx
│   │   │   └── filtros.tsx
│   │   ├── carrinho/
│   │   │   ├── drawer-carrinho.tsx
│   │   │   ├── linha-item.tsx
│   │   │   └── resumo-valores.tsx
│   │   ├── layout/
│   │   │   ├── cabecalho.tsx
│   │   │   ├── arvore-categorias.tsx
│   │   │   └── rodape.tsx
│   │   └── estados/
│   │       ├── vazio.tsx
│   │       ├── erro.tsx
│   │       └── skeletons.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── cliente.ts              # fetch com auth e tratamento de erro
│   │   │   ├── produtos.ts
│   │   │   ├── carrinho.ts
│   │   │   ├── pedidos.ts
│   │   │   └── categorias.ts
│   │   ├── hooks/
│   │   │   ├── use-produtos.ts
│   │   │   ├── use-carrinho.ts
│   │   │   ├── use-pedidos.ts
│   │   │   └── use-sessao.ts
│   │   ├── schemas/                    # espelhos dos schemas do back
│   │   ├── query-keys.ts
│   │   ├── formatadores.ts             # centavos → BRL, datas
│   │   └── tipos.ts
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   └── sessao-provider.tsx
│   └── stores/
│       └── ui-store.ts                 # só drawer, toasts, menu mobile
└── tests/
```

---

## 5. Rotas

| Rota | Acesso | Renderização | Observação |
|---|---|---|---|
| `/` | público | Server + hidratação | Catálogo completo |
| `/categoria/[slug]` | público | Server | Filtra por `caminho` |
| `/produto/[id]` | público | Server, `generateMetadata` | SEO: título e imagem |
| `/carrinho` | autenticado | Client | Revisão antes do checkout |
| `/checkout` | autenticado | Client | RHF + Zod |
| `/pedido/[codigo]` | dono | Server | Confirmação pós-compra |
| `/entrar`, `/criar-conta` | público | Client | Redireciona se já logado |
| `/meus-pedidos` | autenticado | Client | Lista do próprio usuário |
| `/admin/*` | ADMIN, COMERCIAL | Client | Chrome visualmente distinto |

**Proteção de rota em duas camadas.** O `middleware.ts` do Next verifica a presença do cookie de sessão e redireciona antes de renderizar; o layout de `/admin` verifica o papel. Mas deixe claro no README: **isso é conveniência de UX, não segurança**. A autorização real é do back-end. Um front que "esconde o botão" e um back que aceita a requisição está inseguro. Dizer isso explicitamente vale mais que qualquer proteção de front.

---

## 6. Camada de dados

### Cliente HTTP

```typescript
// lib/api/cliente.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public codigo: string,
    message: string,
    public detalhes?: unknown,
  ) { super(message); }
}

export async function api<T>(caminho: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${caminho}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (res.status === 204) return undefined as T;

  const corpo = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      corpo.error ?? 'ERRO_DESCONHECIDO',
      corpo.message ?? 'Não foi possível completar a operação',
      corpo.details,
    );
  }
  return corpo;
}
```

O `codigo` em `SCREAMING_SNAKE` que o back envia permite tratar erro sem parsear mensagem. `ESTOQUE_INSUFICIENTE` vira uma tela específica; qualquer outro cai no fallback genérico.

### Chaves de query centralizadas

```typescript
// lib/query-keys.ts
export const qk = {
  produtos: {
    todos: ['produtos'] as const,
    lista: (f: FiltrosProduto) => ['produtos', 'lista', f] as const,
    detalhe: (id: string) => ['produtos', 'detalhe', id] as const,
    disponibilidade: (id: string, data: string) =>
      ['produtos', id, 'disponibilidade', data] as const,
  },
  categorias: { arvore: ['categorias', 'arvore'] as const },
  carrinho: { atual: ['carrinho'] as const },
  pedidos: {
    meus: ['pedidos', 'meus'] as const,
    detalhe: (codigo: string) => ['pedidos', codigo] as const,
    admin: (f: FiltrosPedido) => ['pedidos', 'admin', f] as const,
  },
  dashboard: { resumo: (de: string, ate: string) => ['dashboard', de, ate] as const },
};
```

Chave espalhada em string literal pelo código é fonte garantida de invalidação errada. Centralizar é barato e o avaliador nota.

### Configuração do Query Client

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // catálogo não muda a cada segundo
      gcTime: 5 * 60_000,
      retry: (n, err) =>
        err instanceof ApiError && err.status >= 400 && err.status < 500
          ? false                  // não insiste em 4xx
          : n < 2,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
```

Nunca faça retry de `POST /pedidos`. Um retry automático de checkout é como um duplo-clique involuntário. A idempotência do back cobre, mas a mutação não deve nem tentar.

### Atualização otimista do carrinho

É o ponto onde o TanStack Query justifica estar no projeto. Sem isso, mudar quantidade tem latência visível.

```typescript
// lib/hooks/use-carrinho.ts
export function useAtualizarQuantidade() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantidade }: AtualizarItem) =>
      api(`/carrinho/itens/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantidade }),
      }),

    onMutate: async ({ itemId, quantidade }) => {
      await qc.cancelQueries({ queryKey: qk.carrinho.atual });
      const anterior = qc.getQueryData<Carrinho>(qk.carrinho.atual);

      qc.setQueryData<Carrinho>(qk.carrinho.atual, (velho) => {
        if (!velho) return velho;
        const itens = quantidade === 0
          ? velho.itens.filter((i) => i.id !== itemId)
          : velho.itens.map((i) =>
              i.id === itemId
                ? { ...i, quantidade, subtotalCentavos: i.precoUnitCentavos * quantidade }
                : i);
        return {
          ...velho,
          itens,
          totalCentavos: itens.reduce((s, i) => s + i.subtotalCentavos, 0),
        };
      });

      return { anterior };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.anterior) qc.setQueryData(qk.carrinho.atual, ctx.anterior);
      toast.erro('A quantidade não foi alterada. Tente de novo.');
    },

    onSettled: () => qc.invalidateQueries({ queryKey: qk.carrinho.atual }),
  });
}
```

Repare que o total é recalculado no otimismo, senão o número da tela fica errado por um instante — e é justamente o número que o usuário está olhando.

### Filtros na URL, não em estado

```
/?categoria=eletronicos&busca=fone&precoMin=100&ordenar=preco&page=2
```

Use `useSearchParams` + `router.replace`. Ganha link compartilhável, botão voltar funcionando e recarregamento preservando o contexto, sem uma linha de estado global. Debounce de 400ms no campo de busca.

---

## 7. Autenticação

### Decisão: BFF com cookie httpOnly

O back devolve `accessToken` e `refreshToken`. Guardar os dois em `localStorage` é o caminho comum e é vulnerável a XSS: qualquer script injetado lê o token.

A abordagem recomendada usa Route Handlers do Next como camada fina:

```
Navegador  →  POST /api/auth/entrar (Next)  →  POST /auth/login (Nest)
                      ↓
       Set-Cookie: sessao=<refresh>; HttpOnly; SameSite=Lax; Secure
                      ↓
       devolve só os dados públicos do usuário ao cliente
```

O access token fica em memória (contexto React), some ao recarregar e é recuperado silenciosamente via `/api/auth/refresh`, que lê o cookie httpOnly. JavaScript da página nunca enxerga o refresh token.

```typescript
// app/api/auth/entrar/route.ts
export async function POST(req: Request) {
  const corpo = await req.json();
  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });

  if (!res.ok) return Response.json(await res.json(), { status: res.status });

  const { accessToken, refreshToken, usuario } = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('sessao', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ usuario, accessToken });
}
```

Documente esse desenho no README, com uma frase sobre o trade-off (uma camada a mais de indireção em troca de não expor o refresh token ao JS). É exatamente o tipo de decisão que "o sistema deve ser seguro" está pedindo, e quase nenhum candidato faz no front.

Se o prazo apertar, `localStorage` é aceitável **desde que** você escreva no README que conhece o risco e o que faria diferente. Fingir que não existe é pior que a solução simples assumida.

---

## 8. Fluxo de compra

### Adicionar ao carrinho

```
Card SIMPLE → [Adicionar] → mutação → drawer abre com item destacado
```

Se não estiver logado, guarde a intenção e mande para `/entrar?voltar=/produto/123`. Após o login, retome a ação. Perder o clique do usuário é fricção evitável.

### Adicionar serviço agendado

```
Card BOOKING → [Escolher data] → /produto/:id
   → calendário (bloqueia passado, fins de semana e datas sem vaga)
   → escolhe dia → busca GET /produtos/:id/disponibilidade?data=…
   → lista de horários com vaga  [09:00] [11:00] [14:00] [16:00]
   → escolhe horário → [Agendar e adicionar]
```

O componente `seletor-agendamento.tsx` mantém `data` e `horario` em estado local e só habilita o botão quando ambos existem. A query de disponibilidade tem `staleTime: 0` e refetch ao focar a janela — vaga é dado que muda enquanto o usuário pensa.

Exiba o fuso explicitamente: "Quinta, 12 de setembro, 14:00 (horário de Brasília)". Ambiguidade de horário em agendamento gera reclamação real.

### Checkout

Um formulário só, com React Hook Form e o mesmo schema Zod do back:

```typescript
const schemaCheckout = z.object({
  nome: z.string().min(3, 'Informe o nome completo'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().regex(/^\d{10,11}$/, 'Informe DDD e número, só dígitos'),
  observacao: z.string().max(500).optional(),
}).strict();

const form = useForm<z.infer<typeof schemaCheckout>>({
  resolver: zodResolver(schemaCheckout),
  defaultValues: { nome: usuario.nome, email: usuario.email },
  mode: 'onBlur',
});
```

`mode: 'onBlur'` valida ao sair do campo. Validar a cada tecla mostra "e-mail inválido" enquanto a pessoa ainda digita a primeira letra, o que é hostil.

### Idempotência

Gere a chave **uma vez** por tentativa de checkout, não a cada render:

```typescript
const chaveIdempotencia = useRef(crypto.randomUUID());

const finalizar = useMutation({
  mutationFn: (dados) => api('/pedidos', {
    method: 'POST',
    headers: { 'Idempotency-Key': chaveIdempotencia.current },
    body: JSON.stringify(dados),
  }),
  onSuccess: (pedido) => {
    qc.invalidateQueries({ queryKey: qk.carrinho.atual });
    router.push(`/pedido/${pedido.codigo}`);
  },
});
```

Botão desabilitado durante `isPending`, com o texto mudando para "Finalizando…". Nunca deixe um botão de compra clicável duas vezes.

### Tratamento de 409 no checkout

O caso mais interessante da tela. O back devolve a lista de itens que ficaram indisponíveis entre o "adicionar" e o "finalizar":

```typescript
if (erro.codigo === 'ITENS_INDISPONIVEIS') {
  // painel dentro da própria página, não toast
  // lista item por item com o motivo
  // botão "Atualizar carrinho e continuar" remove/ajusta os problemáticos
}
```

Resolver isso bem mostra que você entendeu que o carrinho é uma foto, não uma reserva. Poucos candidatos tratam esse caso.

---

## 9. Área administrativa

Chrome visualmente distinto da loja: fundo `--tinta` no cabeçalho, densidade maior, sem a serifa da vitrine. O usuário precisa saber num relance que está numa ferramenta interna, não na loja.

| Tela | Conteúdo |
|---|---|
| `/admin` | Cards de resumo, série de faturamento, top produtos |
| `/admin/produtos` | Tabela com busca, filtro por categoria e status, paginação |
| `/admin/produtos/novo` | Formulário RHF + Zod; campos de booking aparecem ao escolher o tipo |
| `/admin/produtos/[id]` | Edição + botão de desativar (soft delete) |
| `/admin/pedidos` | Tabela com filtro por status; troca de status inline |
| `/admin/categorias` | Árvore com criar, renomear e reordenar |

O formulário de produto é onde RHF brilha: campo `tipo` controla condicionalmente `duracaoMin` e `capacidadeSlot`, com `watch('tipo')` e um refinamento no Zod:

```typescript
.superRefine((v, ctx) => {
  if (v.tipo === 'BOOKING' && !v.duracaoMin) {
    ctx.addIssue({ path: ['duracaoMin'], code: 'custom',
      message: 'Serviços agendados precisam de duração' });
  }
});
```

Preço no formulário: aceite `R$ 1.299,90` com máscara e converta para centavos inteiros antes de enviar. A conversão é uma função pura em `formatadores.ts`, com teste unitário. Arredondamento de dinheiro é onde nascem bugs silenciosos.

---

## 10. Estados de interface

Toda tela que busca dados precisa dos quatro estados. Faltar um é o que faz um projeto parecer inacabado.

| Estado | Tratamento |
|---|---|
| Carregando | Skeleton com a forma real do conteúdo, não spinner centralizado |
| Vazio | Ilustração leve + frase de direção + ação |
| Erro | Explica o que houve e oferece "Tentar de novo" |
| Sem permissão | Diz o que a conta atual pode fazer, não só "acesso negado" |

**Copy dos estados.** Erro não pede desculpa e não é vago. Tela vazia é convite para agir.

```
Carrinho vazio
  "Seu carrinho está vazio."
  [Ver produtos]

Busca sem resultado
  "Nenhum produto encontrado para 'xyz'."
  "Tente outro termo ou remova os filtros."
  [Limpar filtros]

Falha de rede
  "Não foi possível carregar os produtos."
  "Verifique sua conexão."
  [Tentar de novo]

Estoque insuficiente no checkout
  "Fone Bluetooth XZ: você pediu 3, restam 1."
  [Atualizar carrinho e continuar]
```

Evite "Ops!", "Algo deu errado" e ponto de exclamação em erro. O usuário quer saber o que fazer, não ser consolado.

---

## 11. Acessibilidade e performance

**Acessibilidade — piso obrigatório:**
- Foco visível em tudo (`focus-visible:ring-2 ring-verde-nota ring-offset-2`)
- Drawer e modal com trap de foco e fechamento por `Esc` (Radix já entrega)
- `aria-live="polite"` no total do carrinho, para leitor de tela anunciar a mudança
- Botão de quantidade com `aria-label` explícito ("Aumentar quantidade de Fone Bluetooth XZ")
- Contraste mínimo 4.5:1 em texto; verifique `--suave` sobre `--papel`
- Imagem de produto com `alt` = nome do produto; imagem decorativa com `alt=""`
- Navegação completa por teclado no fluxo comprar → carrinho → checkout

**Performance:**
- `next/image` com `sizes` correto e `priority` só nas 4 primeiras imagens da grade
- Catálogo e detalhe como Server Components; interatividade isolada em ilhas `'use client'`
- Prefetch do detalhe ao passar o mouse no card
- `loading.tsx` por rota, aproveitando o streaming do App Router
- Meta: LCP abaixo de 2.5s em localhost, sem bundle de página acima de 200kb gzip

---

## 12. Testes

**Unitários (Vitest)**
1. `centavosParaBRL` e `brlParaCentavos` — ida e volta, arredondamento, zero
2. Cálculo do total do carrinho no otimismo
3. Geração de slots exibíveis a partir da resposta de disponibilidade
4. Schema de checkout: rejeita e-mail inválido, telefone curto, campo extra

**Componente (Testing Library)**
5. `CardProduto` renderiza "Adicionar" para SIMPLE e "Escolher data" para BOOKING
6. Quantidade zero na linha do carrinho dispara remoção
7. Botão de finalizar fica desabilitado durante o envio

**E2E (Playwright)**
8. Fluxo completo: entrar → adicionar produto → alterar quantidade → finalizar → tela de confirmação

Mock de API com MSW nos testes de componente. O e2e roda contra o back real com o seed.

---

## 13. Ordem de execução

| # | Etapa | Prioridade |
|---|---|---|
| 1 | Next + Tailwind + tokens de design + fontes + `globals.css` | P0 |
| 2 | Componentes base em `ui/`: botão, input, badge, skeleton, dialog | P0 |
| 3 | Cliente HTTP, query keys, providers | P0 |
| 4 | Catálogo: grade, card, detalhe do produto | P0 |
| 5 | Árvore de categorias + filtros na URL | P1 |
| 6 | Carrinho: drawer, linha, otimismo, página `/carrinho` | P0 |
| 7 | Auth: BFF, login, cadastro, guard de rota | P1 |
| 8 | Checkout com RHF + Zod + idempotência + tela de confirmação | P0 |
| 9 | Tratamento do 409 de itens indisponíveis | P1 |
| 10 | Booking: calendário, horários, validação | P1 |
| 11 | Admin: produtos e pedidos | P1 |
| 12 | Estados vazios, erro e skeletons em todas as telas | P0 |
| 13 | Testes | P1 |
| 14 | README + responsividade final + revisão de acessibilidade | P0 |
| 15 | Dashboard visual | P2 |

Se o prazo apertar, corte na ordem: 15, 11, 10. **Nunca corte 12 e 14** — é o que separa "funciona na minha máquina" de "parece um produto".

---

## 14. README do front-end

```markdown
# E-commerce Web

## Stack
## Pré-requisitos (Node 20+, back-end rodando em :3000)
## Como rodar
    cp .env.local.example .env.local
    npm install
    npm run dev
    # http://localhost:3001
## Contas de teste
## Fluxos para avaliar
    1. Catálogo → filtro por categoria → detalhe do produto
    2. Adicionar ao carrinho → alterar quantidade → remover
    3. Serviço agendado → escolher data e horário → adicionar
    4. Checkout → confirmação → e-mail no Mailhog (localhost:8025)
    5. Login como admin → cadastrar produto → ver na loja
## Decisões técnicas
    - Estado de servidor no TanStack Query, estado de UI no Zustand
    - Schemas Zod compartilhados com o back
    - Token de refresh em cookie httpOnly via BFF
    - Filtros na URL em vez de estado global
    - Atualização otimista no carrinho
## Direção visual
    - Verde = comprar, violeta = agendar; cor nunca sozinha
    - Numerais tabulares em preços
    - Catálogo como herói, sem banner promocional
## Acessibilidade
## Testes
## O que ficou de fora e por quê
```

---

## 15. Checklist de entrega

- [ ] `npm i && npm run dev` funciona com o back no ar, sem passo escondido
- [ ] `.env.local` no gitignore, `.env.local.example` commitado
- [ ] Nenhuma chamada de API com URL hardcoded
- [ ] Quatro estados (carregando, vazio, erro, sucesso) em toda tela que busca dados
- [ ] Responsivo de 360px até desktop, testado de verdade
- [ ] Foco visível em todos os interativos; fluxo de compra navegável só por teclado
- [ ] Preços com numeral tabular e formatação `pt-BR` correta
- [ ] Botão de finalizar impossível de clicar duas vezes
- [ ] 409 de estoque tratado com painel específico, não toast genérico
- [ ] Produto BOOKING visualmente distinto do SIMPLE, com fuso explícito
- [ ] Admin com chrome distinto e guard de papel
- [ ] Nenhum `console.log`, nenhum `any` solto, sem warning no build
- [ ] Testes passando
- [ ] README com os cinco fluxos de avaliação numerados
```
