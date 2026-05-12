import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import ExpensesPage from '../pages/ExpensesPage.vue'
import IncomesPage from '../pages/IncomesPage.vue'
import MonthlyClosingPage from '../pages/MonthlyClosingPage.vue'
import RecurringPage from '../pages/RecurringPage.vue'
import ScorePage from '../pages/ScorePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/gastos',
    name: 'expenses',
    component: ExpensesPage,
  },
  {
    path: '/entradas',
    name: 'incomes',
    component: IncomesPage,
  },
  {
    path: '/recorrentes',
    name: 'recurring',
    component: RecurringPage,
  },
  {
    path: '/fechamento-mensal',
    name: 'monthly-closing',
    component: MonthlyClosingPage,
  },
  {
    path: '/score',
    name: 'score',
    component: ScorePage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

