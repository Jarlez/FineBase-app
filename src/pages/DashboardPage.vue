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
</style>
