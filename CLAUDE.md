# CLAUDE.md — Meu Financeiro (FineBase App)

## Visão Geral
Aplicação web de gestão financeira pessoal. O usuário cadastra **gastos** e **entradas** e acompanha as finanças via **dashboard analítico** com gráficos e tabelas comparativas.

**Status:** MVP concluído — CRUD completo, dashboard analítico, importação de CSV do Nubank, orçamentos, parcelamentos, gastos recorrentes. Sem autenticação por usuário ainda.

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
| `/recorrentes` | RecurringPage | CRUD de templates recorrentes |

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
- **Parcelamentos em andamento**: lista compacta com parcela X/Y calculada por diferença de meses, barra de progresso, data de término e total restante. 1 registro = toda a vida do parcelamento (o `amount` é o valor por parcela mensal)
- **Orçamento por categoria**: barra de progresso por categoria (verde < 80%, âmbar 80–100%, vermelho excedido), dialog "Gerenciar" para adicionar/remover limites — orçamento é fixo (mesmo valor todo mês)
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
- Detecção de parcelamentos: regex `/parcela\s+(\d+)\/(\d+)/i` extrai `installments` e seta `expense_type = 'parcelado'`
- Filtro automático: `amount > 0` são gastos; `amount <= 0` (ex: "Pagamento recebido") são ignorados com contador de aviso
- Detecção de duplicatas: compara `date + amount` contra `finance.expenses` existente
- Preview editável: descrição e categoria ajustáveis antes de importar
- Importação sequencial via `finance.addExpense()` com contador de progresso

### FilterCard.vue
- Componente reutilizável usado em Expenses e Incomes
- Props: `categoryOptions`, `categoryLabel`, `defaultPreset`
- Presets: Hoje, Últimos 7 dias, Últimos 30 dias, Este Mês, Mês Passado, Últimos 3 meses, Últimos 6 meses
- Emite: `update:dateRange` `{ start, end }`, `update:category`, `update:preset`

### App.vue
- Layout com `q-layout`, drawer lateral fixo (260px, mini mode)
- Header com título e toggle do drawer
- Sidebar com 4 itens de menu (Dashboard, Gastos, Entradas, Recorrentes)
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

### Parcelamentos: 1 registro = todo o parcelamento
O app armazena apenas 1 linha por compra parcelada. O campo `amount` é o valor da parcela mensal. A parcela atual é calculada dinamicamente pela diferença de meses entre `date` e hoje. O sistema não projeta parcelas futuras nos totais mensais (cada mês reflete apenas os gastos do mês em que foram lançados).

### Orçamentos: limite fixo mensal
A tabela `budgets` tem `category` como UNIQUE. O upsert substitui o limite existente ao salvar para a mesma categoria. O limite vale para todos os meses (não por mês específico), mantendo a configuração simples.

### Reatividade com objetos dinâmicos (launching)
Para não perder reatividade ao atualizar chaves de um objeto ref, usar cópia: `launching.value = { ...launching.value, [id]: true }` em vez de `launching.value[id] = true`.

---

## Roadmap

O roadmap completo está em [ROADMAP.md](ROADMAP.md).

### MVP — Concluído ✅
- [x] Orçamento por categoria com barra de progresso e alerta
- [x] Visão de parcelamentos em andamento (parcela X/Y, valor, término)
- [x] Gastos recorrentes / templates (lançar recorrência com 1 clique)
- [x] Resumo do mês atual destacado no topo do Dashboard
- [x] Empty states amigáveis em gráficos/tabelas sem dados
- [x] Loading skeleton ao carregar dados do Supabase
- [x] Confirmação de exclusão antes de deletar gasto/entrada
- [x] Indicador de saldo no header/sidebar (visível em todas as páginas)
- [x] Exportação CSV dos gastos do período filtrado
- [x] Gráfico de tendência de gastos (últimos 12 meses)
- [x] Importar CSV do Nubank (com categorização automática e detecção de parcelas)

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
