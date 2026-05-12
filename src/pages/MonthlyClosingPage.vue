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
                <span class="closing-stat-card__subtext">{{ periodLabel }}</span>
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
                  {{ totalExpenseTransactions }} gasto{{ totalExpenseTransactions === 1 ? '' : 's' }}
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
                <span class="closing-stat-card__subtext">{{ savingsRateLabel }}</span>
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
                <q-linear-progress
                  :value="monthlyScore / 100"
                  rounded
                  size="6px"
                  :color="monthlyScoreColor"
                  track-color="grey-4"
                  class="q-mt-xs"
                />
                <span class="closing-stat-card__subtext">
                  {{ monthlyScoreLabel }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">Top categorias do mês</div>
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
              <div class="text-subtitle1 text-weight-medium">Formas de pagamento</div>
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

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">Estatísticas de comportamento</div>
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
                  <span v-if="item.subtext" class="behavior-item__subtext">{{ item.subtext }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">Pontos de atenção</div>
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

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">Recomendações do mês</div>
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
                  <q-icon name="tips_and_updates" size="18px" class="insight-row__icon insight-row__icon--positive" />
                  <span>{{ item }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat class="analysis-card full-height">
            <q-card-section class="analysis-card__header">
              <div class="text-subtitle1 text-weight-medium">Resumo consultivo</div>
              <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'">
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
                  <q-icon name="fiber_manual_record" size="10px" class="insight-row__icon" />
                  <span>{{ line }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import { formatMoney } from '../utils/formatMoney'
import { formatDateBR } from '../utils/formatDate'

const finance = useFinanceStore()
const $q = useQuasar()

const PAYMENT_METHOD_LABELS = {
  credito: 'Crédito',
  debito: 'Débito',
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  outros: 'Outros',
}

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

const previousPeriod = computed(() => {
  if (selectedMonth.value === 1) {
    return { month: 12, year: selectedYear.value - 1 }
  }
  return { month: selectedMonth.value - 1, year: selectedYear.value }
})

const incomesTotal = computed(() =>
  finance.monthlyIncomesTotal(selectedMonth.value, selectedYear.value),
)

const expensesTotal = computed(() =>
  finance.monthlyExpensesTotal(selectedMonth.value, selectedYear.value),
)

const balance = computed(() => incomesTotal.value - expensesTotal.value)

const previousExpensesTotal = computed(() =>
  finance.monthlyExpensesTotal(previousPeriod.value.month, previousPeriod.value.year),
)

const previousBalance = computed(() =>
  finance.balance(previousPeriod.value.month, previousPeriod.value.year),
)

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

const categoryStats = computed(() => {
  const map = {}
  expensesInPeriod.value.forEach((expense) => {
    const category = expense.category || 'Sem categoria'
    if (!map[category]) {
      map[category] = { name: category, total: 0, count: 0 }
    }
    map[category].total += Number(expense.amount || 0)
    map[category].count += 1
  })
  return Object.values(map)
    .map((item) => ({
      ...item,
      percent: expensesTotal.value > 0 ? (item.total / expensesTotal.value) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
})

const topCategories = computed(() => categoryStats.value.slice(0, 5))

const topCategory = computed(() => topCategories.value[0] || null)

const mostFrequentCategory = computed(() => {
  if (!categoryStats.value.length) return null
  return [...categoryStats.value].sort((a, b) => b.count - a.count)[0]
})

const paymentSummary = computed(() => {
  const map = {}
  expensesInPeriod.value.forEach((expense) => {
    const method = normalizePaymentMethod(expense.payment_method)
    if (!map[method]) {
      map[method] = { method, label: PAYMENT_METHOD_LABELS[method], total: 0, count: 0 }
    }
    map[method].total += Number(expense.amount || 0)
    map[method].count += 1
  })
  return Object.values(map).map((item) => ({
    ...item,
    percent: expensesTotal.value > 0 ? (item.total / expensesTotal.value) * 100 : 0,
    avgTicket: item.count > 0 ? item.total / item.count : 0,
  }))
})

const paymentByValue = computed(() =>
  [...paymentSummary.value].sort((a, b) => b.total - a.total),
)

const paymentByCount = computed(() =>
  [...paymentSummary.value].sort((a, b) => b.count - a.count),
)

const topPaymentByValue = computed(() => paymentByValue.value[0] || null)

const totalExpenseTransactions = computed(() => expensesInPeriod.value.length)

const totalTransactions = computed(() =>
  expensesInPeriod.value.length + incomesInPeriod.value.length,
)

const biggestExpense = computed(() => {
  if (!expensesInPeriod.value.length) return null
  return expensesInPeriod.value.reduce((max, current) =>
    Number(current.amount || 0) > Number(max.amount || 0) ? current : max,
  )
})

const spendingByDay = computed(() => {
  const map = {}
  expensesInPeriod.value.forEach((expense) => {
    if (!expense.date) return
    if (!map[expense.date]) {
      map[expense.date] = { date: expense.date, total: 0, count: 0 }
    }
    map[expense.date].total += Number(expense.amount || 0)
    map[expense.date].count += 1
  })
  return Object.values(map)
})

const mostExpensiveDay = computed(() => {
  if (!spendingByDay.value.length) return null
  return spendingByDay.value.reduce((max, current) =>
    current.total > max.total ? current : max,
  )
})

const averageExpenseTicket = computed(() => {
  if (!totalExpenseTransactions.value) return 0
  return expensesTotal.value / totalExpenseTransactions.value
})

const daysInSelectedMonth = computed(() =>
  new Date(selectedYear.value, selectedMonth.value, 0).getDate(),
)

const averageDailyExpense = computed(() => {
  if (!daysInSelectedMonth.value) return 0
  return expensesTotal.value / daysInSelectedMonth.value
})

const categoriesUsedCount = computed(() => categoryStats.value.length)

const installmentCount = computed(() =>
  expensesInPeriod.value.filter((expense) => expense.expense_type === 'parcelado').length,
)

const expenseTypeStats = computed(() => {
  const stats = {
    fixo: { count: 0, total: 0 },
    variavel: { count: 0, total: 0 },
    parcelado: { count: 0, total: 0 },
    outros: { count: 0, total: 0 },
  }
  expensesInPeriod.value.forEach((expense) => {
    const type = expense.expense_type || 'outros'
    if (!stats[type]) stats.outros = stats.outros || { count: 0, total: 0 }
    const key = stats[type] ? type : 'outros'
    stats[key].count += 1
    stats[key].total += Number(expense.amount || 0)
  })
  return stats
})

const budgetOverruns = computed(() =>
  finance.budgets
    .map((budget) => {
      const spent = Number(byCategory.value[budget.category] || 0)
      const limit = Number(budget.limit_amount || 0)
      return {
        category: budget.category,
        exceededBy: spent - limit,
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
        }
      }
      return
    }

    groups[expense.id] = { ...expense, _currentInstallment: null }
  })

  return Object.values(groups)
    .map((expense) => {
      if (expense._currentInstallment !== null) {
        const remaining = Math.max(0, expense._totalInstallments - expense._currentInstallment)
        return {
          ...expense,
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
  activeInstallments.value.reduce((sum, installment) => sum + Number(installment.totalRemaining || 0), 0),
)

const savingsRateLabel = computed(() => {
  if (savingsRate.value === null) return 'Sem entradas no mês para calcular taxa'
  return `${formatPercent(savingsRate.value)} de economia`
})

const expenseTrend = computed(() => {
  if (previousExpensesTotal.value <= 0) return null
  return ((expensesTotal.value - previousExpensesTotal.value) / previousExpensesTotal.value) * 100
})

const balanceTrend = computed(() => {
  if (previousBalance.value === 0) return null
  return ((balance.value - previousBalance.value) / Math.abs(previousBalance.value)) * 100
})

const monthlyScore = computed(() => {
  let score = 100

  if (incomesTotal.value === 0) score -= 25
  if (balance.value < 0) {
    score -= 30
  } else if (savingsRate.value !== null && savingsRate.value < 10) {
    score -= 10
  }

  if (topCategory.value?.percent >= 40) score -= 12
  else if (topCategory.value?.percent >= 30) score -= 6

  if (topPaymentByValue.value?.percent >= 70) score -= 10
  else if (topPaymentByValue.value?.percent >= 60) score -= 5

  if (topBudgetOverrun.value) score -= 15

  if (futureInstallmentsTotal.value > 0 && expensesTotal.value > 0) {
    const ratio = (futureInstallmentsTotal.value / expensesTotal.value) * 100
    if (ratio >= 150) score -= 10
    else if (ratio >= 80) score -= 5
  }

  if (expenseTrend.value !== null) {
    if (expenseTrend.value >= 20) score -= 10
    else if (expenseTrend.value >= 10) score -= 6
    else if (expenseTrend.value <= -10) score += 4
  }

  if (
    totalExpenseTransactions.value > 0 &&
    installmentCount.value / totalExpenseTransactions.value >= 0.4
  ) {
    score -= 5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
})

const monthlyScoreColor = computed(() => {
  if (monthlyScore.value >= 85) return 'positive'
  if (monthlyScore.value >= 70) return 'info'
  if (monthlyScore.value >= 55) return 'warning'
  return 'negative'
})

const monthlyScoreLabel = computed(() => {
  if (monthlyScore.value >= 85) return 'Excelente controle financeiro'
  if (monthlyScore.value >= 70) return 'Bom controle, com pontos de melhoria'
  if (monthlyScore.value >= 55) return 'Atenção moderada neste mês'
  return 'Atenção alta: precisa de ajustes imediatos'
})

const behaviorStats = computed(() => [
  {
    label: 'Quantidade total de lançamentos',
    value: `${totalTransactions.value}`,
    subtext: `${totalExpenseTransactions.value} gastos + ${incomesInPeriod.value.length} entradas`,
  },
  {
    label: 'Ticket médio por gasto',
    value: formatMoney(averageExpenseTicket.value),
    subtext: 'Média por transação de despesa',
  },
  {
    label: 'Maior gasto único',
    value: biggestExpense.value ? formatMoney(biggestExpense.value.amount) : '—',
    subtext: biggestExpense.value?.description || 'Sem gastos registrados',
  },
  {
    label: 'Dia que mais gastou',
    value: mostExpensiveDay.value ? formatDateBR(mostExpensiveDay.value.date) : '—',
    subtext: mostExpensiveDay.value
      ? `${formatMoney(mostExpensiveDay.value.total)} em ${mostExpensiveDay.value.count} lançamento(s)`
      : 'Sem movimentação no mês',
  },
  {
    label: 'Média diária de gastos',
    value: formatMoney(averageDailyExpense.value),
    subtext: `${daysInSelectedMonth.value} dia(s) no mês`,
  },
  {
    label: 'Categoria mais frequente',
    value: mostFrequentCategory.value?.name || '—',
    subtext: mostFrequentCategory.value
      ? `${mostFrequentCategory.value.count} lançamento(s)`
      : 'Sem gastos categorizados',
  },
  {
    label: 'Número de categorias usadas',
    value: `${categoriesUsedCount.value}`,
    subtext: 'Categorias diferentes com gasto',
  },
  {
    label: 'Compras parceladas no mês',
    value: `${installmentCount.value}`,
    subtext: 'Lançamentos com tipo parcelado',
  },

])

const attentionPoints = computed(() => {
  const points = []
  const totalExpenseCount = totalExpenseTransactions.value
  const topCategoryCountShare = totalExpenseCount > 0 && mostFrequentCategory.value
    ? (mostFrequentCategory.value.count / totalExpenseCount) * 100
    : 0
  const strongestDayShare = expensesTotal.value > 0 && mostExpensiveDay.value
    ? (mostExpensiveDay.value.total / expensesTotal.value) * 100
    : 0

  if (topCategory.value?.percent >= 30) {
    points.push({
      icon: 'warning_amber',
      tone: 'insight-row__icon--warning',
      text: `${topCategory.value.name} consumiu ${formatPercent(topCategory.value.percent)} dos gastos do mês.`,
    })
  }

  if (topPaymentByValue.value?.percent >= 60) {
    points.push({
      icon: 'credit_card',
      tone: 'insight-row__icon--warning',
      text: `${topPaymentByValue.value.label} representa ${formatPercent(topPaymentByValue.value.percent)} do total de gastos.`,
    })
  }

  if (incomesTotal.value === 0) {
    points.push({
      icon: 'trending_up',
      tone: 'insight-row__icon--negative',
      text: 'Você teve 0 entradas no período.',
    })
  }

  if (balance.value < 0) {
    points.push({
      icon: 'trending_down',
      tone: 'insight-row__icon--negative',
      text: `Seu saldo ficou negativo em ${formatMoney(Math.abs(balance.value))}.`,
    })
  }

  if (topBudgetOverrun.value) {
    points.push({
      icon: 'price_check',
      tone: 'insight-row__icon--negative',
      text: `Orçamento estourado em ${topBudgetOverrun.value.category}: ${formatMoney(topBudgetOverrun.value.exceededBy)} acima do limite.`,
    })
  }

  if (expenseTrend.value !== null && expenseTrend.value > 0) {
    points.push({
      icon: 'trending_down',
      tone: 'insight-row__icon--warning',
      text: `Seus gastos subiram ${formatPercent(expenseTrend.value)} vs. mês anterior.`,
    })
  }

  if (balanceTrend.value !== null && balanceTrend.value < 0) {
    points.push({
      icon: 'analytics',
      tone: 'insight-row__icon--negative',
      text: `Seu saldo recuou ${formatPercent(Math.abs(balanceTrend.value))} em relação ao período anterior.`,
    })
  }

  if (strongestDayShare >= 25 && mostExpensiveDay.value) {
    points.push({
      icon: 'calendar_today',
      tone: 'insight-row__icon--warning',
      text: `O dia ${formatDateBR(mostExpensiveDay.value.date)} concentrou ${formatPercent(strongestDayShare)} dos gastos do mês.`,
    })
  }

  if (topCategoryCountShare >= 35 && mostFrequentCategory.value) {
    points.push({
      icon: 'category',
      tone: 'insight-row__icon--warning',
      text: `${mostFrequentCategory.value.name} concentrou ${formatPercent(topCategoryCountShare)} da frequência de compras.`,
    })
  }

  if (futureInstallmentsTotal.value > 0 && expensesTotal.value > 0) {
    const installmentsShare = (futureInstallmentsTotal.value / expensesTotal.value) * 100
    points.push({
      icon: 'event_repeat',
      tone: installmentsShare >= 100 ? 'insight-row__icon--warning' : 'insight-row__icon',
      text: `Compromissos futuros em parcelas equivalem a ${formatPercent(installmentsShare)} do gasto mensal atual.`,
    })
  }

  if (monthlyScore.value < 70) {
    points.push({
      icon: 'score',
      tone: monthlyScore.value < 55 ? 'insight-row__icon--negative' : 'insight-row__icon--warning',
      text: `Score mensal em ${monthlyScore.value}/100. Priorize ações para voltar acima de 70.`,
    })
  }

  if (!topBudgetOverrun.value) {
    points.push({
      icon: 'check_circle',
      tone: 'insight-row__icon--positive',
      text: 'Nenhum orçamento foi estourado. Mantenha esse padrão como referência.',
    })
  }

  if (expenseTrend.value !== null && expenseTrend.value <= 0) {
    points.push({
      icon: 'trending_up',
      tone: 'insight-row__icon--positive',
      text: `Seus gastos melhoraram ${formatPercent(Math.abs(expenseTrend.value))} vs. mês anterior.`,
    })
  }

  return points
})

const recommendations = computed(() => {
  const list = []

  if (topCategory.value?.total > 0) {
    const tenPercent = topCategory.value.total * 0.1
    list.push(
      `Reduzir em 10% a categoria ${topCategory.value.name} pode economizar cerca de ${formatMoney(tenPercent)}.`,
    )
  }

  if (incomesTotal.value === 0) {
    list.push('Sem entradas no mês: vale revisar se faltam lançamentos de receita.')
  }

  if (topPaymentByValue.value?.method === 'credito' && topPaymentByValue.value.percent >= 50) {
    list.push('Uso de crédito está alto; acompanhe as parcelas futuras para evitar acúmulo.')
  }

  if (!topBudgetOverrun.value) {
    list.push('Nenhum orçamento foi excedido no período. Bom sinal de controle financeiro.')
  }

  if (balance.value < 0) {
    list.push('Como o saldo ficou negativo, priorize cortar categorias de maior impacto no próximo mês.')
  } else if (savingsRate.value !== null && savingsRate.value > 0) {
    list.push('Com saldo positivo, considere direcionar parte da sobra para reserva de emergência.')
  }

  if (!list.length) {
    list.push('Mantenha o padrão atual e continue acompanhando os indicadores para preservar consistência.')
  }

  return list
})

const consultiveSummary = computed(() => {
  const lines = []

  lines.push(
    `Você registrou ${totalExpenseTransactions.value} gasto(s) em ${periodLabel.value}, totalizando ${formatMoney(expensesTotal.value)}.`,
  )

  if (topCategory.value) {
    lines.push(
      `A categoria com maior impacto foi ${topCategory.value.name}, responsável por ${formatPercent(topCategory.value.percent)} dos gastos do mês.`,
    )
  }

  if (topPaymentByValue.value) {
    lines.push(
      `A forma de pagamento dominante foi ${topPaymentByValue.value.label}, com ${topPaymentByValue.value.count} lançamento(s).`,
    )
  }

  lines.push(`Seu ticket médio no mês foi de ${formatMoney(averageExpenseTicket.value)} por gasto.`)

  if (topBudgetOverrun.value) {
    lines.push(
      `Houve estouro de orçamento em ${topBudgetOverrun.value.category}, acima do limite em ${formatMoney(topBudgetOverrun.value.exceededBy)}.`,
    )
  } else {
    lines.push('Nenhum orçamento foi excedido neste período.')
  }

  if (futureInstallmentsTotal.value > 0) {
    lines.push(`Você ainda tem ${formatMoney(futureInstallmentsTotal.value)} em parcelas futuras.`)
  } else {
    lines.push('Não há parcelas futuras em aberto.')
  }

  if (expenseTrend.value !== null) {
    lines.push(
      expenseTrend.value > 0
        ? `Seus gastos pioraram ${formatPercent(Math.abs(expenseTrend.value))} em relação ao mês anterior.`
        : `Seus gastos melhoraram ${formatPercent(Math.abs(expenseTrend.value))} em relação ao mês anterior.`,
    )
  }

  if (balanceTrend.value !== null) {
    lines.push(
      balanceTrend.value > 0
        ? `Seu saldo evoluiu ${formatPercent(balanceTrend.value)} frente ao período anterior.`
        : `Seu saldo recuou ${formatPercent(Math.abs(balanceTrend.value))} frente ao período anterior.`,
    )
  }

  return lines
})

const isInitialLoading = computed(() => {
  const hasNoData = !finance.expenses.length && !finance.incomes.length
  return finance.loading && hasNoData
})

function normalizePaymentMethod(method) {
  const value = String(method || '').toLowerCase()
  return PAYMENT_METHOD_LABELS[value] ? value : 'outros'
}

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
