# CLAUDE.md — Meu Financeiro (FineBase App)

## Visão Geral
Aplicação web de gestão financeira pessoal. O usuário cadastra **gastos** e **entradas** e acompanha as finanças via **dashboard analítico** com gráficos e tabelas comparativas.

**Status:** MVP concluído — CRUD completo, dashboard analítico, importação de CSV do Nubank, orçamentos, parcelamentos, gastos recorrentes, fechamento mensal consultivo, tela de Score. Sem autenticação por usuário ainda.

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework UI | Vue 3 + Quasar 2 | ^3.5.25 / ^2.18.6 |
| Build tool | Vite | ^7.3.1 |
| Estado global | Pinia | ^3.0.4 |
| Roteamento | Vue Router | ^5.0.3 |
| Backend/DB | Supabase (PostgreSQL) | ^2.98.0 |
| Gráficos | Chart.js + vue-chartjs | ^4.5.1 |
| CSS | Sass + Quasar theme | ^1.97.3 |

### Comandos

```bash
npm run dev      # Dev server (Vite)
npm run build    # Build produção
npm run preview  # Visualizar build local
```

---

## Estrutura de Pastas

```
src/
├── pages/
│   ├── DashboardPage.vue    # Análises, gráficos, parcelamentos, orçamentos
│   ├── ExpensesPage.vue     # CRUD de gastos + importar/exportar CSV
│   ├── IncomesPage.vue      # CRUD de entradas + cards estatísticos
│   ├── MonthlyClosingPage.vue # Fechamento mensal consultivo com score e recomendações
│   ├── ScorePage.vue        # Tela dedicada ao score: gauge, faixas, critérios, histórico 12m, dicas
│   └── RecurringPage.vue    # CRUD de templates de gastos recorrentes
├── components/
│   ├── FilterCard.vue       # Filtros reutilizáveis por período/categoria
│   └── ImportCsvModal.vue   # Modal de importação do extrato CSV do Nubank
├── stores/
│   └── financeStore.js      # Store Pinia única — estado + getters + actions CRUD
├── services/
│   ├── supabaseClient.js    # Inicialização do cliente Supabase
│   └── financeService.js    # CRUD Supabase para todas as tabelas
├── utils/
│   ├── formatDate.js        # formatDateBR: YYYY-MM-DD → DD/MM/YYYY
│   └── formatMoney.js       # formatMoney: number → R$ 1.234,56
├── plugins/
│   └── chart.js             # Registro dos componentes Chart.js
├── App.vue                  # Layout com sidebar + header + router-view
├── main.js                  # Bootstrap: Pinia, Router, Quasar, mount
└── quasar-variables.sass    # Cores do tema customizado
```

---

## Banco de Dados (Supabase)

**URL do projeto:** `https://yjkkrxxpmapoedfzctew.supabase.co`
**Auth:** RLS habilitado com políticas "Allow all" (sem filtro por usuário ainda)

### Tabela `expenses`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| date | date | Obrigatório |
| description | text | Obrigatório |
| category | text | Nullable — ver lista de categorias |
| location | text | Nullable |
| payment_method | text | debito / credito / pix / dinheiro |
| amount | numeric(12,2) | Obrigatório, >= 0 |
| expense_type | text | fixo / variavel / parcelado |
| installments | integer | Nullable — só preenche se parcelado |
| created_at | timestamptz | now() |

**Índice:** `idx_expenses_date` (date DESC)

**Semântica do campo `amount` para parcelados:** armazena o valor **por parcela** (mensal), não o total. Consistente com o extrato do Nubank que exporta o valor de cada parcela individualmente.

### Tabela `incomes`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| date | date | Obrigatório |
| description | text | Obrigatório |
| source | text | Nullable — ver lista de fontes |
| amount | numeric(12,2) | Obrigatório, >= 0 |
| created_at | timestamptz | now() |

**Índice:** `idx_incomes_date` (date DESC)

### Tabela `budgets`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| category | text | NOT NULL, UNIQUE — uma linha por categoria |
| limit_amount | numeric(12,2) | NOT NULL, > 0 |
| created_at | timestamptz | now() |

**Uso:** upsert por `category` (onConflict: 'category'). Limite é mensal e vale todo mês (não por mês específico).

### Tabela `recurring_templates`

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| description | text | NOT NULL |
| category | text | Nullable |
| location | text | Nullable |
| payment_method | text | Nullable |
| amount | numeric(12,2) | NOT NULL, >= 0 |
| created_at | timestamptz | now() |

**Uso:** "Lançar este mês" cria um `expense` com `expense_type = 'fixo'` e a data de hoje.

---

## Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | redirect | Redireciona para `/dashboard` |
| `/dashboard` | DashboardPage | Análise completa com gráficos |
| `/gastos` | ExpensesPage | CRUD de gastos + importar/exportar CSV |
| `/entradas` | IncomesPage | CRUD de entradas |
| `/fechamento-mensal` | MonthlyClosingPage | Fechamento mensal com insights, alertas e score |
| `/recorrentes` | RecurringPage | CRUD de templates recorrentes |
| `/score` | ScorePage | Tela dedicada ao score: gauge, faixas, critérios, histórico 12m, dicas |

---

## Store Pinia — `useFinanceStore()`

**Arquivo:** [src/stores/financeStore.js](src/stores/financeStore.js)

### State
- `expenses` — array com todos os gastos
- `incomes` — array com todas as entradas
- `budgets` — array com limites de orçamento por categoria
- `recurringTemplates` — array com templates de gastos recorrentes
- `loading` — boolean para indicar fetch em andamento
- `error` — string de erro ou null

### Getters principais
- `monthlyExpensesTotal(month, year)` — total de gastos no mês
- `monthlyIncomesTotal(month, year)` — total de entradas no mês
- `balance(month, year)` — saldo (incomes - expenses)
- `expensesByCategory(month, year)` — agregação por categoria
- `expensesByMonth(year)` — array de 12 valores (um por mês)
- `balanceEvolutionByMonth(year)` — evolução do saldo ao longo do ano

### Actions
- `loadData()` — carrega as 4 tabelas do Supabase em paralelo (Promise.all)
- `addExpense(payload)` / `editExpense(id, payload)` / `removeExpense(id)`
- `addIncome(payload)` / `editIncome(id, payload)` / `removeIncome(id)`
- `saveBudget(category, limit_amount)` — upsert por categoria
- `removeBudget(id)`
- `addRecurringTemplate(payload)` / `editRecurringTemplate(id, payload)` / `removeRecurringTemplate(id)`

### Fluxo de dados
```
Page → store.action() → financeService() → Supabase API → state.push/update → getters re-computam → UI re-renderiza
```

---

## Componentes Principais

### DashboardPage.vue
- Resumo do mês atual: entradas, gastos, saldo, taxa de economia, maior categoria
- **Parcelamentos em andamento**: agrupa registros com "Parcela X/Y" na descrição por `baseDesc + total + amount`, exibe o maior X como parcela atual, calcula restante e data de término dinamicamente — sem precisar que parcelas futuras existam na base. Suporta modelo antigo (1 registro, sem "Parcela X/Y" na descrição) via fallback de cálculo por data.
- **Orçamento por categoria**: barra de progresso por categoria (verde < 80%, âmbar 80–100%, vermelho excedido), dialog "Gerenciar" para adicionar/remover limites — orçamento é fixo (mesmo valor todo mês)
- **Ajuste de tema em textos de destaque**: no card de resumo, "Maior categoria" usa classe dinâmica (`text-grey-3` no dark e `text-grey-8` no light) com `useQuasar()` e `$q.dark.isActive`
- Filtro por meses/ano, modo Gráficos vs Tabelas
- Gráficos: pizza (categorias), barras (mês a mês), linha (saldo no ano), comparativo, tendência 12 meses
- Modo comparativo quando 2+ meses selecionados

### ExpensesPage.vue
- Modal para adicionar/editar gasto
- Cards: total no período, média diária, maior categoria, forma de pagamento dominante
- Tabela com virtual-scroll, empty state com ícone
- Skeleton loader no carregamento inicial (`finance.loading && finance.expenses.length === 0`)
- Filtro por data e categoria via `FilterCard`
- Botão **Importar CSV** (abre `ImportCsvModal`) e **Exportar CSV** (BOM + ponto-e-vírgula para compatibilidade Excel pt-BR)
- Categorias: Assinaturas, Casa, Compras, Delivery, Doações, Educação, Empréstimos, Imprevistos, Investimentos, Lazer, Reserva de emergência, Saúde, Supermercado, Transporte

### IncomesPage.vue
- Modal para adicionar/editar entrada
- Cards: total no período, média diária, maior fonte
- Tabela com virtual-scroll, empty state com ícone
- Skeleton loader no carregamento inicial
- Filtro por data e fonte via `FilterCard`
- Fontes: Extra, Presente, Renda Secundária, Resgate investimento, Salário, Vale, Venda

### RecurringPage.vue
- CRUD completo de templates de gastos recorrentes (campos: descrição, categoria, local, forma de pagamento, valor)
- Empty state com ícone e call-to-action
- Skeleton loader no carregamento inicial
- Botão **"Lançar este mês"** por template: cria um `expense` com a data de hoje e exibe notificação Quasar Notify de sucesso/erro
- A resposta da reactive `launching` usa cópia de objeto para evitar perda de reatividade (`{ ...launching.value, [id]: true }`)

### ImportCsvModal.vue
- Dialog maximizado para importar extrato CSV do Nubank
- Formato esperado: `date,title,amount` (exportação padrão do app Nubank)
- Parsing client-side com remoção de BOM, suporte a campos entre aspas
- Auto-categorização por regex (`suggestCategory`) mapeando palavras-chave para as categorias do app
- **Parcelamentos — modelo multi-registro**: ao detectar "Parcela X/Y" no título, gera X registros (um por parcela já ocorrida). A função `calcInstallmentDate(csvDateStr, currentN, targetN)` ajusta o mês preservando o dia original (com tratamento de fevereiro: `Math.min(day, lastDay)`). Descrição de cada registro: `"Base - Parcela N/Y"`.
- Filtro automático: `amount > 0` são gastos; `amount <= 0` (ex: "Pagamento recebido") são ignorados com contador de aviso
- **Detecção de duplicatas**: parcelados usam `description + amount` (a descrição já contém "Parcela X/Y", sendo única por parcela); demais gastos usam `date + amount`. Duplicatas são auto-desmarcadas e exibem badge "Já existe".
- **Confirmação de duplicatas**: ao clicar em "Importar", se algum item selecionado for duplicata, abre dialog listando-os (descrição, data, valor). Usuário pode cancelar ou forçar a importação.
- Preview editável: descrição e categoria ajustáveis antes de importar
- Importação sequencial via `finance.addExpense()` com contador de progresso
- **Parcelas futuras NÃO são criadas**: o sistema registra apenas as cobranças passadas (reais). O Dashboard projeta o restante dinamicamente. Criar parcelas futuras causaria dados incorretos se o parcelamento mudar.

### FilterCard.vue
- Componente reutilizável usado em Expenses e Incomes
- Props: `categoryOptions`, `categoryLabel`, `defaultPreset`
- Presets: Hoje, Últimos 7 dias, Últimos 30 dias, Este Mês, Mês Passado, Últimos 3 meses, Últimos 6 meses
- Emite: `update:dateRange` `{ start, end }`, `update:category`, `update:preset`

### MonthlyClosingPage.vue
- Tela dedicada de **fechamento mensal consultivo**, com seletor de mês/ano e carregamento inicial via skeleton
- Cards principais: entradas, gastos, saldo e **Score mensal (0–100)** com barra vertical e ícone info com tooltip
- **Top categorias do mês**: ranking por valor, percentual do total e quantidade de lançamentos, com barra visual por categoria
- **Formas de pagamento** em duas leituras:
  - por valor total (impacto financeiro)
  - por quantidade de uso (hábito/comportamento)
  - inclui ticket médio por forma
- **Estatísticas de comportamento**: total de lançamentos, ticket médio, maior gasto único, dia mais caro, média diária, categoria mais frequente, número de categorias usadas, parcelados no mês e fixo vs variável
- **Pontos de atenção** com regras dinâmicas (via `ATTENTION_RULES` no composable)
- **Recomendações do mês** com sugestões acionáveis (via `RECOMMENDATION_RULES` no composable)
- **Resumo consultivo** em linguagem de produto
- **Histórico do score** (6 meses) + **Composição dos gastos** (fixo/variável/parcelado)
- Botão **Exportar PDF** via jsPDF
- Todo o lógica analítica extraída para `useMonthlyClosing.js`

### ScorePage.vue
- Tela dedicada ao score financeiro, acessível via `/score` e menu lateral
- **Gauge SVG** — semi-círculo colorido preenchido de acordo com o score (cálculo via arco SVG dinâmico)
- **Faixas de classificação** — 4 bandas (Excelente 85–100, Bom 70–84, Atenção 55–69, Crítico 0–54), com a faixa ativa destacada
- **Como é calculado** — grade 2 colunas com os 8 critérios do score, cada um mostrando:
  - Ícone, nome, descrição do que mede
  - Badge de penalidade atual (`−X pts`) ou bônus (`+X pts`) ou `OK`
  - Barra de impacto (0% a 100% da penalidade máxima), colorida por status
  - Hint contextualizado com os dados reais do mês
- **Histórico 12 meses** — gráfico de linha via `scoreHistoryLong` (mais amplo que os 6 meses do fechamento)
- **Dicas personalizadas** — filtra `scoreFactors` onde `penalty > 0` ou `status === 'warning'`, ordenado por impacto
- Usa `useMonthlyClosing` com os novos exports `scoreFactors` e `scoreHistoryLong`

### App.vue
- Layout com `q-layout`, drawer lateral fixo (260px, mini mode)
- Header com título e toggle do drawer
- Sidebar com itens: Dashboard, Gastos, Entradas, Fechamento mensal, Recorrentes + Orçamentos (dialog) + **Score** (rota `/score`)
- Widget de saldo do mês atual no rodapé do sidebar (oculta no mini mode, ícone com tooltip)

---

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://yjkkrxxpmapoedfzctew.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon>
```

Configuradas em `.env` na raiz do projeto.

---

## Tema Visual (Quasar)

```sass
$primary:   #2563eb  // Azul vibrante (botões, links, destaque)
$secondary: #64748b  // Cinza
$accent:    #7c3aed  // Roxo
$dark:      #0f172a  // Navy escuro
$positive:  #059669  // Verde
$negative:  #dc2626  // Vermelho
$info:      #0ea5e9  // Azul céu
$warning:   #d97706  // Âmbar
```

Fundo da área de conteúdo: `#f1f5f9`

---

## Padrões e Decisões Técnicas

### Skeleton loading
Padrão usado em todas as páginas para distinguir carregamento inicial de operações CRUD:
```js
const isInitialLoading = computed(() => finance.loading && finance.expenses.length === 0)
```
Isso evita que o skeleton apareça ao salvar/editar (quando `loading` é true mas os dados já existem).

### Exportação CSV (Excel pt-BR)
Usar BOM (`﻿`) no início e ponto-e-vírgula como separador — obrigatório para o Excel abrir corretamente em pt-BR. Vírgula como separador causa problemas com valores monetários no formato brasileiro.

### Parcelamentos: modelo multi-registro (N registros por compra)
O app armazena **1 registro por parcela já cobrada**. Ao importar "Parcela 6/10", são criados 6 registros com datas reais (mesmo dia do mês, meses ajustados). Cada registro aparece no mês correto na página de Gastos e nos totais do Dashboard.

**Campos relevantes:** `installments` (total), `date` (data real da cobrança daquela parcela), `description` (contém "Parcela X/Y" — fonte da verdade do número atual).

**`calcInstallmentDate(csvDateStr, currentN, targetN)`**: calcula a data da parcela `targetN` sabendo que `currentN` foi cobrada em `csvDateStr`. Preserva o dia do mês; usa `Math.min(day, lastDay)` para fevereiro (ex: dia 29 → 28).

**Coluna "Tipo" em ExpensesPage**: lê o número da parcela via regex na descrição:
```js
const match = row.description?.match(/parcela\s+(\d+)\/(\d+)/i)
if (match) return `Parcelado ${match[1]}/${match[2]}`
```
Fallback para registros do modelo antigo (sem "Parcela X/Y" na descrição): calcula pela diferença de meses entre `date` e hoje.

**Dashboard — agrupamento de parcelamentos**: `activeInstallments` agrupa registros pela chave `baseDesc + total + amount`, usa o maior X encontrado como parcela atual e calcula restante e data de término dinamicamente. Suporta os dois modelos.

**Duplicatas na importação**: parcelados usam `description + amount` como chave (descrição já é única por parcela). Na próxima importação com "Parcela 7/10", as parcelas 1–6 aparecem como duplicatas e são auto-desmarcadas; só a 7/10 é nova.

**Por que NÃO criar parcelas futuras**: parcelas futuras ainda não foram cobradas. Criar registros adiantados causaria dados incorretos se o parcelamento mudar (cancelamento, renegociação). O Dashboard projeta o restante dinamicamente sem precisar desses registros.

### Parsing de datas: sempre usar T00:00:00
`new Date("2026-02-01")` sem horário é interpretado como UTC meia-noite. No Brasil (UTC-3) isso vira 31 de janeiro — um mês errado. Sempre usar `new Date(dateString + "T00:00:00")` para forçar interpretação no fuso local. Esse bug causou "Parcela 5/12" aparecer em vez de "4/12".

### Orçamentos: limite fixo mensal
A tabela `budgets` tem `category` como UNIQUE. O upsert substitui o limite existente ao salvar para a mesma categoria. O limite vale para todos os meses (não por mês específico), mantendo a configuração simples.

### Fechamento mensal consultivo e score

**Toda a lógica analítica** está em `src/composables/useMonthlyClosing.js`. A `MonthlyClosingPage.vue` e a `ScorePage.vue` são consumers do composable.

**Score mensal (0–100):** função pura `computeScore(data)` com os 8 critérios abaixo. Clamp entre 0 e 100.

| Critério | Penalidade | Bônus |
|----------|-----------|-------|
| Sem entradas | −25 | — |
| Saldo negativo | −30 | — |
| Taxa de economia < 10% | −10 | — |
| Categoria dominante ≥ 40% | −12 | — |
| Categoria dominante ≥ 30% | −6 | — |
| Pagamento dominante ≥ 70% | −10 | — |
| Pagamento dominante ≥ 60% | −5 | — |
| Orçamento estourado | −15 | — |
| Parcelas futuras ≥ 150% dos gastos | −10 | — |
| Parcelas futuras ≥ 80% dos gastos | −5 | — |
| Gastos subiram ≥ 20% vs. anterior | −10 | — |
| Gastos subiram ≥ 10% vs. anterior | −6 | — |
| Gastos caíram ≥ 10% vs. anterior | — | +4 |
| Proporção de parcelados ≥ 40% | −5 | — |

**`scoreFactors`** — computed que expõe cada critério com `{ id, label, icon, description, maxPenalty, penalty, bonus, status, hint }`. Usado pela `ScorePage` para renderizar a grade "Como é calculado" e as dicas personalizadas.

**`scoreHistory`** — 6 meses (usado no `MonthlyClosingPage`).
**`scoreHistoryLong`** — 12 meses (usado no `ScorePage`).

**`calculateScoreForMonth(month, year, finance)`** — versão simplificada do score para histórico (sem `futureInstallmentsRatio` e `expenseTrend`, que dependem de dados dinâmicos de `now`).

**Comparações temporais:** tendências (`expenseTrend` e `balanceTrend`) usam mês anterior para indicar melhora/piora.

### Reatividade com objetos dinâmicos (launching)
Para não perder reatividade ao atualizar chaves de um objeto ref, usar cópia: `launching.value = { ...launching.value, [id]: true }` em vez de `launching.value[id] = true`.

---

## Roadmap

O roadmap completo está em [ROADMAP.md](ROADMAP.md).

### MVP — Concluído ✅
- [x] Orçamento por categoria com barra de progresso e alerta
- [x] Visão de parcelamentos em andamento (parcela X/Y, valor, término, total restante)
- [x] Gastos recorrentes / templates (lançar recorrência com 1 clique)
- [x] Resumo do mês atual destacado no topo do Dashboard
- [x] Empty states amigáveis em gráficos/tabelas sem dados
- [x] Loading skeleton ao carregar dados do Supabase
- [x] Confirmação de exclusão antes de deletar gasto/entrada
- [x] Indicador de saldo no header/sidebar (visível em todas as páginas)
- [x] Exportação CSV dos gastos do período filtrado
- [x] Gráfico de tendência de gastos (últimos 12 meses)
- [x] Importar CSV do Nubank — categorização automática, detecção de parcelas, modelo multi-registro, confirmação de duplicatas
- [x] Fechamento mensal consultivo — score, pontos de atenção, recomendações, resumo, PDF export
- [x] Tela de Score — gauge SVG, faixas, critérios detalhados, histórico 12 meses, dicas personalizadas

### Fase 2 — Pós-MVP
- Autenticação completa (Supabase Auth)
- Conta compartilhada do casal (`household_id` + RLS por grupo)
- Metas financeiras com progresso
- Alertas e notificações (orçamento ultrapassado, resumo semanal)
- Dashboard consolidado do casal

### Fase 3 — Longo prazo
- Open Finance / integração bancária automática (Pluggy/Belvo)
- App mobile via Capacitor
- IA para categorização automática
- Análise preditiva de gastos
- Relatório mensal em PDF por email

---

## Contexto do Produto

Criado para uso pessoal pelo desenvolvedor e sua esposa. Objetivo principal: centralizar e personalizar o controle financeiro do casal, com foco em gastos no cartão de crédito. Futuramente terá multi-usuário com conta compartilhada.

---

## Documentação Adicional no Projeto

- [ROADMAP.md](ROADMAP.md) — checklist MVP e plano de fases futuras
- [SUPABASE-SETUP.md](SUPABASE-SETUP.md) — guia para recriar o banco do zero (SQL DDL, RLS, índices)
- [Prompt.md](Prompt.md) — prompt original que gerou a base do projeto
