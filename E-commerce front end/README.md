# Balcão — E-commerce Web

Front-end do desafio técnico de e-commerce. **Balcão** é um marketplace que vende produtos físicos (eletrônicos, casa, moda, mercado…) e serviços agendados (instalação, montagem, sessão de fotos). O nome vem daí: no balcão você compra e também marca hora.

Consome a API NestJS do repositório do back-end (`E-commerce back end`), que precisa estar no ar em `http://localhost:3000`.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · TanStack Query 5 · React Hook Form 7 · Zod 4 · Zustand 5 · Radix UI · Vitest + Testing Library + MSW · Playwright

---

## Sumário

1. [Stack e justificativas](#1-stack-e-justificativas)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Como rodar](#3-como-rodar)
4. [Contas de teste](#4-contas-de-teste)
5. [Fluxos para avaliar](#5-fluxos-para-avaliar)
6. [Decisões técnicas](#6-decisões-técnicas)
7. [Direção visual](#7-direção-visual)
8. [Acessibilidade](#8-acessibilidade)
9. [Testes](#9-testes)
10. [Estrutura do projeto](#10-estrutura-do-projeto)
11. [Scripts](#11-scripts)
12. [Solução de problemas](#12-solução-de-problemas)
13. [O que ficou de fora e por quê](#13-o-que-ficou-de-fora-e-por-quê)

---

## 1. Stack e justificativas

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 16.3** (App Router, Turbopack) | Citado no desafio. Server Components renderizam catálogo e detalhe com dados; a interatividade fica em ilhas `'use client'`. A 16 é a versão estável no momento da entrega: `middleware.ts` virou `proxy.ts`, `params`/`cookies()` são assíncronos e há os helpers globais `PageProps`/`LayoutProps`. |
| Linguagem | **TypeScript strict** | Contrato tipado ponta a ponta; `src/lib/tipos.ts` espelha os DTOs de saída do back. Nenhum `any`. |
| Estilo | **Tailwind CSS 4** | Citado no desafio. Na versão 4 os tokens ficam no CSS (`@theme` em `globals.css`), não em `tailwind.config.ts`. A paleta padrão foi removida: só existem as cores do sistema de design. |
| Dados de servidor | **TanStack Query 5** | Citado no desafio. Cache, invalidação, `placeholderData` para paginar sem piscar e atualização otimista do carrinho. Prefetch no servidor + `HydrationBoundary`. |
| Formulários | **React Hook Form 7** | Citado no desafio. Uncontrolled = menos re-render; `useWatch` para campos condicionais (compatível com o React Compiler). |
| Validação | **Zod 4** | Citado no desafio. Os mesmos schemas do back (ver [6](#6-decisões-técnicas)). Locale `pt` para as mensagens padrão. |
| Estado de UI | **Zustand 5** | Só o que é puramente visual: drawer aberto, item destacado, menu mobile, toasts. |
| Componentes | **Radix UI** (dialog, select, dropdown, collapsible, slot) | Trap de foco, `Esc`, ARIA e navegação por teclado resolvidos. |
| Ícones | Lucide | Consistente e leve. |
| Datas | date-fns 4 (calendário) + `Intl` (fuso) | O back guarda UTC e a agenda é em `America/Sao_Paulo`. Toda formatação de horário passa por `Intl` com o fuso explícito, independentemente de onde o navegador está. |
| Testes | Vitest 5 + Testing Library + MSW 2 + Playwright | Unidade, componente (com API mockada) e um fluxo E2E contra o back real. |

---

## 2. Pré-requisitos

- **Node.js 20+** (testado com 24) e npm 10+
- **Back-end no ar** em `http://localhost:3000` com Postgres, migrations e seed (`npm run migration:run && npm run seed` lá). O `.env.example` do back já vem com `CORS_ORIGIN=http://localhost:3001`, que é a porta deste front.
- **Mailpit** (sobe com o `docker compose up -d` do back) em `http://localhost:8025`, para ver o e-mail de confirmação.

---

## 3. Como rodar

```bash
cp .env.local.example .env.local   # Windows (PowerShell): Copy-Item .env.local.example .env.local
npm install
npm run dev
# http://localhost:3001
```

Build de produção:

```bash
npm run build
npm start                          # também em http://localhost:3001
```

Variáveis (todas com padrão para localhost em `.env.local.example`):

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API vista pelo navegador |
| `API_URL` | URL da API vista pelo servidor Next (Server Components e BFF). Em Docker seria o nome do serviço. |
| `NEXT_PUBLIC_MAILPIT_URL` | Link para a caixa de e-mails local nas telas de checkout e confirmação |
| `NEXT_PUBLIC_CONTAS_TESTE` | `true` mostra as contas do seed na tela de login (só para avaliação) |

Nenhuma URL de API está fixa no código: tudo passa por `src/lib/api/cliente.ts`.

---

## 4. Contas de teste

Criadas pelo `npm run seed` do back-end:

| E-mail | Senha | Papel | Pode |
|---|---|---|---|
| `cliente@loja.local` | `Cliente@123` | CLIENTE | Carrinho, finalizar compra, acompanhar os próprios pedidos |
| `comercial@loja.local` | `Comercial@123` | COMERCIAL | Ver todos os pedidos, mudar status, painel de vendas |
| `admin@loja.local` | `Admin@123` | ADMIN | Tudo do comercial + CRUD de produtos, categorias e usuários |

Com `NEXT_PUBLIC_CONTAS_TESTE=true` (padrão do exemplo) elas aparecem em `/entrar` com um botão "Preencher". Qualquer pessoa pode criar conta em `/criar-conta` e vira CLIENTE.

> A API só permite carrinho para o papel CLIENTE. Se você entrar como admin e clicar em "Adicionar", a loja explica isso em vez de falhar em silêncio.

---

## 5. Fluxos para avaliar

1. **Catálogo → categoria → detalhe.** Abra `/`, use a árvore à esquerda (ou o menu ≡ no mobile), filtre por tipo e preço, ordene. Os filtros ficam na URL: recarregue ou compartilhe o link. Clique num produto: a página é renderizada no servidor com `generateMetadata`.
2. **Carrinho.** Entre como `cliente@loja.local`. Clique em "Adicionar": o drawer abre com a linha recém-adicionada destacada. Altere a quantidade (a tela responde antes da API: atualização otimista) e remova itens. `/carrinho` é a revisão em página cheia.
3. **Serviço agendado.** Vá em *Serviços* (ou `/categoria/servicos`). Os cards são violeta, com a faixa de agenda no lugar da foto. "Escolher data" → calendário bloqueia passado e fim de semana → escolha um dia → horários com vagas → "Agendar e adicionar". O horário aparece sempre com o fuso: "Quinta, 12 de setembro, 14:00 (horário de Brasília)".
4. **Checkout → confirmação → e-mail.** "Finalizar compra" no drawer ou em `/carrinho`. Confira os itens e o nome, finalize (o botão trava durante o envio e leva uma `Idempotency-Key`). A confirmação mostra o código `PED-…`; o e-mail está em `http://localhost:8025`.
5. **Admin.** Entre como `admin@loja.local` → menu da conta → *Área administrativa*. Cadastre um produto em `/admin/produtos/novo` (escolha "Serviço agendado" para ver os campos condicionais) e veja-o na loja. Em `/admin/pedidos`, mude o status do pedido que você acabou de fazer; `/admin` mostra o painel do período.

Vale testar também:

- **Intenção preservada:** deslogado, clique em "Adicionar" num produto. Faça login: o item entra no carrinho e você volta para onde estava.
- **409 de itens indisponíveis:** em duas abas, coloque no carrinho mais unidades de um produto do que o estoque permite (o admin pode reduzir o estoque em `/admin/produtos/[id]`). Ao finalizar, um painel dentro da página lista item por item o motivo e oferece "Atualizar carrinho e continuar".
- **Sem permissão com contexto:** entre como cliente e abra `/admin`. A tela diz o que a sua conta pode fazer, não só "acesso negado".
- **Voltar do navegador** no catálogo: cada mudança de página entra no histórico; mudança de filtro substitui a entrada.

---

## 6. Decisões técnicas

**Estado de servidor no TanStack Query; estado de UI no Zustand.** Carrinho, produtos, pedidos, categorias e dashboard vivem no Query, com todas as chaves centralizadas em `src/lib/query-keys.ts`. O Zustand guarda só o que é visual (drawer, toasts, menu mobile). Misturar os dois é o erro mais comum, e aqui a fronteira é explícita.

**Schemas Zod compartilhados com o back.** `src/lib/schemas/` espelha `src/modules/*/dto/*.dto.ts` do back-end: `loginSchema`, `registerSchema`, `nomeSchema`/`emailSchema`/`senhaSchema`, `updateMeSchema`, `createProductSchema` (com o mesmo `errosCamposBooking` e `superRefine`), `updateProductSchema`, `createCategorySchema`, `changeOrderStatusSchema`, `listProductsQuerySchema`. As regras **e as mensagens** são idênticas; a única diferença é que as classes `createZodDto` do Nest não existem aqui e os enums TS viraram `z.enum`. A interface capitaliza a primeira letra da mensagem ao exibir (`capitalizarMensagem`), então o texto de origem continua o mesmo. Os formulários têm schemas derivados (ex.: confirmação de senha, preço digitado como "R$ 1.299,90"), mas o payload final passa pelo schema compartilhado antes de sair. Em um monorepo isso seria um pacote `@loja/schemas`; sem monorepo, os arquivos foram mantidos idênticos linha a linha onde possível.

**Autenticação: BFF com cookie httpOnly.** O back devolve `accessToken` (15 min) e `refreshToken` (rotativo, 7 dias). Guardar os dois em `localStorage` é vulnerável a XSS. Aqui:

```
Navegador → POST /api/auth/entrar (Next) → POST /auth/login (Nest)
                    ↓
      Set-Cookie: balcao_sessao=<refresh>; HttpOnly; SameSite=Lax; Path=/api/auth
      Set-Cookie: balcao_logado=1 (legível, sem valor de autenticação)
                    ↓
      devolve { usuario, accessToken, expiresIn } — nunca o refresh token
```

- O access token fica **em memória** (`src/lib/api/auth-token.ts`). Some ao recarregar e é recuperado em silêncio por `POST /api/auth/refresh`, que lê o cookie. JavaScript da página nunca enxerga o refresh token.
- O cookie do refresh tem `Path=/api/auth`: só viaja para as quatro rotas do BFF, não para toda página. O marcador `balcao_logado` (sem httpOnly) é o que o `proxy.ts` usa para redirecionar rotas privadas e o que o layout raiz lê para decidir se o cliente tenta renovar.
- **Refresh token rotativo é de uso único** e o back trata reuso como roubo (revoga a família inteira). Três defesas contra a corrida: `navigator.locks` serializa abas; o módulo de token faz single-flight dentro da aba (cinco 401 simultâneos = uma renovação); e o BFF mantém um mapa de promessas por token para absorver requisições concorrentes ao mesmo refresh.
- Renovação proativa aos 80% da validade, e retry automático de uma requisição que recebeu 401.
- Trade-off assumido: uma camada a mais de indireção (quatro route handlers) em troca de não expor o refresh token ao JS.

**Proteção de rota em duas camadas, e isso é UX, não segurança.** `src/proxy.ts` redireciona `/carrinho`, `/checkout`, `/pedido`, `/meus-pedidos`, `/conta` e `/admin` para `/entrar?voltar=…` quando não há marcador de sessão. `GuardaSessao` (usado pelas páginas e pelo layout do admin) confere o papel depois que a sessão resolve. **A autorização real é do back-end**, que recusa qualquer requisição sem token válido ou com papel errado. Um front que "esconde o botão" e um back que aceita a requisição está inseguro; aqui o back é a autoridade e o front só evita telas inúteis.

**Filtros na URL, não em estado.** `/?busca=fone&tipo=SIMPLE&precoMin=100&ordenar=preco-asc&page=2`. `useFiltrosCatalogo` lê com `useSearchParams` e escreve com `router.replace` (filtros) ou `router.push` (página). Link compartilhável, botão voltar funcionando, recarregamento preservando o contexto. Busca com 400 ms de atraso. Na URL o preço é em reais (legível); para a API vira centavos. Cada campo é validado sozinho: `precoMax=abc` é ignorado sem derrubar os outros.

**Atualização otimista no carrinho.** `useAtualizarQuantidade` e `useRemoverItem` aplicam a mudança no cache antes da resposta com uma função pura (`aplicarQuantidade`, testada), **recalculando o total** — senão o número que o usuário está olhando fica errado por um instante. Erro devolve o estado anterior e avisa. Cliques em sequência não se atropelam: só a última mutação em voo escreve no cache (`isMutating`).

**Checkout sem corpo.** `POST /pedidos` do back não recebe dados: o pedido nasce do carrinho ativo e nome/e-mail vêm da conta. A especificação sugeria telefone e observação, mas a API não os persiste, e inventar campos que vão para o nada seria desonesto. O único dado editável no checkout é o **nome**, validado com o mesmo `nomeSchema` do back e enviado a `PATCH /usuarios/me` antes de finalizar — é ele que entra no snapshot do pedido e no e-mail.

**Idempotência.** A chave é gerada uma vez por tentativa (inicializador preguiçoso de `useState`), enviada no header `Idempotency-Key`, e só trocada quando o carrinho muda após um 409. O botão fica desabilitado durante o envio e o texto muda para "Finalizando…". A mutação de finalizar nunca faz retry.

**409 `ITENS_INDISPONIVEIS`.** O carrinho é uma foto, não uma reserva. Quando o estoque ou a vaga mudam entre o "adicionar" e o "finalizar", o back devolve a lista de problemas por item. O front mostra um painel dentro da página (não um toast) com o motivo de cada item ("você pediu 3, restam 1", "o horário escolhido lotou") e o botão "Atualizar carrinho e continuar" ajusta as quantidades ou remove os itens, invalida o cache e gera uma chave nova.

**Renderização.** Catálogo, categoria e detalhe são Server Components: o servidor faz o prefetch no TanStack Query (um `QueryClient` por requisição via `React.cache`) e hidrata o cliente com `HydrationBoundary`; a mesma chave é usada nos dois lados. Se a API estiver fora, o prefetch não segura a página (sem retry no servidor) e a ilha cliente mostra o erro com "Tentar de novo". Páginas autenticadas são Client Components: o servidor Next só tem o cookie de refresh e não pode rotacioná-lo sem correr contra o cliente. `next/image` com `sizes` correto, `priority` só nas 4 primeiras imagens da grade e `remotePatterns` restrito ao CDN do seed. Prefetch do detalhe ao passar o mouse no card.

**Erros pelo código, nunca pela mensagem.** `ApiError` carrega o `error` em SCREAMING_SNAKE que o back envia (`ITENS_INDISPONIVEIS`, `CREDENCIAIS_INVALIDAS`, `EMAIL_JA_CADASTRADO`, `SKU_JA_EXISTE`, `VALIDACAO` com `details[]` mapeados para os campos do formulário). Falha de rede é `status 0` e vira a tela de "verifique sua conexão".

---

## 7. Direção visual

A loja vende duas coisas que exigem ações diferentes: um produto você **compra**, um serviço você **agenda**. Todo o sistema visual existe para tornar isso óbvio sem precisar ler.

- **Verde = comprar, violeta = agendar.** `--verde-nota #0E6B4F` só em comprar/adicionar/confirmar; `--agenda #4B37A8` só em escolher data/agendar. Nunca uma no papel da outra. Cor nunca carrega a informação sozinha: o card de serviço tem faixa superior, ícone de calendário e o rótulo "Serviço agendado"; o botão diz "Escolher data", não "Adicionar".
- **A faixa de agenda.** Os serviços do seed não têm foto. Em vez de um retângulo cinza, o card mostra o dia de atendimento (09h–18h) como uma régua violeta com a duração do serviço desenhada como bloco. Na página do produto a mesma faixa encabeça o seletor e o bloco se move para o horário escolhido; no carrinho e no pedido aparece o horário agendado por extenso (o item do carrinho não traz a duração do serviço, então a régua não teria o que desenhar). É a assinatura da loja e nasce do próprio assunto: o dia de trabalho de quem presta o serviço.
- **Tipografia.** Archivo em toda a interface; Fraunces só no wordmark (com o eixo `SOFT` ligado) e nos títulos de seção da home. **Preços sempre com numeral tabular** (`.preco`): as casas decimais alinham em qualquer lista.
- **Catálogo como herói.** Sem carrossel promocional: a home abre com a árvore de categorias e a grade. Tudo alinhado à esquerda. Card sem sombra, contorno de 1 px, raio de 8 px; sombra só para o que flutua (drawer, menu, modal).
- **Um único momento orquestrado:** o drawer do carrinho entra em 180 ms com `ease-out` e destaca a linha recém-adicionada. Hover em card só muda a borda. `prefers-reduced-motion` mantém só a opacidade.
- **Contraste conferido:** o `--suave #6B7580` da especificação dava 4,49:1 sobre o papel, um fio abaixo de 4,5. Foi ajustado para `#5F6975` (5,3:1).
- **Admin com chrome próprio:** cabeçalho em tinta, densidade maior, sem a serifa. Quem entra sabe num relance que está numa ferramenta interna.
- **Copy:** erro não pede desculpa nem é vago ("Não foi possível carregar os produtos. Verifique sua conexão. [Tentar de novo]"); tela vazia é convite para agir ("Seu carrinho está vazio. [Ver produtos]"); sem "Ops!" nem ponto de exclamação.

---

## 8. Acessibilidade

- Foco visível em todos os interativos (`:focus-visible` global, verde, 2 px de offset).
- Drawer, modais e menus com trap de foco, `Esc` e retorno do foco (Radix). Menu mobile e filtros abrem em `dialog`.
- `aria-live="polite"` no total do carrinho, no contador de resultados do catálogo, na escolha de data/horário e nos toasts.
- Botões de quantidade com rótulo explícito: "Aumentar quantidade de Fone Bluetooth XZ"; "Diminuir quantidade de … para zero" quando o próximo passo é remover.
- Contraste mínimo 4,5:1 em texto (ver a nota sobre `--suave`).
- Imagem de produto com `alt` = nome; ícones decorativos com `aria-hidden`; a faixa de agenda é um `img` com descrição textual.
- Calendário e horários são botões com `aria-pressed` e rótulo completo ("quinta-feira, 10 de setembro (sem atendimento)"); o estado desabilitado tem motivo.
- Fluxo comprar → carrinho → checkout navegável só por teclado. Link "Pular para o conteúdo".
- Formulários com `aria-describedby` ligando dica e erro, `aria-invalid`, `autocomplete` correto e validação `onBlur` (não a cada tecla).

---

## 9. Testes

```bash
npm test            # Vitest: unidade + componente (MSW)
npm run test:e2e    # Playwright contra o back real com o seed (API em :3000 e front em :3001)
```

Na primeira vez: `npx playwright install chromium`.

**Unitários** (`tests/*.test.ts`)
1. `centavosParaBRL` e `brlParaCentavos`: formatos de entrada, arredondamento da terceira casa, zero, ida e volta sem perder centavos.
2. `aplicarQuantidade`: recálculo do subtotal e do total no otimismo, zero remove, indisponível fora do total, sem mutação.
3. Agenda: minutos no fuso, posição na faixa, slots por dia, dia útil, data passada, manhã/tarde.
4. Schemas: login e cadastro (regras do back, campo extra rejeitado), checkout, formulário de produto → payload → `createProductSchema`, filtros da URL tolerantes a valor inválido.

**Componente** (`tests/*.test.tsx`, Testing Library + MSW)
5. `CardProduto` renderiza "Adicionar" para SIMPLE e "Escolher data" para BOOKING; esgotado desabilita.
6. `LinhaItem`: quantidade zero (botão ou campo) dispara remoção; avisos de preço alterado e item fora de venda.
7. `FormularioCheckout` com API mockada: botão desabilitado e `aria-busy` durante o envio, `Idempotency-Key` enviada uma vez mesmo com dois cliques, redirecionamento para a confirmação; 409 abre o painel com o motivo por item; nome alterado vai para `PATCH /usuarios/me` antes do pedido.

**E2E** (`e2e/compra.spec.ts`, Playwright)
8. Entrar → adicionar produto → alterar quantidade no drawer → finalizar → tela de confirmação com código `PED-…`.
9. Serviço agendado: escolher dia e horário → adicionar → drawer mostra a data.

---

## 10. Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx                 # fontes, providers, marcador de sessão
│   ├── (loja)/                    # chrome da loja: cabeçalho, rodapé, drawer do carrinho
│   │   ├── page.tsx               # home = catálogo (prefetch + hidratação)
│   │   ├── categoria/[slug]/      # catálogo filtrado por caminho
│   │   ├── produto/[id]/          # detalhe com generateMetadata, loading e not-found
│   │   ├── carrinho/ checkout/ pedido/[id]/ meus-pedidos/ conta/
│   ├── (auth)/entrar, criar-conta # chrome mínimo
│   ├── admin/                     # layout escuro + guarda de papel; resumo, produtos, pedidos, categorias, usuários
│   ├── api/auth/                  # BFF: entrar, criar-conta, refresh, sair
│   └── error.tsx, not-found.tsx
├── proxy.ts                       # 1ª camada de proteção de rota (cookie marcador)
├── components/
│   ├── ui/                        # botão, campo, badge, esqueleto, dialog, select, menu, toaster, preço, paginação, faixa-agenda, imagem-produto, tabela
│   ├── produto/                   # catálogo, grade, card, filtros, calendário, seletor de agendamento, detalhe
│   ├── carrinho/                  # drawer, linha, resumo, formulário de checkout
│   ├── pedido/                    # cabeçalho, itens, totais, linha do tempo
│   ├── layout/                    # cabeçalho, busca, árvore de categorias, guardas, rodapé
│   ├── conta/                     # formulários de entrar e cadastro
│   ├── admin/                     # chrome, dashboard, gráfico, tabelas, formulário de produto, categorias
│   └── estados/                   # vazio, erro, esqueletos, sem-permissão
├── lib/
│   ├── api/                       # cliente.ts (fetch + ApiError + renovação), um módulo por recurso, servidor.ts
│   ├── auth/bff.ts                # cookies e chamadas ao back (server-only)
│   ├── hooks/                     # use-carrinho (otimismo), use-produtos, use-pedidos, use-filtros-catalogo, use-acao-adicionar…
│   ├── schemas/                   # espelhos dos schemas do back + schemas de formulário
│   ├── query-keys.ts  formatadores.ts  agenda.ts  constantes.ts  tipos.ts  utils.ts
├── providers/                     # QueryProvider, SessaoProvider
└── stores/ui-store.ts             # só drawer, toasts, menus
tests/                             # Vitest (unidade + componente)
e2e/                               # Playwright
```

---

## 11. Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em `:3001` |
| `npm run build` · `npm start` | Build de produção · serve o build em `:3001` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config do Next 16 + regras do React Compiler) |
| `npm test` · `npm run test:watch` | Vitest |
| `npm run test:e2e` | Playwright (sobe o dev server se preciso) |
| `npm run check` | typecheck + lint + testes |
| `npm run format` | Prettier |

Estado na entrega: `typecheck`, `lint` (0 problemas), `test` (43 testes) e `build` (0 avisos) passando.

---

## 12. Solução de problemas

**"Não foi possível conectar ao servidor" em toda tela.** A API não está em `http://localhost:3000`. No back: `docker compose up -d`, `npm run migration:run`, `npm run seed`, `npm run start:dev`.

**Erro de CORS no console.** O back precisa de `CORS_ORIGIN=http://localhost:3001` (padrão do `.env.example` dele). Se o front estiver em outra porta, ajuste lá.

**Fiz login e a sessão some ao recarregar.** O cookie `balcao_sessao` é `SameSite=Lax` e, em produção, `Secure`. Em `localhost` com `npm run dev` funciona sem HTTPS porque `secure` só é ligado com `NODE_ENV=production`.

**Porta 3001 ocupada.** Mude em `package.json` (`dev`/`start`) e no `CORS_ORIGIN` do back.

**Imagem de produto não aparece no admin.** `next/image` só otimiza hosts em `remotePatterns` (`next.config.ts`); hoje só `cdn.dummyjson.com`, que é o CDN do seed.

---

## 13. O que ficou de fora e por quê

- **Tema escuro (P2).** A paleta é fixa e a distinção verde/violeta foi validada só sobre o papel claro. Um tema escuro pediria uma segunda paleta validada para contraste; preferi entregar um tema claro completo a dois pela metade.
- **Paginação infinita (P2).** Escolhi paginação numerada na URL: botão voltar, link compartilhável e rodapé alcançável. `useInfiniteQuery` seria a alternativa, com esses custos.
- **Rota por código do pedido (`/pedido/PED-…`).** A API busca pedido por `id`; a URL usa o UUID e a tela mostra o código legível. Um `GET /pedidos/codigo/:codigo` no back resolveria.
- **Telefone e observação no checkout.** A API não os aceita; ver a decisão em [6](#6-decisões-técnicas).
- **Carrinho anônimo e cupom.** Não existem no back.
- **Dias sem vaga bloqueados de antemão.** A disponibilidade é por dia (`GET /produtos/:id/disponibilidade?data=`), sem endpoint de resumo do mês. O calendário bloqueia passado e fim de semana de saída e marca como "sem horários" cada dia que o usuário já consultou.
- **Páginas autenticadas como Server Components.** O access token vive em memória no cliente; o servidor Next só tem o refresh (rotativo). Renderizar no servidor exigiria rotacionar o token a cada requisição de página, correndo contra o cliente. Por isso `/pedido/[id]` e afins são Client Components com esqueleto.
- **Testes E2E dependem do back real.** É proposital (o seed é determinístico), mas exige a API no ar.
- **Status HTTP 404 em produto ou categoria inexistente.** A tela de "não encontrado" aparece corretamente, mas a resposta sai com status 200: o `loading.tsx` da rota faz o Next transmitir o shell antes de `notFound()` rodar. Manter o esqueleto de rota (pedido pela especificação) valeu mais que o código de status; sem `loading.tsx` o status seria 404.
- **PWA / offline.** O estado de "sem rede" é tratado em toda consulta (mensagem e "Tentar de novo"), mas não há service worker.
