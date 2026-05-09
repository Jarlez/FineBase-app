<template>
  <q-page class="dashboard-page">
    <div class="row justify-between">
      <div class="dashboard-page__header q-mb-lg col-2">
        <h1 class="dashboard-page__title text-h5 text-weight-medium q-ma-none">
          Dashboard
        </h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Visão geral das suas finanças
        </p>
      </div>

      <div class="row items-center justify-end q-gutter-sm q-mb-lg col">
        <q-select
          v-model="selectedMonths"
          :options="monthOptions"
          label="Meses"
          dense
          outlined
          multiple
          emit-value
          map-options
          hide-bottom-space
          class="dash-select"
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
          class="dash-select"
          style="min-width: 90px"
        />
        <!-- <q-btn
          rounded
          class="text-caption"
          no-caps
          flat
          dense
          icon="refresh"
          color="grey-7"
          :loading="isRefreshing"
          label="Recarregar dados"
          @click="refreshData"
        /> -->
      </div>
    </div>
    <!-- Bloco principal: resumo + stat cards (esq) | parcelamentos (dir) -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Coluna esquerda: card inteligente (resumo ou comparativo) -->
      <div class="col-12 col-md-8">
        <q-card flat class="current-month-card rounded-borders">
          <q-card-section class="q-pa-md summary-card__section">
            <!-- Modo: 1 mês — resumo simples -->
            <template v-if="!isCompareMonths">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="calendar_today" size="18px" />
                  <span
                    class="text-subtitle2 text-weight-medium text-capitalize"
                    >{{ currentMonthName }}</span
                  >
                </div>
                <q-badge
                  :color="currentMonthBalance >= 0 ? 'positive' : 'negative'"
                  :label="currentMonthBalance >= 0 ? 'No azul' : 'No vermelho'"
                  rounded
                />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-3">
                  <div class="text-caption text-grey-6">Entradas</div>
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ formatMoney(currentMonthIncomes) }}
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="text-caption text-grey-6">Gastos</div>
                  <div class="text-h6 text-weight-bold text-negative">
                    {{ formatMoney(currentMonthExpenses) }}
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="text-caption text-grey-6">Saldo</div>
                  <div
                    class="text-h6 text-weight-bold"
                    :class="
                      currentMonthBalance >= 0
                        ? 'text-positive'
                        : 'text-negative'
                    "
                  >
                    {{ formatMoney(currentMonthBalance) }}
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="text-caption text-grey-6">Maior categoria</div>
                  <div
                    class="text-subtitle1 text-weight-bold ellipsis"
                    :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
                  >
                    {{
                      currentMonthTopCategory ? currentMonthTopCategory[0] : "–"
                    }}
                  </div>
                  <div
                    v-if="currentMonthTopCategory"
                    class="text-caption text-grey-5"
                  >
                    {{ formatMoney(currentMonthTopCategory[1]) }}
                  </div>
                </div>
              </div>
              <div v-if="currentMonthSavingsRate !== null" class="q-mt-sm">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-grey-6">Taxa de economia</span>
                  <span
                    class="text-caption text-weight-medium"
                    :class="
                      currentMonthSavingsRate >= 0
                        ? 'text-positive'
                        : 'text-negative'
                    "
                    >{{ currentMonthSavingsRate }}%</span
                  >
                </div>
                <q-linear-progress
                  :value="Math.min(Math.abs(currentMonthSavingsRate) / 100, 1)"
                  :color="
                    currentMonthSavingsRate >= 0 ? 'positive' : 'negative'
                  "
                  rounded
                  size="6px"
                  style="background: var(--border-soft)"
                />
              </div>

              <!-- Resumo por forma de pagamento -->
              <div class="q-mt-lg">
                <div class="text-caption text-grey-5 q-mb-sm">Por forma de pagamento</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="pm in currentMonthPaymentMethods"
                    :key="pm.method"
                    class="col-3"
                  >
                    <div class="payment-method-item">
                      <div class="row items-center q-gutter-x-xs q-mb-xs">
                        <q-icon :name="pm.icon" size="14px" color="primary" />
                        <span class="text-caption text-grey-6">{{ pm.label }}</span>
                      </div>
                      <div class="text-caption text-weight-bold">{{ formatMoney(pm.value) }}</div>
                      <q-linear-progress
                        :value="pm.pct / 100"
                        color="primary"
                        rounded
                        size="3px"
                        style="background: var(--border-soft)"
                        class="q-mt-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Modo: 2+ meses — comparativo em tabela -->
            <template v-else>
              <div class="row items-center q-gutter-x-sm q-mb-md">
                <q-icon name="compare_arrows" color="grey-7" size="18px" />
                <span class="text-subtitle2 text-weight-medium text-grey-8">
                  Comparativo — {{ selectedYear }}
                </span>
              </div>
              <div class="compare-table">
                <!-- Cabeçalho: meses -->
                <div class="compare-table__row compare-table__row--header">
                  <div class="compare-table__label"></div>
                  <div
                    v-for="m in statIncomesByMonth"
                    :key="m.monthValue"
                    class="compare-table__cell compare-table__cell--month"
                  >
                    {{ m.monthLabel }}
                  </div>
                </div>
                <!-- Entradas -->
                <div class="compare-table__row">
                  <div class="compare-table__label">Entradas</div>
                  <div
                    v-for="m in statIncomesByMonth"
                    :key="m.monthValue"
                    class="compare-table__cell text-positive text-weight-bold"
                  >
                    {{ formatMoney(m.value) }}
                  </div>
                </div>
                <!-- Gastos -->
                <div class="compare-table__row">
                  <div class="compare-table__label">Gastos</div>
                  <div
                    v-for="m in statExpensesByMonth"
                    :key="m.monthValue"
                    class="compare-table__cell text-negative text-weight-bold"
                  >
                    {{ formatMoney(m.value) }}
                  </div>
                </div>
                <!-- Saldo -->
                <div class="compare-table__row">
                  <div class="compare-table__label">Saldo</div>
                  <div
                    v-for="m in statBalanceByMonth"
                    :key="m.monthValue"
                    class="compare-table__cell text-weight-bold"
                    :class="m.value >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    {{ formatMoney(m.value) }}
                  </div>
                </div>
                <!-- Maior gasto -->
                <div class="compare-table__row compare-table__row--last">
                  <div class="compare-table__label">Maior gasto</div>
                  <div
                    v-for="m in statTopCategoryByMonth"
                    :key="m.monthValue"
                    class="compare-table__cell text-grey-8"
                  >
                    {{ m.categoryName }}
                  </div>
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>

      <!-- Coluna direita: parcelamentos em curso -->
      <div class="col-12 col-md-4 flex column">
        <q-card flat class="dashboard-card rounded-borders">
          <q-card-section class="q-pa-md installments-section">
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center q-gutter-x-xs">
                <q-icon name="credit_card"  size="18px" />
                <span class="text-subtitle2 text-weight-medium "
                  >Parcelamentos em curso</span
                >
              </div>
              <q-badge
                v-if="activeInstallments.length"
                :label="`${activeInstallments.length} ativos`"
                color="primary"
                rounded
              />
            </div>
            <div
              v-if="!activeInstallments.length"
              class="text-caption text-grey-5 q-py-md text-center"
            >
              Nenhum parcelamento em andamento
            </div>
            <div v-else class="installments-list">
              <div
                v-for="item in activeInstallments"
                :key="item.id"
                class="installment-row"
              >
                <div class="row items-center justify-between q-mb-xs">
                  <span
                    class="text-body2 text-weight-bold ellipsis installment-name"
                    :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
                  >
                    {{ item.description }}
                  </span>
                  <span
                    class="text-body2 text-weight-bold installment-amount"
                    :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
                  >
                    {{ formatMoney(item.amount) }}
                  </span>
                </div>
                <q-linear-progress
                  :value="item.currentInstallment / item.totalInstallments"
                  color="primary"
                  rounded
                  size="6px"
                  style="background: var(--border-soft)"
                  class="q-mb-xs"
                />
                <div class="row items-center justify-between">
                  <span class="text-caption text-grey-5">
                    Parcela {{ item.currentInstallment }}/{{
                      item.totalInstallments
                    }}
                  </span>
                  <span class="text-caption text-grey-5">
                    termina {{ formatInstallmentDate(item.endDate) }}
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Orçamento por categoria -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat class="dashboard-card rounded-borders">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center">
                <q-icon
                  name="savings"
                  
                  size="18px"
                  class="q-mr-xs"
                />
                <span class="text-subtitle2 text-weight-medium"
                  >Orçamento por categoria — {{ currentMonthName }}</span
                >
              </div>
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                icon="settings"
                color="grey-6"
                label="Gerenciar"
                @click="openBudgetDialog"
              />
            </div>
            <div
              v-if="!finance.budgets.length"
              class="text-caption text-grey-5 q-py-md text-center"
            >
              Nenhum orçamento configurado.
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                label="Configurar agora"
                @click="openBudgetDialog"
              />
            </div>
            <div v-else class="budget-scroll">
              <div
                v-for="b in budgetStatus"
                :key="b.id"
                class="budget-scroll__item"
              >
                <div class="budget-item q-pa-sm">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-caption text-weight-medium">{{
                      b.category
                    }}</span>
                    <span
                      class="text-caption"
                      :class="
                        b.exceeded
                          ? 'text-negative text-weight-bold'
                          : 'text-grey-6'
                      "
                    >
                      {{ formatMoney(b.spent) }} /
                      {{ formatMoney(b.limit_amount) }}
                    </span>
                  </div>
                  <q-linear-progress
                    :value="Math.min(b.pct / 100, 1)"
                    :color="b.color"
                    rounded
                    size="8px"
                    style="background: var(--border-soft)"
                  />
                  <div class="text-caption q-mt-xs" :class="b.exceeded ? 'text-negative' : 'text-grey-5'">
                    {{ b.exceeded
                      ? `Excedido em ${formatMoney(b.spent - b.limit_amount)}`
                      : `Falta ${formatMoney(b.limit_amount - b.spent)}`
                    }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row items-center q-mb-md q-gutter-sm">
      <span class="text-body2 text-grey-7">Modo de visualização:</span>
      <q-btn
        :flat="viewMode !== 'table'"
        :unelevated="viewMode === 'table'"
        round
        dense
        icon="view_list"
        :color="viewMode === 'table' ? 'primary' : 'grey-7'"
        aria-label="Visualização em tabela"
        @click="viewMode = 'table'"
      />
      <q-btn
        :flat="viewMode !== 'charts'"
        :unelevated="viewMode === 'charts'"
        round
        dense
        icon="bar_chart"
        :color="viewMode === 'charts' ? 'primary' : 'grey-7'"
        aria-label="Visualização em gráficos"
        @click="viewMode = 'charts'"
      />
    </div>

    <template v-if="viewMode === 'charts'">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card
            flat
            class="dashboard-card dashboard-card--chart rounded-borders"
          >
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Gastos por categoria</div>
            </q-card-section>
            <q-card-section class="dashboard-card__chart-section">
              <template v-if="isCompareMonths">
                <Bar
                  v-if="categoryCompareBarData.labels.length"
                  :data="categoryCompareBarData"
                  :options="barOptions"
                />
                <div
                  v-else
                  class="text-caption text-grey-6 text-center q-py-xl"
                >
                  Nenhum dado para exibir
                </div>
              </template>
              <template v-else>
                <div
                  v-if="pieData.datasets[0].data.length"
                  class="chart-pie-wrap"
                >
                  <Pie :data="pieData" :options="pieOptions" />
                </div>
                <div
                  v-else
                  class="text-caption text-grey-6 text-center q-py-xl"
                >
                  Nenhum dado para exibir
                </div>
              </template>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card
            flat
            class="dashboard-card dashboard-card--chart rounded-borders"
          >
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Gastos por mês</div>
            </q-card-section>
            <q-card-section class="dashboard-card__chart-section">
              <Bar :data="barByMonthData" :options="barOptions" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-6">
          <q-card
            flat
            class="dashboard-card dashboard-card--chart rounded-borders"
          >
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Dias do mês com maiores gastos</div>
            </q-card-section>
            <q-card-section class="dashboard-card__chart-section">
              <Bar
                v-if="
                  isCompareMonths
                    ? dayCompareBarData.labels.length
                    : barByDayOfMonthData.datasets[0].data.length
                "
                :data="
                  isCompareMonths ? dayCompareBarData : barByDayOfMonthData
                "
                :options="barOptions"
              />
              <div v-else class="text-caption text-grey-6 text-center q-py-xl">
                Nenhum dado para exibir
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card
            flat
            class="dashboard-card dashboard-card--chart rounded-borders"
          >
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Saldo no ano</div>
            </q-card-section>
            <q-card-section class="dashboard-card__chart-section">
              <Line :data="lineBalanceData" :options="lineOptions" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-card
            flat
            class="dashboard-card dashboard-card--chart rounded-borders"
          >
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Tendência dos últimos 12 meses</div>
              <div class="text-caption text-grey-5 q-mt-xs">
                Evolução mensal de gastos e entradas
              </div>
            </q-card-section>
            <q-card-section
              class="dashboard-card__chart-section dashboard-card__chart-section--wide"
            >
              <Line :data="trendChartData" :options="lineOptions" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card flat class="dashboard-card rounded-borders">
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Entradas por fonte</div>
            </q-card-section>
            <q-card-section class="dashboard-table-section">
              <q-table
                :rows="incomeTableRows"
                :columns="incomeTableColumns"
                row-key="month"
                flat
                dense
                hide-pagination
                :pagination="{ rowsPerPage: 0 }"
                class="dashboard-table"
              />
              <div
                v-if="!incomeTableRows.length"
                class="text-caption text-grey-6 text-center q-py-lg"
              >
                Nenhum dado para exibir
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12">
          <q-card flat class="dashboard-card rounded-borders">
            <q-card-section class="q-pb-none">
              <div class="stat-card__label">Gastos por categoria</div>
            </q-card-section>
            <q-card-section class="dashboard-table-section">
              <q-table
                :rows="expenseTableRows"
                :columns="expenseTableColumns"
                row-key="month"
                flat
                dense
                hide-pagination
                :pagination="{ rowsPerPage: 0 }"
                class="dashboard-table"
              />
              <div
                v-if="!expenseTableRows.length"
                class="text-caption text-grey-6 text-center q-py-lg"
              >
                Nenhum dado para exibir
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { Bar, Line, Pie } from "vue-chartjs";
import { useFinanceStore } from "../stores/financeStore";

import { formatMoney } from "../utils/formatMoney";

const finance = useFinanceStore();
const $q = useQuasar();

const now = new Date();
const selectedMonths = ref([now.getMonth() + 1]);
const selectedYear = ref(now.getFullYear());

const currentMonth = now.getMonth() + 1;
const currentMonthName = now.toLocaleString("pt-BR", {
  month: "long",
  year: "numeric",
});

const currentMonthIncomes = computed(() =>
  finance.monthlyIncomesTotal(currentMonth, currentYear)
);
const currentMonthExpenses = computed(() =>
  finance.monthlyExpensesTotal(currentMonth, currentYear)
);
const currentMonthBalance = computed(() =>
  finance.balance(currentMonth, currentYear)
);

const currentMonthTopCategory = computed(() => {
  const cats = finance.expensesByCategory(currentMonth, currentYear);
  const entries = Object.entries(cats);
  if (!entries.length) return null;
  return entries.reduce((max, cur) => (cur[1] > max[1] ? cur : max));
});

const PAYMENT_META = {
  credito:  { label: 'Crédito',  icon: 'credit_card',       color: 'primary'  },
  debito:   { label: 'Débito',   icon: 'account_balance',   color: 'info'     },
  pix:      { label: 'Pix',      icon: 'pix',               color: 'positive' },
  dinheiro: { label: 'Dinheiro', icon: 'payments',          color: 'warning'  },
};

const currentMonthPaymentMethods = computed(() => {
  const map = {};
  finance.expenses.forEach((e) => {
    const d = new Date(e.date + "T00:00:00");
    if (d.getMonth() + 1 !== currentMonth || d.getFullYear() !== currentYear) return;
    const key = e.payment_method || 'outros';
    map[key] = (map[key] || 0) + Number(e.amount || 0);
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0);
  return Object.keys(PAYMENT_META).map((method) => ({
    method,
    value: map[method] || 0,
    pct: total > 0 ? ((map[method] || 0) / total) * 100 : 0,
    ...PAYMENT_META[method],
  }));
});

const currentMonthSavingsRate = computed(() => {
  const inc = currentMonthIncomes.value;
  if (inc <= 0) return null;
  return Math.round((currentMonthBalance.value / inc) * 100);
});
const isRefreshing = ref(false);
const viewMode = ref("charts"); // 'charts' | 'table'

async function refreshData() {
  isRefreshing.value = true;
  try {
    await finance.loadData();
  } finally {
    isRefreshing.value = false;
  }
}

/** Meses ativos para filtro: se vazio, considera todos (1–12). */
const activeMonths = computed(() => {
  const months = selectedMonths.value;
  if (!months || !months.length) return monthOptions.map((m) => m.value);
  return months;
});

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

const currentYear = now.getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => {
  const year = currentYear - 2 + index;
  return {
    label: String(year),
    value: year,
  };
});

/** Extrai ano e mês (1–12) de data ISO (YYYY-MM-DD). */
function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12)
    return null;
  const hasDay = !Number.isNaN(day) && day >= 1 && day <= 31;
  return { year, month, ...(hasDay ? { day } : {}) };
}

/** True quando há 2+ meses selecionados (comparativo). */
const isCompareMonths = computed(() => {
  const sel = selectedMonths.value;
  return sel && sel.length >= 2;
});

const filteredExpenses = computed(() => {
  const months = activeMonths.value;
  const year = selectedYear.value;

  return finance.expenses.filter((expense) => {
    if (!expense.date) return false;
    const d = new Date(expense.date);
    if (Number.isNaN(d.getTime())) return false;
    return months.includes(d.getMonth() + 1) && d.getFullYear() === year;
  });
});

const filteredIncomes = computed(() => {
  const months = activeMonths.value;
  const year = selectedYear.value;

  return finance.incomes.filter((income) => {
    if (!income.date) return false;
    const d = new Date(income.date);
    if (Number.isNaN(d.getTime())) return false;
    return months.includes(d.getMonth() + 1) && d.getFullYear() === year;
  });
});

/** Por mês (para cards em modo comparativo). */
const statIncomesByMonth = computed(() => {
  const year = selectedYear.value;
  return activeMonths.value.map((monthValue) => {
    const total = finance.incomes
      .filter((i) => {
        const p = parseDateParts(i.date);
        return p && p.year === year && p.month === monthValue;
      })
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    return {
      monthValue,
      monthLabel:
        monthOptions.find((m) => m.value === monthValue)?.label ||
        `Mês ${monthValue}`,
      value: total,
    };
  });
});

const statExpensesByMonth = computed(() => {
  const year = selectedYear.value;
  return activeMonths.value.map((monthValue) => {
    const total = finance.expenses
      .filter((e) => {
        const p = parseDateParts(e.date);
        return p && p.year === year && p.month === monthValue;
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return {
      monthValue,
      monthLabel:
        monthOptions.find((m) => m.value === monthValue)?.label ||
        `Mês ${monthValue}`,
      value: total,
    };
  });
});

const statBalanceByMonth = computed(() => {
  return statIncomesByMonth.value.map((inc, i) => {
    const exp = statExpensesByMonth.value[i]?.value ?? 0;
    return {
      monthValue: inc.monthValue,
      monthLabel: inc.monthLabel,
      value: inc.value - exp,
    };
  });
});

const statTopCategoryByMonth = computed(() => {
  const year = selectedYear.value;
  return activeMonths.value.map((monthValue) => {
    const byCat = {};
    finance.expenses.forEach((e) => {
      const p = parseDateParts(e.date);
      if (!p || p.year !== year || p.month !== monthValue) return;
      const cat = e.category || "Sem categoria";
      byCat[cat] = (byCat[cat] || 0) + Number(e.amount || 0);
    });
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    return {
      monthValue,
      monthLabel:
        monthOptions.find((m) => m.value === monthValue)?.label ||
        `Mês ${monthValue}`,
      categoryName: top ? top[0] : "–",
    };
  });
});

const categoryAggregation = computed(() => {
  const map = {};
  filteredExpenses.value.forEach((expense) => {
    const category = expense.category || "Sem categoria";
    map[category] = (map[category] || 0) + Number(expense.amount || 0);
  });
  return map;
});

const locationAggregation = computed(() => {
  const map = {};
  filteredExpenses.value.forEach((expense) => {
    const location = expense.location || "Sem local";
    map[location] = (map[location] || 0) + Number(expense.amount || 0);
  });
  return map;
});

const topCategory = computed(() => {
  const entries = Object.entries(categoryAggregation.value);
  if (!entries.length) return null;
  const [name, value] = entries.sort((a, b) => b[1] - a[1])[0];
  return { name, value };
});

const topLocation = computed(() => {
  const entries = Object.entries(locationAggregation.value);
  if (!entries.length) return null;
  const [name, value] = entries.sort((a, b) => b[1] - a[1])[0];
  return { name, value };
});

/** Fontes de entrada únicas (para colunas da tabela). */
const incomeSources = computed(() => {
  const set = new Set();
  filteredIncomes.value.forEach((i) =>
    set.add(i.source ? String(i.source).trim() || "Sem fonte" : "Sem fonte")
  );
  return Array.from(set).sort();
});

/** Colunas da tabela de entradas: Mês + uma coluna por fonte. */
const incomeTableColumns = computed(() => {
  const cols = [{ name: "mes", label: "Mês", field: "mes", align: "left" }];
  incomeSources.value.forEach((source) => {
    cols.push({
      name: source,
      label: source,
      field: source,
      align: "right",
      format: (val) => formatMoney(val || 0),
    });
  });
  return cols;
});

/** Linhas da tabela de entradas: uma por mês no período, valores por fonte. */
const incomeTableRows = computed(() => {
  const months = activeMonths.value;
  const year = selectedYear.value;
  const sources = incomeSources.value;
  if (!sources.length) return [];

  return months.map((monthValue) => {
    const mes =
      monthOptions.find((m) => m.value === monthValue)?.label + " " + year;
    const row = { month: monthValue, mes };
    sources.forEach((source) => {
      row[source] = filteredIncomes.value
        .filter((income) => {
          const d = new Date(income.date);
          return (
            d.getMonth() + 1 === monthValue &&
            d.getFullYear() === year &&
            (income.source
              ? String(income.source).trim() || "Sem fonte"
              : "Sem fonte") === source
          );
        })
        .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    });
    return row;
  });
});

/** Categorias de gasto únicas (para colunas da tabela). */
const expenseCategories = computed(() => {
  const set = new Set();
  filteredExpenses.value.forEach((e) =>
    set.add(
      e.category
        ? String(e.category).trim() || "Sem categoria"
        : "Sem categoria"
    )
  );
  return Array.from(set).sort();
});

/** Colunas da tabela de gastos: Mês + uma coluna por categoria. */
const expenseTableColumns = computed(() => {
  const cols = [{ name: "mes", label: "Mês", field: "mes", align: "left" }];
  expenseCategories.value.forEach((cat) => {
    cols.push({
      name: cat,
      label: cat,
      field: cat,
      align: "right",
      format: (val) => formatMoney(val || 0),
    });
  });
  return cols;
});

/** Linhas da tabela de gastos: uma por mês no período, valores por categoria. */
const expenseTableRows = computed(() => {
  const months = activeMonths.value;
  const year = selectedYear.value;
  const categories = expenseCategories.value;
  if (!categories.length) return [];

  return months.map((monthValue) => {
    const mes =
      monthOptions.find((m) => m.value === monthValue)?.label + " " + year;
    const row = { month: monthValue, mes };
    categories.forEach((category) => {
      row[category] = filteredExpenses.value
        .filter((expense) => {
          const d = new Date(expense.date);
          const expCat = expense.category
            ? String(expense.category).trim() || "Sem categoria"
            : "Sem categoria";
          return (
            d.getMonth() + 1 === monthValue &&
            d.getFullYear() === year &&
            expCat === category
          );
        })
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    });
    return row;
  });
});

const pieData = computed(() => {
  const labels = Object.keys(categoryAggregation.value);
  const data = Object.values(categoryAggregation.value);

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#6366f1",
          "#34d399",
          "#fb923c",
          "#f87171",
          "#c084fc",
          "#38bdf8",
          "#a78bfa",
          "#4ade80",
        ],
      },
    ],
  };
});

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "left",
      align: "start",
      labels: {
        boxWidth: 14,
        padding: 12,
        useBorderRadius: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      callbacks: {
        label(context) {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const pct = total ? ((value / total) * 100).toFixed(1) : "0";
          return `${label}: ${formatMoney(value)} (${pct}%)`;
        },
      },
    },
  },
};

/** Gastos por categoria por mês (comparativo: Bar com uma série por mês). */
const categoryCompareBarData = computed(() => {
  const year = selectedYear.value;
  const months = activeMonths.value;
  const byMonthCategory = {};
  const allCategories = new Set();

  months.forEach((m) => (byMonthCategory[m] = {}));
  finance.expenses.forEach((expense) => {
    const parts = parseDateParts(expense.date);
    if (!parts || parts.year !== year || !months.includes(parts.month)) return;
    const cat = expense.category || "Sem categoria";
    allCategories.add(cat);
    byMonthCategory[parts.month][cat] =
      (byMonthCategory[parts.month][cat] || 0) + Number(expense.amount || 0);
  });

  const categories = Array.from(allCategories).sort();
  const colors = [
    "#6366f1",
    "#34d399",
    "#fb923c",
    "#f87171",
    "#c084fc",
    "#38bdf8",
    "#a78bfa",
  ];
  const datasets = months.map((monthValue, i) => ({
    label:
      monthOptions.find((m) => m.value === monthValue)?.label ||
      `Mês ${monthValue}`,
    data: categories.map((c) => byMonthCategory[monthValue][c] || 0),
    backgroundColor: colors[i % colors.length],
  }));

  return {
    labels: categories,
    datasets,
  };
});

const barByMonthData = computed(() => {
  const year = selectedYear.value;
  const expensesByMonth = finance.expensesByMonth(year);
  const months = activeMonths.value;

  const labels = monthOptions
    .filter((m) => months.includes(m.value))
    .map((m) => m.label);

  const data = monthOptions
    .filter((m) => months.includes(m.value))
    .map((m) => expensesByMonth[m.value - 1] || 0);

  return {
    labels,
    datasets: [
      {
        label: "Gastos",
        backgroundColor: "#6366f1",
        data,
      },
    ],
  };
});

/** Gastos agregados por dia do mês (1–31) no período filtrado; ordenados pelos maiores. */
const barByDayOfMonthData = computed(() => {
  const byDay = {};
  for (let d = 1; d <= 31; d++) byDay[d] = 0;
  filteredExpenses.value.forEach((expense) => {
    const parts = parseDateParts(expense.date);
    if (!parts || parts.day == null) return;
    byDay[parts.day] = (byDay[parts.day] || 0) + Number(expense.amount || 0);
  });

  const entries = Object.entries(byDay)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = entries.map(([day]) => `Dia ${day}`);
  const data = entries.map(([, value]) => value);

  return {
    labels,
    datasets: [
      {
        label: "Gastos",
        backgroundColor: "#71717a",
        data,
      },
    ],
  };
});

/** Dias do mês com maiores gastos por mês (comparativo: Bar com uma série por mês). */
const dayCompareBarData = computed(() => {
  const year = selectedYear.value;
  const months = activeMonths.value;
  const byMonthDay = {};
  months.forEach((m) => {
    byMonthDay[m] = {};
    for (let d = 1; d <= 31; d++) byMonthDay[m][d] = 0;
  });

  finance.expenses.forEach((expense) => {
    const parts = parseDateParts(expense.date);
    if (
      !parts ||
      parts.year !== year ||
      !months.includes(parts.month) ||
      parts.day == null
    )
      return;
    byMonthDay[parts.month][parts.day] += Number(expense.amount || 0);
  });

  const totalByDay = {};
  for (let d = 1; d <= 31; d++) {
    totalByDay[d] = months.reduce((sum, m) => sum + byMonthDay[m][d], 0);
  }
  const topDays = Object.entries(totalByDay)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([day]) => Number(day));

  const labels = topDays.map((d) => `Dia ${d}`);
  const colors = ["#64748b", "#2563eb", "#059669", "#7c3aed", "#d97706"];
  const datasets = months.map((monthValue, i) => ({
    label:
      monthOptions.find((m) => m.value === monthValue)?.label ||
      `Mês ${monthValue}`,
    data: topDays.map((day) => byMonthDay[monthValue][day] || 0),
    backgroundColor: colors[i % colors.length],
  }));

  return {
    labels,
    datasets,
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label(context) {
          return formatMoney(context.parsed.y);
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const lineBalanceData = computed(() => {
  const year = selectedYear.value;
  const balances = finance.balanceEvolutionByMonth(year);

  return {
    labels: monthOptions.map((m) => m.label),
    datasets: [
      {
        label: "Saldo",
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.12)",
        data: balances,
        fill: true,
        tension: 0.2,
      },
    ],
  };
});

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label(context) {
          return formatMoney(context.parsed.y);
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

/** Tendência dos últimos 12 meses: gastos e entradas lado a lado. */
const trendChartData = computed(() => {
  const points = [];
  const labels = [];
  const ref = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    points.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    labels.push(d.toLocaleString("pt-BR", { month: "short", year: "2-digit" }));
  }

  const expensesData = points.map(({ year, month }) =>
    finance.expenses
      .filter((e) => {
        const p = parseDateParts(e.date);
        return p && p.year === year && p.month === month;
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)
  );

  const incomesData = points.map(({ year, month }) =>
    finance.incomes
      .filter((i) => {
        const p = parseDateParts(i.date);
        return p && p.year === year && p.month === month;
      })
      .reduce((sum, i) => sum + Number(i.amount || 0), 0)
  );

  return {
    labels,
    datasets: [
      {
        label: "Gastos",
        data: expensesData,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.06)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 1.5,
      },
      {
        label: "Entradas",
        data: incomesData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.06)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 1.5,
      },
    ],
  };
});

// Parcelamentos em andamento
function formatInstallmentDate(date) {
  if (!date) return "–";
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

const activeInstallments = computed(() => {
  const now = new Date();
  return finance.expenses
    .filter((e) => e.expense_type === "parcelado" && e.installments > 0)
    .map((e) => {
      const start = new Date(e.date + "T00:00:00");
      const monthDiff =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());
      const currentInstallment = Math.max(1, monthDiff + 1);
      const total = Number(e.installments);
      const remaining = Math.max(0, total - currentInstallment);
      const endDate = new Date(
        start.getFullYear(),
        start.getMonth() + total - 1,
        //start.getMonth() + total , // para mostrar o pagamento, e nao ultima cobrança.
        1
      );
      return {
        ...e,
        currentInstallment,
        totalInstallments: total,
        remaining,
        endDate,
        totalRemaining: (remaining + 1) * Number(e.amount),
      };
    })
    .filter((e) => e.currentInstallment <= e.totalInstallments)
    .sort((a, b) => a.remaining - b.remaining);
});

// Orçamentos por categoria
const budgetStatus = computed(() => {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  const byCat = finance.expensesByCategory(m, y);
  return finance.budgets
    .map((b) => {
      const spent = byCat[b.category] || 0;
      const pct = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0;
      return {
        ...b,
        spent,
        pct,
        exceeded: spent > b.limit_amount,
        color: pct >= 100 ? "negative" : pct >= 50 ? "warning" : "positive",
      };
    })
    .sort((a, b) => b.pct - a.pct);
});

const openBudgetDialog = inject("openBudgetDialog");

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData();
  }
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px 24px;
}

/* ── Header selects ─────────────────────────────────────── */
.dash-select :deep(.q-field__control) {
  background: var(--surface) !important;
}

/* ── Cards ──────────────────────────────────────────────── */
.dashboard-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
.current-month-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

/* ── Stat cards ─────────────────────────────────────────── */
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-card__content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
}
.stat-card__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-soft);
  color: var(--accent);
}
.stat-card--income .stat-card__icon {
  color: var(--pos);
}
.stat-card--expense .stat-card__icon {
  color: var(--neg);
}
.stat-card--balance .stat-card__icon {
  color: var(--accent);
}
.stat-card--top .stat-card__icon {
  color: var(--warn);
}
.stat-card--daily .stat-card__icon {
  color: var(--accent);
}
.stat-card--payment .stat-card__icon {
  color: var(--pos);
}

.stat-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  letter-spacing: 0;
}
.stat-card__value {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: var(--letter-tighter);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--text);
  line-height: 1.2;
}
.stat-card__value--income {
  color: var(--pos);
}
.stat-card__value--expense {
  color: var(--neg);
}
.stat-card__value--positive {
  color: var(--pos);
}
.stat-card__value--negative {
  color: var(--neg);
}
.stat-card__value--daily {
  color: var(--text);
}

.stat-card__compare-line {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
  line-height: 1.4;
}
.stat-card__top-category {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.stat-card__top-location {
  font-size: 12px;
  color: var(--text-3);
}
.stat-card__subtext {
  font-size: 11px;
  color: var(--text-4);
}

/* ── Charts ─────────────────────────────────────────────── */
.dashboard-card--chart .dashboard-card__chart-section {
  min-height: 280px;
}
.dashboard-card--chart .dashboard-card__chart-section--wide {
  min-height: 220px;
}
.chart-pie-wrap {
  max-height: 240px;
  margin: 0 auto;
}

/* ── Table view ─────────────────────────────────────────── */
.dashboard-table-section {
  max-height: 420px;
  overflow: auto;
}
.dashboard-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--surface) !important;
  color: var(--text-3) !important;
}
.dashboard-table :deep(td:first-child),
.dashboard-table :deep(thead th:first-child) {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--surface) !important;
  color: var(--text-2) !important;
  font-weight: 500;
}
.dashboard-table :deep(thead th:first-child) {
  z-index: 3;
}

/* ── Payment method item ─────────────────────────────────── */
.payment-method-item {
  background: var(--bg-soft);
  border-radius: var(--radius);
  padding: 8px 10px;
}

/* ── Summary card fixed height ───────────────────────────── */
.summary-card__section {
  min-height: 290px;
  height: 290px;
  max-height: 290px;
}

/* ── Compare table ───────────────────────────────────────── */
.compare-table {
  display: flex;
  flex-direction: column;
}
.compare-table__row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-soft);
  gap: 8px;
}
.compare-table__row--header {
  padding-bottom: 6px;
  border-bottom: 2px solid var(--border);
}
.compare-table__row--last {
  border-bottom: none;
}
.compare-table__label {
  flex: 0 0 90px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-3);
}
.compare-table__cell {
  flex: 1;
  font-size: 15px;
  text-align: right;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
.compare-table__cell--month {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  font-family: inherit;
}

/* ── Installments & budget ───────────────────────────────── */
.installments-section {
  height: 290px;
  max-height: 290px;
  min-height: 290px;
  display: flex;
  flex-direction: column;
}
.installments-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.installment-row {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-soft);
}
.installment-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.installment-name {
  max-width: 60%;
}
.installment-amount {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.budget-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.budget-scroll__item {
  flex: 0 0 calc(25% - 9px);
  min-width: 200px;
}
.budget-item {
  background: var(--bg-soft);
  border-radius: var(--radius);
  border: 1px solid var(--border-soft);
}
</style>
