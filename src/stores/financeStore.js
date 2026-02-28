import { defineStore } from 'pinia'
import {
  fetchExpenses,
  fetchIncomes,
  createExpense,
  updateExpense,
  deleteExpense,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../services/financeService'

function parseDate(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  return Number.isNaN(d.getTime()) ? null : d
}

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    expenses: [],
    incomes: [],
    loading: false,
    error: null,
  }),

  getters: {
    currentMonth: () => new Date().getMonth() + 1,
    currentYear: () => new Date().getFullYear(),

    monthlyExpensesTotal: (state) => (month, year) => {
      const m = month || new Date().getMonth() + 1
      const y = year || new Date().getFullYear()

      return state.expenses.reduce((total, expense) => {
        const date = parseDate(expense.date)
        if (!date) return total
        if (date.getMonth() + 1 === m && date.getFullYear() === y) {
          return total + Number(expense.amount || 0)
        }
        return total
      }, 0)
    },

    monthlyIncomesTotal: (state) => (month, year) => {
      const m = month || new Date().getMonth() + 1
      const y = year || new Date().getFullYear()

      return state.incomes.reduce((total, income) => {
        const date = parseDate(income.date)
        if (!date) return total
        if (date.getMonth() + 1 === m && date.getFullYear() === y) {
          return total + Number(income.amount || 0)
        }
        return total
      }, 0)
    },

    balance:
      (state, getters) =>
      (month, year) => {
        const incomes = getters.monthlyIncomesTotal(month, year)
        const expenses = getters.monthlyExpensesTotal(month, year)
        return incomes - expenses
      },

    expensesByCategory: (state) => (month, year) => {
      const result = {}
      const m = month || new Date().getMonth() + 1
      const y = year || new Date().getFullYear()

      state.expenses.forEach((expense) => {
        const date = parseDate(expense.date)
        if (!date) return
        if (date.getMonth() + 1 !== m || date.getFullYear() !== y) return

        const category = expense.category || 'Sem categoria'
        result[category] = (result[category] || 0) + Number(expense.amount || 0)
      })

      return result
    },

    expensesByLocation: (state) => (month, year) => {
      const result = {}
      const m = month || new Date().getMonth() + 1
      const y = year || new Date().getFullYear()

      state.expenses.forEach((expense) => {
        const date = parseDate(expense.date)
        if (!date) return
        if (date.getMonth() + 1 !== m || date.getFullYear() !== y) return

        const location = expense.location || 'Sem local'
        result[location] = (result[location] || 0) + Number(expense.amount || 0)
      })

      return result
    },

    expensesByMonth: (state) => (year) => {
      const y = year || new Date().getFullYear()
      const result = Array.from({ length: 12 }, () => 0)

      state.expenses.forEach((expense) => {
        const date = parseDate(expense.date)
        if (!date) return
        if (date.getFullYear() !== y) return

        const monthIndex = date.getMonth()
        result[monthIndex] += Number(expense.amount || 0)
      })

      return result
    },

    balanceEvolutionByMonth: (state) => (year) => {
      const y = year || new Date().getFullYear()
      const incomesByMonth = Array.from({ length: 12 }, () => 0)
      const expensesByMonth = Array.from({ length: 12 }, () => 0)

      state.incomes.forEach((income) => {
        const date = parseDate(income.date)
        if (!date) return
        if (date.getFullYear() !== y) return

        const monthIndex = date.getMonth()
        incomesByMonth[monthIndex] += Number(income.amount || 0)
      })

      state.expenses.forEach((expense) => {
        const date = parseDate(expense.date)
        if (!date) return
        if (date.getFullYear() !== y) return

        const monthIndex = date.getMonth()
        expensesByMonth[monthIndex] += Number(expense.amount || 0)
      })

      return incomesByMonth.map((income, index) => income - expensesByMonth[index])
    },
  },

  actions: {
    async loadData() {
      this.loading = true
      this.error = null
      try {
        const [expenses, incomes] = await Promise.all([
          fetchExpenses(),
          fetchIncomes(),
        ])
        this.expenses = expenses
        this.incomes = incomes
      } catch (err) {
        this.error = err.message || 'Erro ao carregar dados financeiros.'
      } finally {
        this.loading = false
      }
    },

    async addExpense(expense) {
      this.loading = true
      this.error = null
      try {
        const created = await createExpense(expense)
        this.expenses.unshift(created)
      } catch (err) {
        this.error = err.message || 'Erro ao adicionar gasto.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async editExpense(id, expense) {
      this.loading = true
      this.error = null
      try {
        const updated = await updateExpense(id, expense)
        const index = this.expenses.findIndex((item) => item.id === id)
        if (index !== -1) {
          this.expenses.splice(index, 1, updated)
        }
      } catch (err) {
        this.error = err.message || 'Erro ao atualizar gasto.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async removeExpense(id) {
      this.loading = true
      this.error = null
      try {
        await deleteExpense(id)
        this.expenses = this.expenses.filter((item) => item.id !== id)
      } catch (err) {
        this.error = err.message || 'Erro ao excluir gasto.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async addIncome(income) {
      this.loading = true
      this.error = null
      try {
        const created = await createIncome(income)
        this.incomes.unshift(created)
      } catch (err) {
        this.error = err.message || 'Erro ao adicionar entrada.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async editIncome(id, income) {
      this.loading = true
      this.error = null
      try {
        const updated = await updateIncome(id, income)
        const index = this.incomes.findIndex((item) => item.id === id)
        if (index !== -1) {
          this.incomes.splice(index, 1, updated)
        }
      } catch (err) {
        this.error = err.message || 'Erro ao atualizar entrada.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async removeIncome(id) {
      this.loading = true
      this.error = null
      try {
        await deleteIncome(id)
        this.incomes = this.incomes.filter((item) => item.id !== id)
      } catch (err) {
        this.error = err.message || 'Erro ao excluir entrada.'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})

