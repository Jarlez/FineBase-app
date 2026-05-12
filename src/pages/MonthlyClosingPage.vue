<template>
  <q-page class="monthly-closing-page">
    <div class="row justify-between">
      <div class="column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Fechamento mensal</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Seu resumo financeiro com leitura consultiva do mês
        </p>
      </div>

      <div class="row items-center q-gutter-sm q-mb-lg">
        <q-btn
          label="Exportar PDF"
          no-caps
          unelevated
          icon="picture_as_pdf"
          rounded
          style="border: 1px solid var(--border)"
          class="bg-white text-secondary q-mr-lg"
          :disable="isInitialLoading"
          @click="exportPdf"
        />
        <q-select
          v-model="selectedMonth"
          :options="monthOptions"
          label="Mês"
          dense
          outlined
          emit-value
          map-options
          hide-bottom-space
          class="close-select"
          style="min-width: 140px"
        />
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Ano"
          dense
          outlined
          emit-value
          map-options
          hide-bottom-space
          class="close-select"
          style="min-width: 92px"
        />
      </div>
    </div>

    <q-card
      v-if="finance.error"
      flat
      class="page-card page-card--error rounded-borders q-mb-md"
    >
      <q-card-section class="text-negative">
        {{ finance.error }}
      </q-card-section>
    </q-card>

    <template v-if="isInitialLoading">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card">
            <q-card-section class="closing-stat-card__content">
              <q-skeleton
                type="rect"
                width="38px"
                height="38px"
                style="border-radius: 8px; flex-shrink: 0"
              />
              <div class="closing-stat-card__body">
                <q-skeleton type="text" width="58%" />
                <q-skeleton type="text" width="75%" height="18px" />
                <q-skeleton type="text" width="48%" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-skeleton type="rect" height="560px" style="border-radius: 10px" />
    </template>

    <template v-else>
      <!-- ── stat cards ─────────────────────────────────────── -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card closing-stat-card--income">
            <q-card-section class="closing-stat-card__content">
              <div class="closing-stat-card__icon">
                <q-icon name="trending_up" size="22px" />
              </div>
              <div class="closing-stat-card__body">
                <span class="closing-stat-card__label">Entradas no mês</span>
                <span
                  class="closing-stat-card__value closing-stat-card__value--positive"
                >
                  {{ formatMoney(incomesTotal) }}
                </span>
                <span class="closing-stat-card__subtext">{{
                  periodLabel
                }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card closing-stat-card--expense">
            <q-card-section class="closing-stat-card__content">
              <div class="closing-stat-card__icon">
                <q-icon name="trending_down" size="22px" />
              </div>
              <div class="closing-stat-card__body">
                <span class="closing-stat-card__label">Gastos no mês</span>
                <span
                  class="closing-stat-card__value closing-stat-card__value--negative"
                >
                  {{ formatMoney(expensesTotal) }}
                </span>
                <span class="closing-stat-card__subtext">
                  {{ totalExpenseTransactions }} gasto{{
                    totalExpenseTransactions === 1 ? "" : "s"
                  }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card closing-stat-card--balance">
            <q-card-section class="closing-stat-card__content">
              <div class="closing-stat-card__icon">
                <q-icon name="savings" size="22px" />
              </div>
              <div class="closing-stat-card__body">
                <span class="closing-stat-card__label">Saldo do mês</span>
                <span
                  class="closing-stat-card__value"
                  :class="
                    balance >= 0
                      ? 'closing-stat-card__value--positive'
                      : 'closing-stat-card__value--negative'
                  "
                >
                  {{ formatMoney(balance) }}
                </span>
                <span class="closing-stat-card__subtext">{{
                  savingsRateLabel
                }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card closing-stat-card--score">
            <q-card-section class="closing-stat-card__content">
              <div class="closing-stat-card__icon">
                <q-icon name="military_tech" size="22px" />
              </div>
              <div class="closing-stat-card__body">
                <span class="closing-stat-card__label">Score mensal</span>
                <span class="closing-stat-card__value">
                  {{ monthlyScore }}/100
                </span>
                <span class="closing-stat-card__subtext">{{ monthlyScoreLabel }}</span>
              </div>
              <div class="score-vbar">
                <div class="score-vbar__track">
                  <div
                    class="score-vbar__fill"
                    :style="{ height: `${monthlyScore}%`, background: scoreBarCssColor }"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ── top categorias + formas de pagamento ───────────── -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Top categorias do mês
              </div>
              <div class="text-caption text-grey-6">
                Onde o dinheiro foi mais embora
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="topCategories.length" class="metric-table">
                <div class="metric-table__head">
                  <span>Categoria</span>
                  <span>Valor</span>
                  <span>%</span>
                  <span>Qtde</span>
                </div>
                <div
                  v-for="category in topCategories"
                  :key="category.name"
                  class="metric-table__row"
                >
                  <div class="metric-table__category">
                    <strong>{{ category.name }}</strong>
                    <q-linear-progress
                      :value="category.percent / 100"
                      rounded
                      size="6px"
                      color="primary"
                      track-color="grey-4"
                      class="q-mt-xs"
                    />
                  </div>
                  <span>{{ formatMoney(category.total) }}</span>
                  <span>{{ formatPercent(category.percent) }}</span>
                  <span>{{ category.count }}</span>
                </div>
              </div>
              <div v-else class="empty-text">
                Sem gastos categorizados neste período.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Formas de pagamento
              </div>
              <div class="text-caption text-grey-6">
                Como foi gasto e com que frequência
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="paymentByValue.length" class="payment-wrap">
                <div class="payment-block">
                  <div class="payment-block__title">Por valor total</div>
                  <div class="metric-table metric-table--payment">
                    <div class="metric-table__head">
                      <span>Forma</span>
                      <span>Valor</span>
                      <span>%</span>
                    </div>
                    <div
                      v-for="payment in paymentByValue"
                      :key="`${payment.method}-value`"
                      class="metric-table__row"
                    >
                      <span>{{ payment.label }}</span>
                      <span>{{ formatMoney(payment.total) }}</span>
                      <span>{{ formatPercent(payment.percent) }}</span>
                    </div>
                  </div>
                </div>

                <div class="payment-block">
                  <div class="payment-block__title">Por quantidade de uso</div>
                  <div class="metric-table metric-table--payment">
                    <div class="metric-table__head">
                      <span>Forma</span>
                      <span>Uso</span>
                      <span>Ticket médio</span>
                    </div>
                    <div
                      v-for="payment in paymentByCount"
                      :key="`${payment.method}-count`"
                      class="metric-table__row"
                    >
                      <span>{{ payment.label }}</span>
                      <span>{{ payment.count }}x</span>
                      <span>{{ formatMoney(payment.avgTicket) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-text">
                Sem gastos no período para analisar formas de pagamento.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ── estatísticas de comportamento + pontos de atenção ─ -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Estatísticas de comportamento
              </div>
              <div class="text-caption text-grey-6">
                Padrões de gasto do mês
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="behavior-grid">
                <div
                  v-for="item in behaviorStats"
                  :key="item.label"
                  class="behavior-item"
                >
                  <span class="behavior-item__label">{{ item.label }}</span>
                  <span class="behavior-item__value">{{ item.value }}</span>
                  <span v-if="item.subtext" class="behavior-item__subtext">{{
                    item.subtext
                  }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Pontos de atenção
              </div>
              <div class="text-caption text-grey-6">
                O que merece cuidado agora
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="attentionPoints.length" class="insights-list">
                <div
                  v-for="(point, index) in attentionPoints"
                  :key="`attention-${index}`"
                  class="insight-row"
                >
                  <q-icon
                    :name="point.icon"
                    size="18px"
                    class="insight-row__icon"
                    :class="point.tone"
                  />
                  <span>{{ point.text }}</span>
                </div>
              </div>
              <div v-else class="empty-text">
                Nenhum alerta crítico no período. Seu controle está consistente.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ── recomendações + resumo consultivo ─────────────────── -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Recomendações do mês
              </div>
              <div class="text-caption text-grey-6">
                O que fazer a partir dos dados
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="insights-list">
                <div
                  v-for="(item, index) in recommendations"
                  :key="`recommend-${index}`"
                  class="insight-row"
                >
                  <q-icon
                    name="tips_and_updates"
                    size="18px"
                    class="insight-row__icon insight-row__icon--positive"
                  />
                  <span>{{ item }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Resumo consultivo
              </div>
              <div
                class="text-caption"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                {{ periodLabel }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="insights-list">
                <div
                  v-for="(line, index) in consultiveSummary"
                  :key="`summary-${index}`"
                  class="insight-row"
                >
                  <q-icon
                    name="fiber_manual_record"
                    size="10px"
                    class="insight-row__icon"
                  />
                  <span>{{ line }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ── histórico do score + composição dos gastos ─────────── -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Histórico do score
              </div>
              <div class="text-caption text-grey-6">
                Evolução nos 6 meses até {{ periodLabel }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="score-history-chart">
                <Line :data="scoreChartData" :options="scoreChartOptions" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">
                Composição dos gastos
              </div>
              <div class="text-caption text-grey-6">
                Fixo, variável e parcelado
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="expensesTotal > 0" class="expense-type-list">
                <div
                  v-for="type in expenseTypeStats"
                  :key="type.key"
                  class="expense-type-item"
                >
                  <div class="expense-type-item__header">
                    <div class="expense-type-item__label">
                      <q-icon :name="type.icon" size="14px" />
                      <span>{{ type.label }}</span>
                    </div>
                    <span class="expense-type-item__value">{{
                      formatMoney(type.total)
                    }}</span>
                  </div>
                  <q-linear-progress
                    :value="type.percent / 100"
                    rounded
                    size="5px"
                    color="primary"
                    track-color="grey-4"
                    class="q-my-xs"
                  />
                  <div class="expense-type-item__footer">
                    <span>{{ formatPercent(type.percent) }} do total</span>
                    <span>{{ type.count }} lançamento(s)</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-text">
                Sem gastos no período para analisar composição.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { Line } from "vue-chartjs";
import { useFinanceStore } from "../stores/financeStore";
import { formatMoney } from "../utils/formatMoney";
import {
  useMonthlyClosing,
  formatPercent,
} from "../composables/useMonthlyClosing";

const finance = useFinanceStore();
const $q = useQuasar();

const now = new Date();
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear = ref(now.getFullYear());

const monthOptions = [
  { label: "Janeiro", value: 1 },
  { label: "Fevereiro", value: 2 },
  { label: "Março", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Maio", value: 5 },
  { label: "Junho", value: 6 },
  { label: "Julho", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Setembro", value: 9 },
  { label: "Outubro", value: 10 },
  { label: "Novembro", value: 11 },
  { label: "Dezembro", value: 12 },
];

const yearOptions = computed(() => {
  const years = new Set([selectedYear.value, now.getFullYear()]);
  finance.expenses.forEach((e) => {
    const y = parseYear(e.date);
    if (y) years.add(y);
  });
  finance.incomes.forEach((i) => {
    const y = parseYear(i.date);
    if (y) years.add(y);
  });
  return Array.from(years).sort((a, b) => b - a);
});

function parseYear(dateString) {
  if (!dateString) return null;
  const d = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

const {
  periodLabel,
  incomesTotal,
  expensesTotal,
  balance,
  savingsRateLabel,
  totalExpenseTransactions,
  monthlyScore,
  monthlyScoreColor,
  monthlyScoreLabel,
  topCategories,
  paymentByValue,
  paymentByCount,
  behaviorStats,
  expenseTypeStats,
  attentionPoints,
  recommendations,
  consultiveSummary,
  scoreHistory,
  exportPdf,
} = useMonthlyClosing(selectedMonth, selectedYear);

const isInitialLoading = computed(() => {
  const hasNoData = !finance.expenses.length && !finance.incomes.length;
  return finance.loading && hasNoData;
});

const scoreBarCssColor = computed(() => {
  const map = { positive: '#059669', warning: '#d97706', negative: '#dc2626' }
  return map[monthlyScoreColor.value] ?? '#2563eb'
})

function scorePointColor(score) {
  if (score >= 85) return "#059669";
  if (score >= 70) return "#0ea5e9";
  if (score >= 55) return "#d97706";
  return "#dc2626";
}

const scoreChartData = computed(() => ({
  labels: scoreHistory.value.map((h) => h.label),
  datasets: [
    {
      data: scoreHistory.value.map((h) => h.score),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: scoreHistory.value.map((h) =>
        scorePointColor(h.score)
      ),
      pointBorderColor: scoreHistory.value.map((h) => scorePointColor(h.score)),
      pointBorderWidth: 2,
    },
  ],
}));

const scoreChartOptions = computed(() => {
  const textColor = $q.dark.isActive ? "#94a3b8" : "#64748b";
  const gridColor = $q.dark.isActive
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Score: ${ctx.raw}/100`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25, color: textColor },
        grid: { color: gridColor },
        border: { display: false },
      },
      x: {
        ticks: { color: textColor },
        grid: { display: false },
        border: { display: false },
      },
    },
  };
});

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData();
  }
});
</script>

<style scoped>
.monthly-closing-page {
  padding: 20px 24px;
}

.close-select :deep(.q-field__control) {
  background: var(--surface) !important;
}

.full-height {
  height: 100%;
}

.closing-stat-card,
.analysis-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.closing-stat-card {
  transition: box-shadow 0.15s;
}

.closing-stat-card:hover {
  box-shadow: var(--shadow-md);
}

.closing-stat-card__content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.closing-stat-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.closing-stat-card--income .closing-stat-card__icon {
  color: var(--pos);
}

.closing-stat-card--expense .closing-stat-card__icon {
  color: var(--neg);
}

.closing-stat-card--installments .closing-stat-card__icon {
  color: var(--warn);
}

.closing-stat-card--score .closing-stat-card__icon {
  color: var(--accent);
}

.score-vbar {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  height: 52px;
}

.score-vbar__track {
  width: 10px;
  height: 100%;
  background: var(--bg-soft);
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.score-vbar__fill {
  width: 100%;
  border-radius: 5px;
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.closing-stat-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.closing-stat-card__label {
  font-size: 12px;
  color: var(--text-3);
}

.closing-stat-card__value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text);
  font-family: var(--font-mono);
  letter-spacing: var(--letter-tighter);
}

.closing-stat-card__value--positive {
  color: var(--pos);
}

.closing-stat-card__value--negative {
  color: var(--neg);
}

.closing-stat-card__subtext {
  font-size: 11px;
  color: var(--text-4);
}

.analysis-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.metric-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-table__head,
.metric-table__row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 1fr 0.8fr 0.7fr;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.metric-table__head {
  color: var(--text-3);
  font-weight: 500;
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 8px;
}

.metric-table__row {
  color: var(--text-2);
}

.metric-table__category {
  min-width: 0;
}

.metric-table__category strong {
  display: block;
  color: var(--text);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-wrap {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.payment-block__title {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 8px;
}

.metric-table--payment .metric-table__head,
.metric-table--payment .metric-table__row {
  grid-template-columns: minmax(0, 1.3fr) 1fr 1fr;
}

.behavior-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.behavior-item {
  background: var(--bg-soft);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.behavior-item__label {
  font-size: 11px;
  color: var(--text-3);
}

.behavior-item__value {
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
}

.behavior-item__subtext {
  font-size: 11px;
  color: var(--text-4);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.insight-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--text-2);
  line-height: 1.45;
}

.insight-row__icon {
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.insight-row__icon--positive {
  color: var(--pos);
}

.insight-row__icon--negative {
  color: var(--neg);
}

.insight-row__icon--warning {
  color: var(--warn);
}

.empty-text {
  font-size: 13px;
  color: var(--text-3);
}

/* score history chart */
.score-history-chart {
  height: 180px;
  position: relative;
}

/* expense type breakdown */
.expense-type-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.expense-type-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expense-type-item__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.expense-type-item__value {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text);
}

.expense-type-item__footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-4);
}

@media (max-width: 1024px) {
  .behavior-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .monthly-closing-page {
    padding: 16px;
  }

  .analysis-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .metric-table__head,
  .metric-table__row {
    grid-template-columns: minmax(0, 1.4fr) 1fr 0.9fr 0.7fr;
    font-size: 11px;
  }
}
</style>
