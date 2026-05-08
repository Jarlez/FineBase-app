<template>
  <q-page class="dashboard-page">
    <div class="dashboard-page__header q-mb-lg">
      <h1 class="dashboard-page__title text-h5 text-weight-medium q-ma-none">
        Dashboard
      </h1>
      <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
        Visão geral das suas finanças
      </p>
    </div>

    <!-- Resumo do mês atual -->
    <q-card flat class="current-month-card q-mb-lg rounded-borders">
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="calendar_today" color="primary" size="18px" />
            <span class="text-subtitle2 text-weight-medium text-capitalize">{{ currentMonthName }}</span>
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
            <div class="text-h6 text-weight-bold text-positive">{{ formatMoney(currentMonthIncomes) }}</div>
          </div>
          <div class="col-12 col-sm-3">
            <div class="text-caption text-grey-6">Gastos</div>
            <div class="text-h6 text-weight-bold text-negative">{{ formatMoney(currentMonthExpenses) }}</div>
          </div>
          <div class="col-12 col-sm-3">
            <div class="text-caption text-grey-6">Saldo</div>
            <div
              class="text-h6 text-weight-bold"
              :class="currentMonthBalance >= 0 ? 'text-positive' : 'text-negative'"
            >
              {{ formatMoney(currentMonthBalance) }}
            </div>
          </div>
          <div class="col-12 col-sm-3">
            <div class="text-caption text-grey-6">Maior categoria</div>
            <div class="text-subtitle1 text-weight-bold text-grey-8 ellipsis">
              {{ currentMonthTopCategory ? currentMonthTopCategory[0] : '–' }}
            </div>
            <div v-if="currentMonthTopCategory" class="text-caption text-grey-5">
              {{ formatMoney(currentMonthTopCategory[1]) }}
            </div>
          </div>
        </div>
        <div v-if="currentMonthSavingsRate !== null" class="q-mt-sm">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-grey-6">Taxa de economia</span>
            <span
              class="text-caption text-weight-medium"
              :class="currentMonthSavingsRate >= 0 ? 'text-positive' : 'text-negative'"
            >{{ currentMonthSavingsRate }}%</span>
          </div>
          <q-linear-progress
            :value="Math.min(Math.abs(currentMonthSavingsRate) / 100, 1)"
            :color="currentMonthSavingsRate >= 0 ? 'positive' : 'negative'"
            rounded
            size="6px"
            style="background: #e2e8f0"
          />
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat class="dashboard-card rounded-borders">
          <q-card-section>
            <div class="row items-center justify-between">
              <div
                class="text-subtitle1 text-grey-7 text-weight-medium q-mb-sm"
              >
                Filtros de busca
              </div>
              <div class="row items-center q-ml-md">
                <q-btn
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
                />  
              </div>
            </div>
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-sm-3">
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
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-select
                  v-model="selectedYear"
                  :options="yearOptions"
                  label="Ano"
                  dense
                  outlined
                  emit-value
                  map-options
                  hide-bottom-space
                  class="col"
                />
              </div>
              <q-space></q-space>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg stat-cards">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--income">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="south_west" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Entradas</span>
              <template v-if="isCompareMonths">
                <div
                  v-for="item in statIncomesByMonth"
                  :key="item.monthValue"
                  class="stat-card__compare-line stat-card__value--income"
                >
                  {{ item.monthLabel }}: {{ formatMoney(item.value) }}
                </div>
              </template>
              <span v-else class="stat-card__value stat-card__value--income">
                {{ totalIncomesFormatted }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--expense">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="north_east" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Gastos</span>
              <template v-if="isCompareMonths">
                <div
                  v-for="item in statExpensesByMonth"
                  :key="item.monthValue"
                  class="stat-card__compare-line stat-card__value--expense"
                >
                  {{ item.monthLabel }}: {{ formatMoney(item.value) }}
                </div>
              </template>
              <span v-else class="stat-card__value stat-card__value--expense">
                {{ totalExpensesFormatted }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--balance">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="account_balance_wallet" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Saldo</span>
              <template v-if="isCompareMonths">
                <div
                  v-for="item in statBalanceByMonth"
                  :key="item.monthValue"
                  class="stat-card__compare-line"
                  :class="
                    item.value >= 0
                      ? 'stat-card__value--positive'
                      : 'stat-card__value--negative'
                  "
                >
                  {{ item.monthLabel }}: {{ formatMoney(item.value) }}
                </div>
              </template>
              <span
                v-else
                class="stat-card__value"
                :class="
                  balanceValue >= 0
                    ? 'stat-card__value--positive'
                    : 'stat-card__value--negative'
                "
              >
                {{ balanceFormatted }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--top">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="show_chart" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Maior gasto</span>
              <template v-if="isCompareMonths">
                <div
                  v-for="item in statTopCategoryByMonth"
                  :key="item.monthValue"
                  class="stat-card__compare-line stat-card__top-category"
                >
                  {{ item.monthLabel }}: {{ item.categoryName }}
                </div>
              </template>
              <div v-else class="stat-card__top-info">
                <span class="stat-card__top-category">
                  {{ topCategory?.name || "–" }}
                </span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Parcelamentos em andamento -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card flat class="dashboard-card rounded-borders">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-icon name="credit_card" color="primary" size="18px" class="q-mr-xs" />
              <span class="text-subtitle2 text-weight-medium text-grey-7">Parcelamentos em andamento</span>
              <q-badge v-if="activeInstallments.length" :label="activeInstallments.length" color="primary" rounded class="q-ml-sm" />
            </div>
            <div v-if="!activeInstallments.length" class="text-caption text-grey-5 q-py-md text-center">
              Nenhum parcelamento em andamento
            </div>
            <div v-else class="row q-col-gutter-sm">
              <div v-for="item in activeInstallments" :key="item.id" class="col-12 col-sm-6 col-md-4">
                <div class="installment-card q-pa-sm">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-caption text-weight-medium ellipsis" style="max-width: 70%">{{ item.description }}</span>
                    <q-badge outline color="primary" :label="`${item.currentInstallment}/${item.totalInstallments}`" />
                  </div>
                  <div class="text-subtitle2 text-weight-bold text-negative">
                    {{ formatMoney(item.amount) }}<span class="text-caption text-grey-5">/mês</span>
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">
                    Término: <strong>{{ formatInstallmentDate(item.endDate) }}</strong>
                    · Restante: {{ formatMoney(item.totalRemaining) }}
                  </div>
                  <q-linear-progress
                    :value="item.currentInstallment / item.totalInstallments"
                    color="primary"
                    rounded
                    size="4px"
                    style="background: #e2e8f0; margin-top: 8px"
                  />
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
                <q-icon name="savings" color="warning" size="18px" class="q-mr-xs" />
                <span class="text-subtitle2 text-weight-medium text-grey-7">Orçamento por categoria — {{ currentMonthName }}</span>
              </div>
              <q-btn flat dense no-caps size="sm" icon="settings" color="grey-6" label="Gerenciar" @click="budgetDialogOpen = true" />
            </div>
            <div v-if="!finance.budgets.length" class="text-caption text-grey-5 q-py-md text-center">
              Nenhum orçamento configurado.
              <q-btn flat dense no-caps size="sm" color="primary" label="Configurar agora" @click="budgetDialogOpen = true" />
            </div>
            <div v-else class="row q-col-gutter-md">
              <div v-for="b in budgetStatus" :key="b.id" class="col-12 col-sm-6 col-md-4">
                <div class="budget-item q-pa-sm">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-caption text-weight-medium">{{ b.category }}</span>
                    <span class="text-caption" :class="b.exceeded ? 'text-negative text-weight-bold' : 'text-grey-6'">
                      {{ formatMoney(b.spent) }} / {{ formatMoney(b.limit_amount) }}
                    </span>
                  </div>
                  <q-linear-progress
                    :value="Math.min(b.pct / 100, 1)"
                    :color="b.color"
                    rounded
                    size="8px"
                    style="background: #e2e8f0"
                  />
                  <div v-if="b.exceeded" class="text-caption text-negative q-mt-xs">
                    Excedido em {{ formatMoney(b.spent - b.limit_amount) }}
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
            <div class="stat-card__label">
              Gastos por categoria
            </div>
          </q-card-section>
          <q-card-section class="dashboard-card__chart-section">
            <template v-if="isCompareMonths">
              <Bar
                v-if="categoryCompareBarData.labels.length"
                :data="categoryCompareBarData"
                :options="barOptions"
              />
              <div v-else class="text-caption text-grey-6 text-center q-py-xl">
                Nenhum dado para exibir
              </div>
            </template>
            <template v-else>
              <div v-if="pieData.datasets[0].data.length" class="chart-pie-wrap">
                <Pie :data="pieData" :options="pieOptions" />
              </div>
              <div v-else class="text-caption text-grey-6 text-center q-py-xl">
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
            <div class="stat-card__label">
              Dias do mês com maiores gastos
            </div>
          </q-card-section>
          <q-card-section class="dashboard-card__chart-section">
            <Bar
              v-if="isCompareMonths ? dayCompareBarData.labels.length : barByDayOfMonthData.datasets[0].data.length"
              :data="isCompareMonths ? dayCompareBarData : barByDayOfMonthData"
              :options="barOptions"
            />
            <div
              v-else
              class="text-caption text-grey-6 text-center q-py-xl"
            >
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
        <q-card flat class="dashboard-card dashboard-card--chart rounded-borders">
          <q-card-section class="q-pb-none">
            <div class="stat-card__label">Tendência dos últimos 12 meses</div>
            <div class="text-caption text-grey-5 q-mt-xs">Evolução mensal de gastos e entradas</div>
          </q-card-section>
          <q-card-section class="dashboard-card__chart-section dashboard-card__chart-section--wide">
            <Line :data="trendChartData" :options="lineOptions" />
          </q-card-section>
        </q-card>
      </div>
    </div>
    </template>

    <template v-else>
    <div class="row q-col-gutter-md">
      <div class="col-12 ">
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
              table-header-class="bg-primary text-white"
              class="dashboard-table"
            />
            <div v-if="!incomeTableRows.length" class="text-caption text-grey-6 text-center q-py-lg">
              Nenhum dado para exibir
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 ">
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
              table-header-class="bg-primary text-white"
              class="dashboard-table"
            />
            <div v-if="!expenseTableRows.length" class="text-caption text-grey-6 text-center q-py-lg">
              Nenhum dado para exibir
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    </template>
    <!-- Dialog gerenciar orçamentos -->
    <q-dialog v-model="budgetDialogOpen">
      <q-card style="min-width: 380px; max-width: 500px" class="rounded-borders">
        <q-card-section class="row items-center q-py-sm bg-primary">
          <div class="text-h6 text-white">Gerenciar orçamentos</div>
          <q-space />
          <q-btn icon="close" flat class="text-white" round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-caption text-grey-6 q-mb-md">
            Defina um limite mensal por categoria. O dashboard mostra a barra de progresso e alerta quando excedido.
          </div>
          <div class="row q-col-gutter-sm q-mb-md items-end">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="budgetForm.category"
                :options="budgetCategoryOptions"
                label="Categoria"
                dense
                outlined
                emit-value
                map-options
                hide-bottom-space
              />
            </div>
            <div class="col-8 col-sm-4">
              <q-input
                v-model.number="budgetForm.limit_amount"
                type="number"
                label="Limite (R$)"
                dense
                outlined
                prefix="R$"
                hide-bottom-space
              />
            </div>
            <div class="col-4 col-sm-2">
              <q-btn
                unelevated
                color="primary"
                icon="save"
                round
                :loading="budgetSaving"
                :disable="!budgetForm.category || !budgetForm.limit_amount"
                @click="saveBudgetForm"
              />
            </div>
          </div>
          <q-list separator>
            <q-item v-for="b in finance.budgets" :key="b.id" dense>
              <q-item-section>
                <q-item-label>{{ b.category }}</q-item-label>
                <q-item-label caption>Limite: {{ formatMoney(b.limit_amount) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" color="negative" size="sm" @click="removeBudgetItem(b.id)" />
              </q-item-section>
            </q-item>
            <q-item v-if="!finance.budgets.length">
              <q-item-section class="text-caption text-grey-5 text-center">Nenhum orçamento configurado</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Bar, Line, Pie } from "vue-chartjs";
import { useFinanceStore } from "../stores/financeStore";

import { formatMoney } from "../utils/formatMoney";

const finance = useFinanceStore();

const now = new Date();
const selectedMonths = ref([now.getMonth() + 1]);
const selectedYear = ref(now.getFullYear());

const currentMonth = now.getMonth() + 1
const currentMonthName = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

const currentMonthIncomes = computed(() => finance.monthlyIncomesTotal(currentMonth, currentYear))
const currentMonthExpenses = computed(() => finance.monthlyExpensesTotal(currentMonth, currentYear))
const currentMonthBalance = computed(() => finance.balance(currentMonth, currentYear))

const currentMonthTopCategory = computed(() => {
  const cats = finance.expensesByCategory(currentMonth, currentYear)
  const entries = Object.entries(cats)
  if (!entries.length) return null
  return entries.reduce((max, cur) => cur[1] > max[1] ? cur : max)
})

const currentMonthSavingsRate = computed(() => {
  const inc = currentMonthIncomes.value
  if (inc <= 0) return null
  return Math.round((currentMonthBalance.value / inc) * 100)
})
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
  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) return null;
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

const totalExpenses = computed(() =>
  filteredExpenses.value.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  )
);

const totalIncomes = computed(() =>
  filteredIncomes.value.reduce(
    (total, income) => total + Number(income.amount || 0),
    0
  )
);

const balanceValue = computed(() => totalIncomes.value - totalExpenses.value);

const totalExpensesFormatted = computed(() =>
  formatMoney(totalExpenses.value)
);
const totalIncomesFormatted = computed(() =>
  formatMoney(totalIncomes.value)
);
const balanceFormatted = computed(() => formatMoney(balanceValue.value));

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
      monthLabel: monthOptions.find((m) => m.value === monthValue)?.label || `Mês ${monthValue}`,
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
      monthLabel: monthOptions.find((m) => m.value === monthValue)?.label || `Mês ${monthValue}`,
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
      monthLabel: monthOptions.find((m) => m.value === monthValue)?.label || `Mês ${monthValue}`,
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
  const cols = [
    {
      name: "mes",
      label: "Mês",
      field: "mes",
      align: "left",
      headerClasses: "bg-primary text-white",
      classes: "bg-primary text-white",
    },
  ];
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
            (income.source ? String(income.source).trim() || "Sem fonte" : "Sem fonte") === source
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
    set.add(e.category ? String(e.category).trim() || "Sem categoria" : "Sem categoria")
  );
  return Array.from(set).sort();
});

/** Colunas da tabela de gastos: Mês + uma coluna por categoria. */
const expenseTableColumns = computed(() => {
  const cols = [
    {
      name: "mes",
      label: "Mês",
      field: "mes",
      align: "left",
      headerClasses: "bg-primary text-white",
      classes: "bg-primary text-white",
    },
  ];
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
          const expCat =
            expense.category
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
          "#2563eb",
          "#059669",
          "#7c3aed",
          "#d97706",
          "#0ea5e9",
          "#64748b",
          "#dc2626",
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
    byMonthCategory[parts.month][cat] = (byMonthCategory[parts.month][cat] || 0) + Number(expense.amount || 0);
  });

  const categories = Array.from(allCategories).sort();
  const colors = ["#2563eb", "#059669", "#7c3aed", "#d97706", "#0ea5e9", "#64748b", "#dc2626"];
  const datasets = months.map((monthValue, i) => ({
    label: monthOptions.find((m) => m.value === monthValue)?.label || `Mês ${monthValue}`,
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
        backgroundColor: "#2563eb",
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
        backgroundColor: "#64748b",
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
    if (!parts || parts.year !== year || !months.includes(parts.month) || parts.day == null) return;
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
    label: monthOptions.find((m) => m.value === monthValue)?.label || `Mês ${monthValue}`,
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
  const points = []
  const labels = []
  const ref = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    points.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
    labels.push(d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }))
  }

  const expensesData = points.map(({ year, month }) =>
    finance.expenses
      .filter(e => { const p = parseDateParts(e.date); return p && p.year === year && p.month === month })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)
  )

  const incomesData = points.map(({ year, month }) =>
    finance.incomes
      .filter(i => { const p = parseDateParts(i.date); return p && p.year === year && p.month === month })
      .reduce((sum, i) => sum + Number(i.amount || 0), 0)
  )

  return {
    labels,
    datasets: [
      {
        label: 'Gastos',
        data: expensesData,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Entradas',
        data: incomesData,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

// Parcelamentos em andamento
function formatInstallmentDate(date) {
  if (!date) return '–'
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

const activeInstallments = computed(() => {
  const now = new Date()
  return finance.expenses
    .filter((e) => e.expense_type === 'parcelado' && e.installments > 0)
    .map((e) => {
      const start = new Date(e.date)
      const monthDiff =
        (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
      const currentInstallment = Math.max(1, monthDiff + 1)
      const total = Number(e.installments)
      const remaining = Math.max(0, total - currentInstallment)
      const endDate = new Date(start.getFullYear(), start.getMonth() + total - 1, 1)
      return {
        ...e,
        currentInstallment,
        totalInstallments: total,
        remaining,
        endDate,
        totalRemaining: (remaining + 1) * Number(e.amount),
      }
    })
    .filter((e) => e.currentInstallment <= e.totalInstallments)
    .sort((a, b) => a.remaining - b.remaining)
})

// Orçamentos por categoria
const budgetStatus = computed(() => {
  const m = new Date().getMonth() + 1
  const y = new Date().getFullYear()
  const byCat = finance.expensesByCategory(m, y)
  return finance.budgets
    .map((b) => {
      const spent = byCat[b.category] || 0
      const pct = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0
      return {
        ...b,
        spent,
        pct,
        exceeded: spent > b.limit_amount,
        color: pct >= 100 ? 'negative' : pct >= 80 ? 'warning' : 'positive',
      }
    })
    .sort((a, b) => b.pct - a.pct)
})

const budgetDialogOpen = ref(false)
const budgetSaving = ref(false)
const budgetForm = ref({ category: null, limit_amount: null })

const budgetCategoryOptions = [
  { label: 'Assinaturas', value: 'Assinaturas' },
  { label: 'Casa', value: 'Casa' },
  { label: 'Compras', value: 'Compras' },
  { label: 'Delivery', value: 'Delivery' },
  { label: 'Doações', value: 'Doações' },
  { label: 'Educação', value: 'Educação' },
  { label: 'Empréstimos', value: 'Empréstimos' },
  { label: 'Imprevistos', value: 'Imprevistos' },
  { label: 'Investimentos', value: 'Investimentos' },
  { label: 'Lazer', value: 'Lazer' },
  { label: 'Reserva de emergência', value: 'Reserva de emergência' },
  { label: 'Saúde', value: 'Saúde' },
  { label: 'Supermercado', value: 'Supermercado' },
  { label: 'Transporte', value: 'Transporte' },
]

async function saveBudgetForm() {
  if (!budgetForm.value.category || !budgetForm.value.limit_amount) return
  budgetSaving.value = true
  try {
    await finance.saveBudget(budgetForm.value.category, budgetForm.value.limit_amount)
    budgetForm.value = { category: null, limit_amount: null }
  } finally {
    budgetSaving.value = false
  }
}

async function removeBudgetItem(id) {
  await finance.removeBudget(id)
}

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData();
  }
});
</script>

<style scoped>
.dashboard-page {
  padding: 24px 20px;
}

.dashboard-card {
  background: #fff;
  border-radius: 12px;
}

/* Stat cards — design moderno */
.stat-cards {
  --stat-income: #059669;
  --stat-expense: #dc2626;
  --stat-balance: #0ea5e9;
  --stat-top: #7c3aed;
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-card__content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
}

.stat-card__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card--income .stat-card__icon {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

.stat-card--expense .stat-card__icon {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
}

.stat-card--balance .stat-card__icon {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
}

.stat-card--top .stat-card__icon {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.stat-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__compare-line {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}
.stat-card__compare-line + .stat-card__compare-line {
  margin-top: 2px;
}

.stat-card__label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.01em;
}

.stat-card__value {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.stat-card__value--income {
  color: #059669;
}

.stat-card__value--expense {
  color: #dc2626;
}

.stat-card__value--positive {
  color: #059669;
}

.stat-card__value--negative {
  color: #dc2626;
}

.stat-card__top-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card__top-category {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.stat-card__top-location {
  font-size: 0.8125rem;
  color: #64748b;
}

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

/* Tabelas: scroll + sticky header e primeira coluna (estilo Quasar) */
.dashboard-table-section {
  max-height: 420px;
  overflow: auto;
}

.dashboard-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--q-primary) !important;
  color: white;
}

.dashboard-table :deep(td:first-child),
.dashboard-table :deep(thead th:first-child) {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--q-primary) !important;
  color: white;
}

.dashboard-table :deep(thead th:first-child) {
  z-index: 3;
}

.current-month-card {
  background: #fff;
  border: 1px solid #e2e8f0;
}

.installment-card {
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.budget-item {
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}
</style>
