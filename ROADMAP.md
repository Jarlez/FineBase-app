# ROADMAP — Meu Financeiro (FineBase App)

## MVP — Checklist

### Funcionalidades Core

- [x] **Orçamento por categoria** — Definir limite mensal por categoria (ex: R$400 em Lazer). Dashboard mostra barra de progresso. Alerta visual quando ultrapassa.
- [x] **Visão de parcelamentos** — Seção listando todos os gastos parcelados em andamento: parcela X/Y, valor da parcela, quando termina, total restante.
- [x] **Gastos recorrentes / templates** — Configurar gastos que se repetem todo mês (aluguel, academia, assinaturas). Um clique pra lançar no mês atual.
- [x] **Resumo do mês atual destacado** — Card no topo do Dashboard com entradas, gastos, saldo e taxa de economia do mês corrente.
- [ ] **Responsividade mobile** *(baixa prioridade)* — Ajustar formulários e tabelas para telas pequenas.
- [ ] **Importar CSV do Nubank** — Upload do extrato CSV exportado pelo app Nubank. Preview com categorização automática por palavra-chave, seleção de registros e importação em lote. Detecta parcelas automaticamente (ex: "Parcela 4/12").

### UX / Qualidade

- [x] **Empty states** — Mensagem amigável quando não há dados (tabelas de gastos e entradas).
- [x] **Loading skeleton** — Skeleton loader nos cards e tabela enquanto dados carregam.
- [x] **Confirmação de exclusão** — Dialog de confirmação antes de deletar gasto ou entrada. *(já existia)*
- [x] **Indicador de saldo no sidebar** — Widget com entradas, gastos e saldo do mês corrente visível em todas as páginas.

### Dados / Relatório

- [x] **Exportação CSV** — Botão "Exportar CSV" em Gastos exporta os registros do período filtrado.
- [x] **Gráfico de tendência de gastos** — Linha com gastos e entradas dos últimos 12 meses no Dashboard.

---

## Fase 2 — Pós-MVP

> Quando o MVP estiver estável e em uso diário.

- [ ] Autenticação completa (Supabase Auth — email/senha, Google)
- [ ] Conta compartilhada do casal (`household_id` + RLS por grupo)
- [ ] Metas financeiras (ex: juntar R$5.000 em 6 meses, com progresso)
- [ ] Alertas e notificações (orçamento ultrapassado, resumo semanal)
- [ ] Importação de extrato CSV/OFX (Nubank, bancos)
- [ ] Dashboard consolidado do casal

---

## Fase 3 — Visão de Longo Prazo

- [ ] Open Finance / integração bancária automática (Pluggy ou Belvo)
- [ ] App mobile nativo via Capacitor (mesmo código Vue/Quasar)
- [ ] IA para categorização automática de transações
- [ ] Análise preditiva de gastos
- [ ] Relatório mensal em PDF por email
