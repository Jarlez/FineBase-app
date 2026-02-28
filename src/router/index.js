import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import ExpensesPage from '../pages/ExpensesPage.vue'
import IncomesPage from '../pages/IncomesPage.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

