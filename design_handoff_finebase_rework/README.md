# Handoff: FineBase — Visual Rework

> Pacote de design para passar ao desenvolvedor (Claude Code) implementar o rework visual do FineBase no codebase Vue 3 + Quasar.

---

## Visão geral

**FineBase** é um app de controle financeiro pessoal (casal — Ana &amp; Lucas) construído em **Vue 3 + Quasar 2** (componentes Material). O objetivo deste handoff é trocar a apresentação visual atual (paleta azul saturada / sombras dramáticas / Material padrão) por uma direção minimalista, sóbria e profissional inspirada em Linear / Notion / Mercury / Vercel.

A lógica do app **não muda** — apenas a camada visual.

---

## Sobre os arquivos deste bundle

Os arquivos HTML/JSX deste pacote são **referências de design** — protótipos mostrando o look-and-feel pretendido e algumas interações. **Não são código de produção pra copiar e colar.**

A tarefa é **recriar estes designs HTML dentro do codebase existente (Vue 3 + Quasar)** usando seus padrões e bibliotecas. Concretamente:

- Substituir variáveis Sass do Quasar (`$primary`, `$negative` etc.) com a paleta da variação escolhida
- Customizar/sobrescrever os componentes do Quasar (`q-drawer`, `q-table`, `q-dialog`, `q-btn`, `q-card`) para refletir o estilo dos mocks
- Manter o uso de Quasar — não substituir o framework
- Preservar o roteamento, store, e chamadas de API do projeto

---

## Fidelidade

**High-fidelity (hifi).** Os mocks têm:
- Paleta final com hex / oklch values
- Tipografia decidida (Geist Sans + Geist Mono)
- Spacing scale, border-radius, shadows tokenizados
- Estados (hover, active, modal, light/dark) implementados

O desenvolvedor deve replicar o visual com precisão pixel-perfect, adaptado às convenções do Quasar.

---

## Variações entregues (3 direções)

O design canvas oferece **três direções** para o cliente escolher. **Cada uma é uma direção visual completa e auto-suficiente — não devem ser misturadas.**

### A · Obsidian (recomendada)
**Inspiração:** Linear · denso, monocromático, indigo discreto.

| Token | Light | Dark |
|---|---|---|
| `bg`        | `#fafafa` | `#08080a` |
| `surface`   | `#ffffff` | `#111114` |
| `border`    | `#e4e4e7` | `#232328` |
| `text`      | `#09090b` | `#fafafa` |
| `text-muted`| `#71717a` | `#8b8b93` |
| `accent`    | `oklch(0.52 0.18 268)` (indigo) | `oklch(0.72 0.16 268)` |

- **Border-radius:** 6px
- **Letter-spacing:** títulos −0.022em, body −0.012em
- **Densidade:** alta (page padding 20–24px, table-row 11px)
- **Botão primary:** preto puro (`text` sobre `bg`)
- **Sombras:** quase ausentes (`0 1px 2px rgba(0,0,0,.04)`)

### B · Riverstone
**Inspiração:** Mercury · quente, espaçado, refinado.

| Token | Light | Dark |
|---|---|---|
| `bg`        | `#f6f5f1` (warm) | `#14130f` |
| `surface`   | `#ffffff` | `#1f1e19` |
| `border`    | `#e6e3da` | `#2f2e26` |
| `text`      | `#1a1a17` | `#f4f1e9` |
| `accent`    | `oklch(0.5 0.07 178)` (sage/teal) | `oklch(0.72 0.09 178)` |

- **Border-radius:** 10px
- **Densidade:** confortável (page padding 32–40px, stats maiores)
- **Header:** sem border-bottom (transparente)
- **Tipografia:** títulos em weight 500 (não 600)

### C · Voltage
**Inspiração:** Vercel · quase-preto + 1 toque elétrico.

| Token | Light | Dark |
|---|---|---|
| `bg`        | `#ffffff` | `#000000` |
| `surface`   | `#ffffff` | `#0a0a0a` |
| `border`    | `#ebebeb` | `#1f1f1f` |
| `text`      | `#000000` | `#ffffff` |
| `accent`    | `oklch(0.74 0.16 65)` (amber) | `oklch(0.78 0.17 65)` |

- **Border-radius:** 4px (hard edges)
- **Densidade:** equilibrada
- **Tipografia:** títulos com letter-spacing −0.034em (super fechado)
- **Sombras:** substituídas por bordas (1px outer ring)

---

## Tipografia (todas as variações)

Carregar do Google Fonts:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap">
```

| Função | Family | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| Display (valores grandes) | Geist Mono | 600 | 44px | −0.034em |
| Title (page) | Geist | 600 | 32px | −0.026em |
| Heading (card) | Geist | 600 | 20px | −0.018em |
| Card title (sub) | Geist | 500 | 13px | −0.012em |
| Body | Geist | 500 | 14px | −0.012em |
| Caption | Geist | 500 | 12px | — |
| Label (uppercase) | Geist | 500 | 11px | 0.06em |
| Numeric (todos os valores monetários) | Geist Mono | 500 | 13px | −0.01em |

**Regra de ouro:** todo número monetário (R$) usa `font-family: Geist Mono` + `font-variant-numeric: tabular-nums`.

---

## Spacing scale

```css
--s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
--s-5: 20px;  --s-6: 24px;  --s-7: 32px;  --s-8: 40px;
--s-9: 48px;  --s-10: 64px;
```

---

## Border radius

```css
--r-sm: 4px;   /* Voltage usa este como padrão */
--r-md: 6px;   /* Obsidian usa este */
--r-lg: 10px;  /* Riverstone usa este */
--r-xl: 14px;  /* modais grandes */
```

---

## Categorias (cores fixas em todas as variações)

| Categoria | Cor (oklch) |
|---|---|
| Mercado       | `oklch(0.62 0.16 268)` |
| Restaurantes  | `oklch(0.7 0.13 165)` |
| Transporte    | `oklch(0.72 0.14 60)` |
| Casa          | `oklch(0.6 0.16 25)` |
| Saúde         | `oklch(0.6 0.12 320)` |
| Lazer         | `oklch(0.65 0.1 200)` |
| Assinaturas   | `oklch(0.55 0.05 60)` |

Estas cores são usadas em donut charts, dots de tabela, badges de categoria.

---

## Sinais semânticos

| Sinal | Light | Dark |
|---|---|---|
| Positive | `oklch(0.55 0.13 158)` | `oklch(0.72 0.15 158)` |
| Negative | `oklch(0.55 0.18 25)` | `oklch(0.7 0.18 25)` |
| Warning  | `oklch(0.7 0.13 75)`   | `oklch(0.78 0.13 80)` |

Cada sinal tem variante "soft" (mesmo hue, lightness 0.95 / chroma 0.04) usada como background de pills.

---

## Layout geral

```
┌─────────────┬──────────────────────────────────────┐
│             │  Header (52px, breadcrumbs + busca)  │
│  Sidebar    ├──────────────────────────────────────┤
│  232–244px  │                                      │
│             │  Page content                        │
│  + balance  │  padding: 20–40px (varia por var.)   │
│  widget no  │                                      │
│  rodapé     │                                      │
└─────────────┴──────────────────────────────────────┘
```

### Sidebar
- Width: **232px** (Obsidian/Voltage), **244px** (Riverstone)
- Background: `var(--sidebar-bg)` (igual ao bg ou ligeiramente diferente)
- Border-right: `1px solid var(--sidebar-border)`
- Padding: 12px
- **Brand row:** 22×22 logo (background = `var(--text)`, texto = `var(--bg)`, weight 700, font Geist Mono) + nome + subtítulo + chev pra trocar workspace
- **Nav items:** 7px×8px padding, gap 1px, radius 6px, hover bg = `var(--bg-soft)`, ícone 16px
  - Item ativo: bg `var(--bg-soft)`, ícone colorido com `var(--accent)`
  - Counter à direita (ex: "142" gastos) em mono 11px `var(--text-4)`
- **Group label:** 10.5px uppercase, letter-spacing 0.06em, color `var(--text-3)`, weight 500
- **Balance widget (rodapé):** border-top dashed, mostra Entradas/Gastos/Saldo em formato compacto (`+13,4k`, `−5,1k`, `+8,3k`)

### Header
- Height: **52px**
- Border-bottom: `1px solid var(--border-soft)` (Obsidian/Voltage); ausente em Riverstone
- Padding: 0 24px
- **Esquerda:** breadcrumbs ("FineBase / Dashboard"), separador `/` em `var(--text-4)`, último item em `var(--text)` weight 500
- **Direita:** busca (240px, ícone + "Buscar" + kbd `⌘K`), botão tema (sun/moon), avatar 26px circular

---

## Telas

### 1 · Dashboard (`/dashboard`)
**Estrutura vertical:**

1. **Page header** — título "Dashboard" + subtítulo ("Resumo de Mai · 26 — atualizado há 2 min"). Actions à direita: segmented (Mar/Abr/Mai/2026 ▾) + segmented (Gráficos/Tabelas).
2. **Top stats** — grid 4 cols: Entradas, Gastos, Saldo, Taxa de economia. Cada um: label + value (font-mono 28–34px) + pill colorido (delta) + sub.
3. **Charts row** — grid 1.1fr / 1fr:
   - **Gastos por categoria** (donut SVG 188px + legenda lateral com dot + label + valor + %)
   - **Comparativo mensal** (bars SVG 7 meses, mês corrente highlighted em accent)
4. **Saldo line + parcelas** — grid 1.4fr / 1fr:
   - **Saldo no ano** (area chart com gradient, valor grande + pill positivo)
   - **Parcelamentos em curso** — lista de 3 itens, cada um: descrição + valor restante + barra progresso + "Parcela X/Y" + "termina Mes/Ano"
5. **Orçamentos** — card com 5 categorias em grid; cada uma: nome + % + barra (verde/âmbar/vermelho) + valor / limite

### 2 · Gastos (`/gastos`)
1. **Page header** — actions: "Importar CSV" / "Exportar" / "Adicionar gasto" (primary).
2. **4 stats** — Total no período / Média diária / Maior categoria / Pagamento dominante.
3. **Filter bar** — presets de data (chip group: Hoje, 7 dias, 30 dias, Este mês, Mês passado, 2026), filtros (Categoria, Pagamento, Tipo) com chevDown.
4. **Tabela** — colunas: Data (mono) / Descrição (text bold) / Categoria (dot + nome) / Local (muted) / Pagamento / Tipo (pill) / Valor (mono right-aligned, prefixo `−`) / Ações.
   - **Ações ocultas até hover** (opacity 0 → 1)
   - **Sem zebra striping** — apenas borders horizontais sutis
   - **Hover row:** background `var(--bg-soft)`

### 3 · Modal "Adicionar gasto"
- Width: **480px**
- **Sem header colorido** — header branco (surface) com título 16px weight 600 + subtítulo muted + botão X discreto no canto
- **Body:** padding 12px 20px
  - Row: Data | Valor (input mono)
  - Descrição (full)
  - Row: Categoria (select) | Local (input)
  - Row: Forma de pagamento (select) | Tipo (segmented Variável/Fixo/Parcelado)
- **Footer:** border-top sutil, hint "⌘ + Enter para salvar" à esquerda, "Cancelar" (ghost) + "Salvar gasto" (primary) à direita

### 4 · Entradas (`/entradas`)
- 3 stats (Total / Média / Maior fonte)
- Chip group de fontes (Todas / Trabalho CLT / Freelance / Investimento / Aluguel)
- Tabela: Data / Descrição / Fonte (pill plain) / Valor (positivo, prefixo `+`, cor `--pos`)

### 5 · Recorrentes (`/recorrentes`) — não mockado em hifi
Grid 3 cols de cards, cada card: descrição + categoria (dot) + valor grande + forma pagamento + 3 ações (editar / excluir / "Lançar este mês"). Reutilizar tokens dos cards.

---

## Componentes-chave

### Botões (`.fb-btn`)
- Height: **30px** (ou 24px em variante `--xs`)
- Padding: 0 12px
- Radius: igual a `var(--radius)` da variação
- Variantes:
  - **Default:** border + surface bg + text-2
  - **Ghost:** transparente, sem border
  - **Primary:** bg `var(--text)`, color `var(--bg)` — preto/branco invertido
  - **Accent:** bg `var(--accent)`, color `var(--accent-fg)`
  - **Icon:** 30×30 quadrado

### Pills (`.fb-pill`)
- Height: **20px**, padding 0 7px, radius 999px (3px no Voltage)
- Border 1px tonal: `color-mix(in oklch, var(--pos) 25%, var(--border))`
- Background: `var(--pos-soft)` (variante muito clara)
- Variantes: `--pos`, `--neg`, `--warn`, `--accent`, `--plain`

### Cards (`.fb-card`)
- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Radius: `var(--radius)` da variação
- Shadow: `var(--shadow-sm)` (quase imperceptível)
- Header padding: `14px 16px 0`
- Body padding: `12px 16px 16px`

### Tables (`.fb-table`)
- Border-collapse + apenas borders **horizontais** (`--border-soft`)
- Header: weight 500, size 12px, color `--text-3`, padding 9px 12px
- Body row: padding 11px 12px, color `--text-2`
- Hover: background `--bg-soft`
- Coluna `.amount`: text-align right, font-mono, font-variant-numeric tabular-nums

### Inputs (`.fb-input`, `.fb-select`)
- Height: 32px, padding 0 10px
- Bg: `var(--surface-2)`, border 1px `--border`
- Focus: border `--accent` + box-shadow ring `color-mix(in oklch, var(--accent) 18%, transparent)` 3px

### Segmented (`.fb-seg`)
- Container: bg `--bg-soft`, border `--border`, padding 2px
- Active button: bg `--surface`, color `--text`, shadow-sm

### Progress bars (`.fb-bar`)
- Height: 6px, bg `--bg-soft`, radius 999px
- Fill: bg `--accent` (default), `--pos`, `--warn`, `--neg`

---

## Estados / Interações

- **Hover row em tabelas:** ações (editar/dots) revelam (opacity 0 → 1, transition 120ms)
- **Hover botões:** background → `--bg-soft`, color → `--text`
- **Focus inputs:** border accent + box-shadow ring 3px
- **Modal open:** backdrop `color-mix(in oklch, var(--text) 35%, transparent)` + `backdrop-filter: blur(2px)`
- **Theme toggle:** aplicar/remover classe `.dark` no root da app

### Skeleton loaders
Não mockados visualmente, mas seguir padrão:
- Bg: `--bg-soft`
- Animação: shimmer ou pulse
- Mesmo radius do componente que substitui

### Notify toasts (Quasar)
Manter funcionalidade — apenas re-estilizar:
- Bg: `--surface`, border 1px `--border`, shadow-md
- Sem cor sólida de fundo (apenas border-left 3px na cor do sinal)

---

## Charts

Implementação livre — recomendado **Apache ECharts** ou **Chart.js** com paleta customizada. Cores dos charts devem vir das **categorias fixas** e dos **sinais** definidos acima — **nunca usar a paleta padrão do Chart.js**.

Tipos usados:
- **Donut:** total no centro (mono 18px), arcos com 18px de "rosca" (donut, não pie cheio)
- **Bars:** mês corrente em accent, demais em `--text-4` opacity 0.35
- **Area:** linha em accent + gradient vertical (accent 0.2 → 0)

---

## State / Data shape

Os mocks usam estes shapes — adaptar à store existente:

```ts
type Categoria = {
  id: string;        // 'mercado', 'rest', 'transp', ...
  name: string;
  color: string;     // oklch(...)
};

type Gasto = {
  d: string;         // '05 Mai'
  desc: string;
  cat: string;       // categoria id
  loc: string;
  pay: string;       // 'Crédito Itaú', 'PIX', ...
  v: number;         // valor em reais
  t: 'fixo' | 'variavel' | 'parcelado';
};

type Entrada = {
  d: string;
  desc: string;
  src: string;       // 'Trabalho CLT', ...
  v: number;
};

type Orcamento = {
  cat: string;
  gasto: number;
  limite: number;
  status: 'ok' | 'warn' | 'over';
};

type Parcela = {
  desc: string;
  parcela: number;
  total: number;
  fim: string;       // 'Dez · 26'
  restante: number;
};
```

---

## Quasar — variáveis Sass sugeridas

Substituir em `src/css/quasar.variables.sass` (variação **Obsidian**, light):

```sass
$primary   : oklch(0.52 0.18 268)
$secondary : #71717a
$accent    : oklch(0.52 0.18 268)
$dark      : #08080a
$dark-page : #08080a

$positive  : oklch(0.55 0.13 158)
$negative  : oklch(0.55 0.18 25)
$info      : oklch(0.52 0.18 268)
$warning   : oklch(0.7 0.13 75)
```

Recomendo importar `tokens.css` (incluído no bundle) como global e usar as CSS vars (`var(--accent)` etc.) — fica mais fácil suportar dark mode + variações com classe no `<body>`.

---

## Overrides do Quasar a fazer

Componente | O que mudar
---|---
`q-drawer` | Remover sombra, border-right 1px `--sidebar-border`, bg `--sidebar-bg`
`q-toolbar` (header) | Bg `--header-bg`, text `--text`, sem `bg-primary`
`q-table` | `flat` + `square` + `dense`; remover zebra (`hide-bottom-row`); custom CSS pra header e row paddings
`q-dialog` | Header sem `bg-primary` — usar header branco com título 16px / subtítulo muted; X no canto direito; padding 20px
`q-btn` | `unelevated`; primary = preto puro; secondary = `flat` + border 1px
`q-card` | `flat bordered`; remover `q-card__section` shadows
`q-chip` | Reduzir altura pra 20px; usar pills tokenizados
`q-input` | `outlined dense`; bg `--surface-2`; focus state custom
`q-skeleton` | Bg `--bg-soft`

---

## Light / Dark mode

- Aplicar classe `.dark` no `<html>` ou `<body>` (não usar atributo `data-theme`)
- Toggle pelo botão sun/moon no header — persistir em `localStorage('fb-theme')`
- Quasar tem `Dark.set(true)` — manter sincronizado com a classe

---

## Files no bundle

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Design canvas com todas as 3 variações lado-a-lado |
| `prototype.html` | Protótipo navegável com switcher de variação + tema |
| `tokens.css` | **Todas as CSS variables das 3 variações** + componentes utilitários (`.fb-btn`, `.fb-card`, `.fb-table`, etc.) — **usar como base** |
| `app/icons.jsx` | Set de 28 ícones SVG line-style 16px |
| `app/charts.jsx` | Componentes SVG de Donut / Bars / Area / Spark / StackedBars |
| `app/data.jsx` | Sample data — adaptar ao store existente |
| `app/shell.jsx` | Sidebar + Header (referência de markup) |
| `app/screens.jsx` | Dashboard / Gastos / Modal / Entradas (referência) |
| `app/app.jsx` | Composição (`<AppFrame>`) |
| `design-canvas.jsx` | Wrapper do canvas — **ignorar** (só pra visualização) |

---

## Recomendação final

**Implementar Obsidian primeiro** — é a direção mais segura, profissional e produtiva. Riverstone e Voltage ficam como variações alternativas que podem ser oferecidas como "themes" via CSS variables (basta trocar a classe `.v-obsidian` / `.v-riverstone` / `.v-voltage` no root).

Se possível, expor o switcher de variação como uma feature de "tema" no app — o `tokens.css` já está estruturado para isso.
