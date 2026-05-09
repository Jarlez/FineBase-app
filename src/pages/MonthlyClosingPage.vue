<template>
  <q-page class="monthly-closing-page">
    <div class="row justify-between">
      <div class="column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Fechamento mensal</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Seu resumo financeiro do mês com leitura de consultor pessoal
        </p>
      </div>

      <div class="row items-center q-gutter-sm q-mb-lg">
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
      <q-skeleton type="rect" height="280px" style="border-radius: 10px" />
    </template>

    <template v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card closing-stat-card--income">
            <q-card-section class="closing-stat-card__content">
              <div class="closing-stat-card__icon">
                <q-icon name="trending_up" size="22px" />
              </div>
              <div class="closing-stat-card__body">
                <span class="closing-stat-card__label">Entradas no mês</span>
                <span class="closing-stat-card__value closing-stat-card__value--positive">
                  {{ formatMoney(incomesTotal) }}
                </span>
                <span class="closing-stat-card__subtext">
                  {{ periodLabel }}
                </span>
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
                <span class="closing-stat-card__value closing-stat-card__value--negative">
                  {{ formatMoney(expensesTotal) }}
                </span>
                <span class="closing-stat-card__subtext">
                  {{ totalTransactionsLabel }}
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
                  :class="balance >= 0 ? 'closing-stat-card__value--positive' : 'closing-stat-card__value--negative'"
                >
                  {{ formatMoney(balance) }}
                </span>
                <span class="closing-stat-card__subtext">
                  {{ savingsRateLabel }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="closing-stat-card closing-stat-card--installments">
            <q-card-section class="closing-stat-card__content">
              <div class="closing-stat-card__icon">
                <q-icon name="credit_card" size="22px" />
              </div>
              <div class="closing-stat-card__body">
                <span class="closing-stat-card__label">Parcelas futuras</span>
                <span class="closing-stat-card__value">
                  {{ formatMoney(futureInstallmentsTotal) }}
                </span>
                <span class="closing-stat-card__subtext">
                  {{ futureInstallmentsCountLabel }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat class="insights-card">
        <q-card-section class="insights-card__header">
          <div class="text-subtitle1 text-weight-medium">Resumo consultivo do mês</div>
          <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'">
            {{ periodLabel }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="insights-card__content">
          <div class="insights-list">
            <div class="insight-row">
              <q-icon name="payments" size="18px" class="insight-row__icon insight-row__icon--positive" />
              <span>{{ incomeInsight }}</span>
            </div>

            <div class="insight-row">
              <q-icon name="receipt_long" size="18px" class="insight-row__icon insight-row__icon--negative" />
              <span>{{ expenseInsight }}</span>
            </div>

            <div class="insight-row">
              <q-icon name="monitoring" size="18px" class="insight-row__icon" />
              <span>{{ savingsInsight }}</span>
            </div>

            <div class="insight-row">
              <q-icon name="pie_chart" size="18px" class="insight-row__icon insight-row__icon--warning" />
              <span>{{ topCategoryInsight }}</span>
            </div>

            <div class="insight-row">
              <q-icon name="warning_amber" size="18px" class="insight-row__icon insight-row__icon--warning" />
              <span>{{ budgetInsight }}</span>
            </div>

            <div class="insight-row">
              <q-icon name="event_repeat" size="18px" class="insight-row__icon" />
              <span>{{ installmentsInsight }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import { formatMoney } from '../utils/formatMoney'

const finance = useFinanceStore()
const $q = useQuasar()

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())

const monthOptions = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
]

const yearOptions = computed(() => {
  const years = new Set([selectedYear.value, now.getFullYear()])
  finance.expenses.forEach((expense) => {
    const year = parseYear(expense.date)
    if (year) years.add(year)
  })
  finance.incomes.forEach((income) => {
    const year = parseYear(income.date)
    if (year) years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a)
})

const periodLabel = computed(() => {
  const monthName = monthOptions.find((item) => item.value === selectedMonth.value)?.label || 'Mês'
  return `${monthName} de ${selectedYear.value}`
})

const incomesTotal = computed(() =>
  finance.monthlyIncomesTotal(selectedMonth.value, selectedYear.value),
)

const expensesTotal = computed(() =>
  finance.monthlyExpensesTotal(selectedMonth.value, selectedYear.value),
)

const balance = computed(() => incomesTotal.value - expensesTotal.value)

const savingsRate = computed(() => {
  if (incomesTotal.value <= 0) return null
  return (balance.value / incomesTotal.value) * 100
})

const expensesInPeriod = computed(() =>
  finance.expenses.filter((expense) => {
    const parts = parseDateParts(expense.date)
    return parts && parts.month === selectedMonth.value && parts.year === selectedYear.value
  }),
)

const incomesInPeriod = computed(() =>
  finance.incomes.filter((income) => {
    const parts = parseDateParts(income.date)
    return parts && parts.month === selectedMonth.value && parts.year === selectedYear.value
  }),
)

const byCategory = computed(() =>
  finance.expensesByCategory(selectedMonth.value, selectedYear.value),
)

const topCategory = computed(() => {
  const entries = Object.entries(byCategory.value)
  if (!entries.length) return null
  return entries.reduce((max, current) => (current[1] > max[1] ? current : max))
})

const budgetOverruns = computed(() =>
  finance.budgets
    .map((budget) => {
      const spent = Number(byCategory.value[budget.category] || 0)
      const limit = Number(budget.limit_amount || 0)
      return {
        category: budget.category,
        exceededBy: spent - limit,
        spent,
        limit,
      }
    })
    .filter((item) => item.exceededBy > 0)
    .sort((a, b) => b.exceededBy - a.exceededBy),
)

const topBudgetOverrun = computed(() => budgetOverruns.value[0] || null)

const activeInstallments = computed(() => {
  const groups = {}

  finance.expenses.forEach((expense) => {
    if (expense.expense_type !== 'parcelado' || !expense.installments) return

    const match = expense.description?.match(/parcela\s+(\d+)\/(\d+)/i)
    if (match) {
      const currentInstallment = parseInt(match[1], 10)
      const totalInstallments = parseInt(match[2], 10)
      const baseDescription = expense.description
        .replace(/\s*-?\s*parcela\s+\d+\/\d+\s*$/i, '')
        .trim()
      const key = `${baseDescription}__${totalInstallments}__${expense.amount}`

      if (!groups[key] || currentInstallment > groups[key]._currentInstallment) {
        groups[key] = {
          ...expense,
          _currentInstallment: currentInstallment,
          _totalInstallments: totalInstallments,
          _baseDescription: baseDescription,
        }
      }
      return
    }

    groups[expense.id] = { ...expense, _currentInstallment: null }
  })

  return Object.values(groups)
    .map((expense) => {
      if (expense._currentInstallment !== null) {
        const remaining = Math.max(
          0,
          expense._totalInstallments - expense._currentInstallment,
        )
        return {
          ...expense,
          description: expense._baseDescription,
          remaining,
          totalRemaining: remaining * Number(expense.amount || 0),
        }
      }

      const start = new Date(`${expense.date}T00:00:00`)
      const monthDiff =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth())
      const currentInstallment = Math.max(1, monthDiff + 1)
      const totalInstallments = Number(expense.installments || 0)
      const remaining = Math.max(0, totalInstallments - currentInstallment)

      return {
        ...expense,
        remaining,
        totalRemaining: (remaining + 1) * Number(expense.amount || 0),
      }
    })
    .filter((expense) => expense.remaining > 0)
})

const futureInstallmentsTotal = computed(() =>
  activeInstallments.value.reduce(
    (sum, installment) => sum + Number(installment.totalRemaining || 0),
    0,
  ),
)

const totalTransactionsLabel = computed(() => {
  const total = expensesInPeriod.value.length + incomesInPeriod.value.length
  return `${total} lançamento${total === 1 ? '' : 's'} no período`
})

const savingsRateLabel = computed(() => {
  if (savingsRate.value === null) return 'Sem entradas no mês para calcular taxa'
  return `${formatPercent(savingsRate.value)} de economia`
})

const futureInstallmentsCountLabel = computed(() => {
  const count = activeInstallments.value.length
  return `${count} compra${count === 1 ? '' : 's'} parcelada${count === 1 ? '' : 's'} em aberto`
})

const incomeInsight = computed(() =>
  `Você ganhou ${formatMoney(incomesTotal.value)} em ${periodLabel.value}.`,
)

const expenseInsight = computed(() =>
  `Você gastou ${formatMoney(expensesTotal.value)} no mesmo período.`,
)

const savingsInsight = computed(() => {
  if (savingsRate.value === null) {
    return 'Não há entradas no mês para calcular a taxa de economia.'
  }
  if (savingsRate.value >= 0) {
    return `Você economizou ${formatPercent(savingsRate.value)} da sua renda no mês.`
  }
  return `O mês fechou com taxa de economia negativa em ${formatPercent(Math.abs(savingsRate.value))}.`
})

const topCategoryInsight = computed(() => {
  if (!topCategory.value) return 'Você ainda não tem gastos categorizados neste período.'
  return `Sua maior categoria foi ${topCategory.value[0]}, com ${formatMoney(topCategory.value[1])}.`
})

const budgetInsight = computed(() => {
  if (!topBudgetOverrun.value) return 'Nenhum orçamento foi estourado neste mês.'
  return `Você estourou ${topBudgetOverrun.value.category} em ${formatMoney(topBudgetOverrun.value.exceededBy)}.`
})

const installmentsInsight = computed(() => {
  if (!activeInstallments.value.length) return 'Você não possui parcelas futuras em aberto.'
  return `Ainda existem ${formatMoney(futureInstallmentsTotal.value)} em parcelas futuras.`
})

const isInitialLoading = computed(() => {
  const hasNoData = !finance.expenses.length && !finance.incomes.length
  return finance.loading && hasNoData
})

function parseDateParts(dateString) {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

function parseYear(dateString) {
  const parts = parseDateParts(dateString)
  return parts?.year || null
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData()
  }
})
</script>

<style scoped>
.monthly-closing-page {
  padding: 20px 24px;
}

.close-select :deep(.q-field__control) {
  background: var(--surface) !important;
}

.closing-stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
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

.insights-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.insights-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.insights-card__content {
  padding-top: 16px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.5;
}

.insight-row__icon {
  color: var(--accent);
  margin-top: 1px;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .monthly-closing-page {
    padding: 16px;
  }

  .insights-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
