# ROADMAP — Meu Financeiro (FineBase App)

## MVP — Checklist

### Funcionalidades Core

- [x] **Orçamento por categoria** — Definir limite mensal por categoria (ex: R$400 em Lazer). Dashboard mostra barra de progresso. Alerta visual quando ultrapassa.
- [x] **Visão de parcelamentos** — Seção listando todos os gastos parcelados em andamento: parcela X/Y, valor da parcela, quando termina, total restante.
- [x] **Gastos recorrentes / templates** — Configurar gastos que se repetem todo mês (aluguel, academia, assinaturas). Um clique pra lançar no mês atual.
- [x] **Resumo do mês atual destacado** — Card no topo do Dashboard com entradas, gastos, saldo e taxa de economia do mês corrente.
- [x] **Importar CSV do Nubank** — Upload do extrato CSV exportado pelo app Nubank. Preview com categorização automática por palavra-chave, seleção de registros e importação em lote. Modelo multi-registro para parcelamentos (1 registro por parcela já cobrada, com data real). Confirmação antes de importar duplicatas.
- [x] **Fechamento mensal consultivo** — Nova rota `/fechamento-mensal` + item no menu lateral, com leitura em linguagem de consultoria: top categorias, formas de pagamento (valor/frequência/ticket médio), estatísticas de comportamento, pontos de atenção, recomendações acionáveis e resumo narrativo.
- [x] **Score mensal (0–100)** — Substitui o card de parcelas futuras no fechamento mensal. Score calculado por regras (saldo, economia, concentração, orçamento, tendência e parcelas futuras), com barra visual e classificação.

### UX / Qualidade

- [x] **Empty states** — Mensagem amigável quando não há dados (tabelas de gastos e entradas).
- [x] **Loading skeleton** — Skeleton loader nos cards e tabela enquanto dados carregam.
- [x] **Confirmação de exclusão** — Dialog de confirmação antes de deletar gasto ou entrada. *(já existia)*
- [x] **Indicador de saldo no sidebar** — Widget com entradas, gastos e saldo do mês corrente visível em todas as páginas.

### Dados / Relatório

- [x] **Exportação CSV** — Botão "Exportar CSV" em Gastos exporta os registros do período filtrado.
- [x] **Gráfico de tendência de gastos** — Linha com gastos e entradas dos últimos 12 meses no Dashboard.
- [x] **Ajuste de tema no Dashboard** — "Maior categoria" no resumo usa contraste correto por tema (`text-grey-3` no dark e `text-grey-8` no light).

---

## Fase 2 — Pós-MVP

> Quando o MVP estiver estável e em uso diário.

- [ ] Autenticação completa (Supabase Auth — email/senha, Google)
- [ ] Conta compartilhada do casal (`household_id` + RLS por grupo)
- [ ] Dashboard consolidado do casal (visão com gastos de ambos, filtro por pessoa)
- [ ] Metas financeiras (ex: juntar R$5.000 em 6 meses, com progresso e prazo estimado)
- [ ] Alertas e notificações (orçamento ultrapassado, recorrentes não lançados no mês)
- [ ] Responsividade mobile — ajustar formulários e tabelas para telas pequenas
- [ ] Score explicável — abrir detalhamento de critérios/pesos (quanto cada regra impactou a nota no mês)
- [ ] Histórico de fechamento mensal — comparação de score e indicadores entre meses (timeline/linha do tempo)
- [ ] Recomendações inteligentes com metas — transformar alertas em plano mensal com ações priorizadas

---

## Fase 3 — Visão de Longo Prazo

- [ ] Open Finance / integração bancária automática (Pluggy ou Belvo)
- [ ] App mobile nativo via Capacitor (mesmo código Vue/Quasar)
- [ ] IA para categorização automática de transações
- [ ] Análise preditiva de gastos
- [ ] Relatório mensal em PDF por email
