import { computed } from 'vue'
import { useFinanceStore } from '../stores/financeStore'
import { formatMoney } from '../utils/formatMoney'
import { formatDateBR } from '../utils/formatDate'
import jsPDF from 'jspdf'

// ── constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS = {
  credito: 'Crédito',
  debito: 'Débito',
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  outros: 'Outros',
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ── pure utilities ───────────────────────────────────────────────────────────

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function normalizePaymentMethod(method) {
  const value = String(method || '').toLowerCase()
  return PAYMENT_METHOD_LABELS[value] ? value : 'outros'
}

function parseDateParts(dateString) {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}

// ── score computation (pure, para reutilização no histórico) ─────────────────

function computeScore({
  incomesTotal, balance, savingsRate, topCategoryPercent, topPaymentPercent,
  hasBudgetOverrun, futureInstallmentsRatio, expenseTrend, installmentRatio,
}) {
  let score = 100

  if (incomesTotal === 0) score -= 25
  if (balance < 0) score -= 30
  else if (savingsRate !== null && savingsRate < 10) score -= 10

  if (topCategoryPercent >= 40) score -= 12
  else if (topCategoryPercent >= 30) score -= 6

  if (topPaymentPercent >= 70) score -= 10
  else if (topPaymentPercent >= 60) score -= 5

  if (hasBudgetOverrun) score -= 15

  if (futureInstallmentsRatio >= 150) score -= 10
  else if (futureInstallmentsRatio >= 80) score -= 5

  if (expenseTrend !== null) {
    if (expenseTrend >= 20) score -= 10
    else if (expenseTrend >= 10) score -= 6
    else if (expenseTrend <= -10) score += 4
  }

  if (installmentRatio >= 0.4) score -= 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

function calculateScoreForMonth(month, year, finance) {
  const expenses = finance.expenses.filter((e) => {
    const parts = parseDateParts(e.date)
    return parts && parts.month === month && parts.year === year
  })

  const incomesTotal = finance.monthlyIncomesTotal(month, year)
  const expensesTotal = finance.monthlyExpensesTotal(month, year)
  const balance = incomesTotal - expensesTotal
  const savingsRate = incomesTotal > 0 ? (balance / incomesTotal) * 100 : null

  const categoryMap = {}
  expenses.forEach((e) => {
    const cat = e.category || 'Sem categoria'
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0)
  })
  const catVals = Object.values(categoryMap)
  const topCategoryPercent =
    expensesTotal > 0 && catVals.length ? Math.max(...catVals.map((v) => (v / expensesTotal) * 100)) : 0

  const paymentMap = {}
  expenses.forEach((e) => {
    const m = normalizePaymentMethod(e.payment_method)
    paymentMap[m] = (paymentMap[m] || 0) + Number(e.amount || 0)
  })
  const payVals = Object.values(paymentMap)
  const topPaymentPercent =
    expensesTotal > 0 && payVals.length ? Math.max(...payVals.map((v) => (v / expensesTotal) * 100)) : 0

  const byCategory = finance.expensesByCategory(month, year)
  const hasBudgetOverrun = finance.budgets.some(
    (b) => Number(byCategory[b.category] || 0) > Number(b.limit_amount || 0),
  )

  const installmentCount = expenses.filter((e) => e.expense_type === 'parcelado').length
  const installmentRatio = expenses.length > 0 ? installmentCount / expenses.length : 0

  return computeScore({
    incomesTotal, balance, savingsRate,
    topCategoryPercent, topPaymentPercent, hasBudgetOverrun,
    futureInstallmentsRatio: 0,
    expenseTrend: null,
    installmentRatio,
  })
}

// ── attention rules ──────────────────────────────────────────────────────────

const ATTENTION_RULES = [
  {
    condition: (d) => d.topCategory?.percent >= 30,
    icon: 'warning_amber',
    tone: 'warning',
    message: (d) => `${d.topCategory.name} consumiu ${formatPercent(d.topCategory.percent)} dos gastos do mês.`,
  },
  {
    condition: (d) => d.topPaymentByValue?.percent >= 60,
    icon: 'credit_card',
    tone: 'warning',
    message: (d) => `${d.topPaymentByValue.label} representa ${formatPercent(d.topPaymentByValue.percent)} do total de gastos.`,
  },
  {
    condition: (d) => d.incomesTotal === 0,
    icon: 'trending_up',
    tone: 'negative',
    message: () => 'Você teve 0 entradas no período.',
  },
  {
    condition: (d) => d.balance < 0,
    icon: 'trending_down',
    tone: 'negative',
    message: (d) => `Seu saldo ficou negativo em ${formatMoney(Math.abs(d.balance))}.`,
  },
  {
    condition: (d) => !!d.topBudgetOverrun,
    icon: 'price_check',
    tone: 'negative',
    message: (d) => `Orçamento estourado em ${d.topBudgetOverrun.category}: ${formatMoney(d.topBudgetOverrun.exceededBy)} acima do limite.`,
  },
  {
    condition: (d) => d.expenseTrend !== null && d.expenseTrend > 0,
    icon: 'trending_down',
    tone: 'warning',
    message: (d) => `Seus gastos subiram ${formatPercent(d.expenseTrend)} vs. mês anterior.`,
  },
  {
    condition: (d) => d.balanceTrend !== null && d.balanceTrend < 0,
    icon: 'analytics',
    tone: 'negative',
    message: (d) => `Seu saldo recuou ${formatPercent(Math.abs(d.balanceTrend))} em relação ao período anterior.`,
  },
  {
    condition: (d) => d.strongestDayShare >= 25 && !!d.mostExpensiveDay,
    icon: 'calendar_today',
    tone: 'warning',
    message: (d) => `O dia ${formatDateBR(d.mostExpensiveDay.date)} concentrou ${formatPercent(d.strongestDayShare)} dos gastos do mês.`,
  },
  {
    condition: (d) => d.topCategoryCountShare >= 35 && !!d.mostFrequentCategory,
    icon: 'category',
    tone: 'warning',
    message: (d) => `${d.mostFrequentCategory.name} concentrou ${formatPercent(d.topCategoryCountShare)} da frequência de compras.`,
  },
  {
    condition: (d) => d.futureInstallmentsTotal > 0 && d.expensesTotal > 0,
    icon: 'event_repeat',
    tone: (d) => ((d.futureInstallmentsTotal / d.expensesTotal) * 100) >= 100 ? 'warning' : null,
    message: (d) => {
      const share = (d.futureInstallmentsTotal / d.expensesTotal) * 100
      return `Compromissos futuros em parcelas equivalem a ${formatPercent(share)} do gasto mensal atual.`
    },
  },
  {
    condition: (d) => d.monthlyScore < 70,
    icon: 'score',
    tone: (d) => (d.monthlyScore < 55 ? 'negative' : 'warning'),
    message: (d) => `Score mensal em ${d.monthlyScore}/100. Priorize ações para voltar acima de 70.`,
  },
  {
    condition: (d) => !d.topBudgetOverrun,
    icon: 'check_circle',
    tone: 'positive',
    message: () => 'Nenhum orçamento foi estourado. Mantenha esse padrão como referência.',
  },
  {
    condition: (d) => d.expenseTrend !== null && d.expenseTrend <= 0,
    icon: 'trending_up',
    tone: 'positive',
    message: (d) => `Seus gastos melhoraram ${formatPercent(Math.abs(d.expenseTrend))} vs. mês anterior.`,
  },
]

// ── recommendation rules ─────────────────────────────────────────────────────

const RECOMMENDATION_RULES = [
  {
    condition: (d) => d.topCategory?.total > 0,
    message: (d) => {
      const saving = d.topCategory.total * 0.1
      return `Reduzir em 10% a categoria ${d.topCategory.name} pode economizar cerca de ${formatMoney(saving)}.`
    },
  },
  {
    condition: (d) => d.incomesTotal === 0,
    message: () => 'Sem entradas no mês: vale revisar se faltam lançamentos de receita.',
  },
  {
    condition: (d) => d.topPaymentByValue?.method === 'credito' && d.topPaymentByValue.percent >= 50,
    message: () => 'Uso de crédito está alto; acompanhe as parcelas futuras para evitar acúmulo.',
  },
  {
    condition: (d) => !d.topBudgetOverrun,
    message: () => 'Nenhum orçamento foi excedido no período. Bom sinal de controle financeiro.',
  },
  {
    condition: (d) => d.balance < 0,
    message: () => 'Como o saldo ficou negativo, priorize cortar categorias de maior impacto no próximo mês.',
  },
  {
    condition: (d) => d.balance >= 0 && d.savingsRate !== null && d.savingsRate > 0,
    message: () => 'Com saldo positivo, considere direcionar parte da sobra para reserva de emergência.',
  },
]

// ── main composable ──────────────────────────────────────────────────────────

export function useMonthlyClosing(selectedMonth, selectedYear) {
  const finance = useFinanceStore()
  const now = new Date()

  // period
  const periodLabel = computed(
    () => `${MONTH_NAMES[selectedMonth.value - 1]} de ${selectedYear.value}`,
  )

  const previousPeriod = computed(() => {
    if (selectedMonth.value === 1) return { month: 12, year: selectedYear.value - 1 }
    return { month: selectedMonth.value - 1, year: selectedYear.value }
  })

  // totals
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

  // period filtering
  const expensesInPeriod = computed(() =>
    finance.expenses.filter((e) => {
      const parts = parseDateParts(e.date)
      return parts && parts.month === selectedMonth.value && parts.year === selectedYear.value
    }),
  )

  const incomesInPeriod = computed(() =>
    finance.incomes.filter((i) => {
      const parts = parseDateParts(i.date)
      return parts && parts.month === selectedMonth.value && parts.year === selectedYear.value
    }),
  )

  // category stats
  const byCategory = computed(() =>
    finance.expensesByCategory(selectedMonth.value, selectedYear.value),
  )

  const categoryStats = computed(() => {
    const map = {}
    expensesInPeriod.value.forEach((e) => {
      const cat = e.category || 'Sem categoria'
      if (!map[cat]) map[cat] = { name: cat, total: 0, count: 0 }
      map[cat].total += Number(e.amount || 0)
      map[cat].count += 1
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

  // payment stats
  const paymentSummary = computed(() => {
    const map = {}
    expensesInPeriod.value.forEach((e) => {
      const method = normalizePaymentMethod(e.payment_method)
      if (!map[method]) {
        map[method] = { method, label: PAYMENT_METHOD_LABELS[method], total: 0, count: 0 }
      }
      map[method].total += Number(e.amount || 0)
      map[method].count += 1
    })
    return Object.values(map).map((item) => ({
      ...item,
      percent: expensesTotal.value > 0 ? (item.total / expensesTotal.value) * 100 : 0,
      avgTicket: item.count > 0 ? item.total / item.count : 0,
    }))
  })

  const paymentByValue = computed(() => [...paymentSummary.value].sort((a, b) => b.total - a.total))
  const paymentByCount = computed(() => [...paymentSummary.value].sort((a, b) => b.count - a.count))
  const topPaymentByValue = computed(() => paymentByValue.value[0] || null)

  // transaction counts
  const totalExpenseTransactions = computed(() => expensesInPeriod.value.length)
  const totalTransactions = computed(
    () => expensesInPeriod.value.length + incomesInPeriod.value.length,
  )

  // behavior metrics
  const biggestExpense = computed(() => {
    if (!expensesInPeriod.value.length) return null
    return expensesInPeriod.value.reduce((max, cur) =>
      Number(cur.amount || 0) > Number(max.amount || 0) ? cur : max,
    )
  })

  const spendingByDay = computed(() => {
    const map = {}
    expensesInPeriod.value.forEach((e) => {
      if (!e.date) return
      if (!map[e.date]) map[e.date] = { date: e.date, total: 0, count: 0 }
      map[e.date].total += Number(e.amount || 0)
      map[e.date].count += 1
    })
    return Object.values(map)
  })

  const mostExpensiveDay = computed(() => {
    if (!spendingByDay.value.length) return null
    return spendingByDay.value.reduce((max, cur) => (cur.total > max.total ? cur : max))
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
    expensesInPeriod.value.filter((e) => e.expense_type === 'parcelado').length,
  )

  // expense type breakdown (fixo / variável / parcelado)
  const expenseTypeStats = computed(() => {
    const acc = {
      fixo: { count: 0, total: 0 },
      variavel: { count: 0, total: 0 },
      parcelado: { count: 0, total: 0 },
    }
    expensesInPeriod.value.forEach((e) => {
      const key = acc[e.expense_type] ? e.expense_type : 'variavel'
      acc[key].count += 1
      acc[key].total += Number(e.amount || 0)
    })
    return [
      {
        label: 'Fixo', icon: 'push_pin', key: 'fixo', ...acc.fixo,
        percent: expensesTotal.value > 0 ? (acc.fixo.total / expensesTotal.value) * 100 : 0,
      },
      {
        label: 'Variável', icon: 'swap_horiz', key: 'variavel', ...acc.variavel,
        percent: expensesTotal.value > 0 ? (acc.variavel.total / expensesTotal.value) * 100 : 0,
      },
      {
        label: 'Parcelado', icon: 'credit_score', key: 'parcelado', ...acc.parcelado,
        percent: expensesTotal.value > 0 ? (acc.parcelado.total / expensesTotal.value) * 100 : 0,
      },
    ]
  })

  // budgets
  const budgetOverruns = computed(() =>
    finance.budgets
      .map((b) => ({
        category: b.category,
        exceededBy: Number(byCategory.value[b.category] || 0) - Number(b.limit_amount || 0),
      }))
      .filter((item) => item.exceededBy > 0)
      .sort((a, b) => b.exceededBy - a.exceededBy),
  )
  const topBudgetOverrun = computed(() => budgetOverruns.value[0] || null)

  // installments (active + future total)
  const activeInstallments = computed(() => {
    const groups = {}
    finance.expenses.forEach((e) => {
      if (e.expense_type !== 'parcelado' || !e.installments) return
      const match = e.description?.match(/parcela\s+(\d+)\/(\d+)/i)
      if (match) {
        const cur = parseInt(match[1], 10)
        const total = parseInt(match[2], 10)
        const base = e.description.replace(/\s*-?\s*parcela\s+\d+\/\d+\s*$/i, '').trim()
        const key = `${base}__${total}__${e.amount}`
        if (!groups[key] || cur > groups[key]._cur) {
          groups[key] = { ...e, _cur: cur, _total: total }
        }
        return
      }
      groups[e.id] = { ...e, _cur: null }
    })

    return Object.values(groups)
      .map((e) => {
        if (e._cur !== null) {
          const remaining = Math.max(0, e._total - e._cur)
          return { ...e, remaining, totalRemaining: remaining * Number(e.amount || 0) }
        }
        const start = new Date(`${e.date}T00:00:00`)
        const diff =
          (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
        const curInstallment = Math.max(1, diff + 1)
        const totalInstallments = Number(e.installments || 0)
        const remaining = Math.max(0, totalInstallments - curInstallment)
        return { ...e, remaining, totalRemaining: (remaining + 1) * Number(e.amount || 0) }
      })
      .filter((e) => e.remaining > 0)
  })

  const futureInstallmentsTotal = computed(() =>
    activeInstallments.value.reduce((sum, i) => sum + Number(i.totalRemaining || 0), 0),
  )

  // trends
  const expenseTrend = computed(() => {
    if (previousExpensesTotal.value <= 0) return null
    return ((expensesTotal.value - previousExpensesTotal.value) / previousExpensesTotal.value) * 100
  })

  const balanceTrend = computed(() => {
    if (previousBalance.value === 0) return null
    return ((balance.value - previousBalance.value) / Math.abs(previousBalance.value)) * 100
  })

  // derived ratios
  const topCategoryCountShare = computed(() => {
    if (!totalExpenseTransactions.value || !mostFrequentCategory.value) return 0
    return (mostFrequentCategory.value.count / totalExpenseTransactions.value) * 100
  })

  const strongestDayShare = computed(() => {
    if (!expensesTotal.value || !mostExpensiveDay.value) return 0
    return (mostExpensiveDay.value.total / expensesTotal.value) * 100
  })

  const futureInstallmentsRatio = computed(() => {
    if (!futureInstallmentsTotal.value || !expensesTotal.value) return 0
    return (futureInstallmentsTotal.value / expensesTotal.value) * 100
  })

  // score
  const monthlyScore = computed(() =>
    computeScore({
      incomesTotal: incomesTotal.value,
      balance: balance.value,
      savingsRate: savingsRate.value,
      topCategoryPercent: topCategory.value?.percent ?? 0,
      topPaymentPercent: topPaymentByValue.value?.percent ?? 0,
      hasBudgetOverrun: !!topBudgetOverrun.value,
      futureInstallmentsRatio: futureInstallmentsRatio.value,
      expenseTrend: expenseTrend.value,
      installmentRatio:
        totalExpenseTransactions.value > 0
          ? installmentCount.value / totalExpenseTransactions.value
          : 0,
    }),
  )

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

  // score history: selected month + 5 meses anteriores
  const scoreHistory = computed(() =>
    Array.from({ length: 6 }, (_, i) => {
      let month = selectedMonth.value - (5 - i)
      let year = selectedYear.value
      while (month <= 0) { month += 12; year -= 1 }
      return {
        label: MONTH_SHORT[month - 1],
        score: calculateScoreForMonth(month, year, finance),
      }
    }),
  )

  // score history: selected month + 11 meses anteriores (para ScorePage)
  const scoreHistoryLong = computed(() =>
    Array.from({ length: 12 }, (_, i) => {
      let month = selectedMonth.value - (11 - i)
      let year = selectedYear.value
      while (month <= 0) { month += 12; year -= 1 }
      return {
        label: MONTH_SHORT[month - 1],
        score: calculateScoreForMonth(month, year, finance),
      }
    }),
  )

  // score factors breakdown (para ScorePage)
  const scoreFactors = computed(() => {
    const t = topCategory.value?.percent ?? 0
    const p = topPaymentByValue.value?.percent ?? 0
    const ir = futureInstallmentsRatio.value
    const et = expenseTrend.value
    const ratio = totalExpenseTransactions.value > 0
      ? installmentCount.value / totalExpenseTransactions.value
      : 0

    return [
      {
        id: 'entradas',
        label: 'Entradas registradas',
        icon: 'trending_up',
        description: 'Mês sem nenhuma entrada registrada indica dado incompleto e penaliza o score.',
        maxPenalty: 25,
        penalty: incomesTotal.value === 0 ? 25 : 0,
        bonus: 0,
        status: incomesTotal.value === 0 ? 'negative' : 'positive',
        hint: incomesTotal.value === 0
          ? 'Registre todas as suas fontes de renda mensalmente.'
          : `${formatMoney(incomesTotal.value)} em entradas registradas.`,
      },
      {
        id: 'equilibrio',
        label: 'Equilíbrio financeiro',
        icon: 'account_balance',
        description: 'Saldo negativo penaliza fortemente. Taxa de economia abaixo de 10% também.',
        maxPenalty: 30,
        penalty: balance.value < 0 ? 30 : (savingsRate.value !== null && savingsRate.value < 10 ? 10 : 0),
        bonus: 0,
        status: balance.value < 0 ? 'negative' : (savingsRate.value !== null && savingsRate.value < 10 ? 'warning' : 'positive'),
        hint: balance.value < 0
          ? `Saldo negativo em ${formatMoney(Math.abs(balance.value))}.`
          : savingsRate.value !== null && savingsRate.value < 10
            ? `Taxa de economia de ${formatPercent(savingsRate.value)}. Tente chegar a 10%.`
            : `Saldo positivo com ${formatPercent(savingsRate.value ?? 0)} de economia.`,
      },
      {
        id: 'categoria',
        label: 'Concentração por categoria',
        icon: 'category',
        description: 'Uma categoria acima de 30% dos gastos pode indicar desequilíbrio.',
        maxPenalty: 12,
        penalty: t >= 40 ? 12 : t >= 30 ? 6 : 0,
        bonus: 0,
        status: t >= 40 ? 'negative' : t >= 30 ? 'warning' : 'positive',
        hint: topCategory.value
          ? `${topCategory.value.name}: ${formatPercent(t)} dos gastos.`
          : 'Sem gastos registrados.',
      },
      {
        id: 'pagamento',
        label: 'Diversificação de pagamento',
        icon: 'credit_card',
        description: 'Uma forma de pagamento acima de 60% reduz a visibilidade financeira.',
        maxPenalty: 10,
        penalty: p >= 70 ? 10 : p >= 60 ? 5 : 0,
        bonus: 0,
        status: p >= 70 ? 'negative' : p >= 60 ? 'warning' : 'positive',
        hint: topPaymentByValue.value
          ? `${topPaymentByValue.value.label}: ${formatPercent(p)} dos gastos.`
          : 'Sem gastos registrados.',
      },
      {
        id: 'orcamento',
        label: 'Respeito ao orçamento',
        icon: 'price_check',
        description: 'Estourar o limite de uma categoria configurada penaliza o score do mês.',
        maxPenalty: 15,
        penalty: topBudgetOverrun.value ? 15 : 0,
        bonus: 0,
        status: topBudgetOverrun.value ? 'negative' : (finance.budgets.length === 0 ? 'warning' : 'positive'),
        hint: topBudgetOverrun.value
          ? `"${topBudgetOverrun.value.category}" excedeu o limite em ${formatMoney(topBudgetOverrun.value.exceededBy)}.`
          : finance.budgets.length === 0
            ? 'Configure orçamentos por categoria para ativar este critério.'
            : 'Todos os orçamentos dentro do limite.',
      },
      {
        id: 'parcelas',
        label: 'Carga de parcelas futuras',
        icon: 'event_repeat',
        description: 'Parcelas futuras acima de 80% dos gastos atuais comprometem meses seguintes.',
        maxPenalty: 10,
        penalty: ir >= 150 ? 10 : ir >= 80 ? 5 : 0,
        bonus: 0,
        status: ir >= 150 ? 'negative' : ir >= 80 ? 'warning' : 'positive',
        hint: `Parcelas futuras: ${formatPercent(ir)} dos gastos do mês.${ir >= 80 ? ' Evite novos parcelamentos.' : ' Carga saudável.'}`,
      },
      {
        id: 'tendencia',
        label: 'Tendência vs. mês anterior',
        icon: 'timeline',
        description: 'Gastos crescendo vs. mês anterior penalizam. Queda de 10%+ dá bônus de +4 pts.',
        maxPenalty: 10,
        penalty: et !== null ? (et >= 20 ? 10 : et >= 10 ? 6 : 0) : 0,
        bonus: et !== null && et <= -10 ? 4 : 0,
        status: et === null ? 'positive' : et >= 10 ? (et >= 20 ? 'negative' : 'warning') : 'positive',
        hint: et === null
          ? 'Sem mês anterior para comparar.'
          : et > 0
            ? `Gastos subiram ${formatPercent(et)} vs. mês anterior.`
            : `Gastos caíram ${formatPercent(Math.abs(et))} vs. mês anterior.${et <= -10 ? ' Bônus de +4 pts!' : ''}`,
      },
      {
        id: 'parcelamento',
        label: 'Proporção de parcelados',
        icon: 'credit_score',
        description: 'Mais de 40% das despesas parceladas aumenta o risco de desequilíbrio futuro.',
        maxPenalty: 5,
        penalty: ratio >= 0.4 ? 5 : 0,
        bonus: 0,
        status: ratio >= 0.4 ? 'warning' : 'positive',
        hint: `${formatPercent(ratio * 100)} das despesas são parceladas.${ratio >= 0.4 ? ' Procure reduzir novos parcelamentos.' : ' Dentro do limite saudável.'}`,
      },
    ]
  })

  // display labels
  const savingsRateLabel = computed(() => {
    if (savingsRate.value === null) return 'Sem entradas no mês para calcular taxa'
    return `${formatPercent(savingsRate.value)} de economia`
  })

  // behavior stats (UI-ready)
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

  // analysis data object (passado às regras)
  const analysisData = computed(() => ({
    topCategory: topCategory.value,
    topPaymentByValue: topPaymentByValue.value,
    incomesTotal: incomesTotal.value,
    balance: balance.value,
    savingsRate: savingsRate.value,
    topBudgetOverrun: topBudgetOverrun.value,
    expenseTrend: expenseTrend.value,
    balanceTrend: balanceTrend.value,
    strongestDayShare: strongestDayShare.value,
    mostExpensiveDay: mostExpensiveDay.value,
    topCategoryCountShare: topCategoryCountShare.value,
    mostFrequentCategory: mostFrequentCategory.value,
    futureInstallmentsTotal: futureInstallmentsTotal.value,
    expensesTotal: expensesTotal.value,
    monthlyScore: monthlyScore.value,
  }))

  // attention points (rule-based)
  const attentionPoints = computed(() =>
    ATTENTION_RULES
      .filter((rule) => rule.condition(analysisData.value))
      .map((rule) => {
        const tone = typeof rule.tone === 'function' ? rule.tone(analysisData.value) : rule.tone
        return {
          icon: rule.icon,
          tone: tone ? `insight-row__icon--${tone}` : 'insight-row__icon',
          text: rule.message(analysisData.value),
        }
      }),
  )

  // recommendations (rule-based)
  const recommendations = computed(() => {
    const list = RECOMMENDATION_RULES
      .filter((rule) => rule.condition(analysisData.value))
      .map((rule) => rule.message(analysisData.value))
    if (!list.length) {
      list.push(
        'Mantenha o padrão atual e continue acompanhando os indicadores para preservar consistência.',
      )
    }
    return list
  })

  // consultive summary
  const consultiveSummary = computed(() => {
    const d = analysisData.value
    const lines = []

    lines.push(
      `Você registrou ${totalExpenseTransactions.value} gasto(s) em ${periodLabel.value}, totalizando ${formatMoney(d.expensesTotal)}.`,
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

    if (d.topBudgetOverrun) {
      lines.push(
        `Houve estouro de orçamento em ${d.topBudgetOverrun.category}, acima do limite em ${formatMoney(d.topBudgetOverrun.exceededBy)}.`,
      )
    } else {
      lines.push('Nenhum orçamento foi excedido neste período.')
    }

    if (futureInstallmentsTotal.value > 0) {
      lines.push(`Você ainda tem ${formatMoney(futureInstallmentsTotal.value)} em parcelas futuras.`)
    } else {
      lines.push('Não há parcelas futuras em aberto.')
    }

    if (d.expenseTrend !== null) {
      lines.push(
        d.expenseTrend > 0
          ? `Seus gastos pioraram ${formatPercent(Math.abs(d.expenseTrend))} em relação ao mês anterior.`
          : `Seus gastos melhoraram ${formatPercent(Math.abs(d.expenseTrend))} em relação ao mês anterior.`,
      )
    }

    if (d.balanceTrend !== null) {
      lines.push(
        d.balanceTrend > 0
          ? `Seu saldo evoluiu ${formatPercent(d.balanceTrend)} frente ao período anterior.`
          : `Seu saldo recuou ${formatPercent(Math.abs(d.balanceTrend))} frente ao período anterior.`,
      )
    }

    return lines
  })

  // PDF export
  function exportPdf() {
    const doc = new jsPDF()
    const margin = 20
    let y = margin

    function checkPage(needed = 10) {
      if (y + needed > 275) { doc.addPage(); y = margin }
    }

    function heading(text, size = 13) {
      checkPage(12)
      doc.setFontSize(size)
      doc.setFont('helvetica', 'bold')
      doc.text(text, margin, y)
      y += 8
    }

    function body(text, indent = 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(text, 170 - indent)
      lines.forEach((line) => {
        checkPage()
        doc.text(line, margin + indent, y)
        y += 6
      })
    }

    function separator() {
      y += 2
      doc.setDrawColor(200)
      doc.line(margin, y, 190, y)
      y += 6
    }

    heading(`Fechamento Mensal — ${periodLabel.value}`, 16)
    body(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`)
    y += 4

    separator()
    heading('Resumo')
    body(`Entradas:  ${formatMoney(incomesTotal.value)}`)
    body(`Gastos:    ${formatMoney(expensesTotal.value)}`)
    body(`Saldo:     ${formatMoney(balance.value)}`)
    body(`Score:     ${monthlyScore.value}/100 — ${monthlyScoreLabel.value}`)
    y += 4

    if (topCategories.value.length) {
      separator()
      heading('Top Categorias')
      topCategories.value.forEach((cat) => {
        body(`• ${cat.name}: ${formatMoney(cat.total)} (${formatPercent(cat.percent)}) — ${cat.count} lançamento(s)`, 2)
      })
      y += 4
    }

    separator()
    heading('Composição dos Gastos')
    expenseTypeStats.value.forEach((t) => {
      body(`• ${t.label}: ${formatMoney(t.total)} (${formatPercent(t.percent)}) — ${t.count} lançamento(s)`, 2)
    })
    y += 4

    if (attentionPoints.value.length) {
      separator()
      heading('Pontos de Atenção')
      attentionPoints.value.forEach((p) => body(`• ${p.text}`, 2))
      y += 4
    }

    if (recommendations.value.length) {
      separator()
      heading('Recomendações')
      recommendations.value.forEach((r) => body(`• ${r}`, 2))
      y += 4
    }

    if (consultiveSummary.value.length) {
      separator()
      heading('Resumo Consultivo')
      consultiveSummary.value.forEach((line) => body(`• ${line}`, 2))
    }

    const filename = `fechamento-${periodLabel.value.toLowerCase().replace(/\s+/g, '-')}.pdf`
    doc.save(filename)
  }

  return {
    periodLabel,
    incomesTotal,
    expensesTotal,
    balance,
    savingsRate,
    savingsRateLabel,
    totalExpenseTransactions,
    incomesInPeriod,
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
    scoreHistoryLong,
    scoreFactors,
    expenseTrend,
    exportPdf,
  }
}
