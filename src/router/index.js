import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import PortalPage from '../pages/PortalPage.vue'
import AuthPage from '../pages/AuthPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import ExpensesPage from '../pages/ExpensesPage.vue'
import IncomesPage from '../pages/IncomesPage.vue'
import MonthlyClosingPage from '../pages/MonthlyClosingPage.vue'
import RecurringPage from '../pages/RecurringPage.vue'
import ScorePage from '../pages/ScorePage.vue'

const routes = [
  // Public routes (redirect to dashboard if already authenticated)
  {
    path: '/portal',
    name: 'portal',
    component: PortalPage,
    meta: { guestOnly: true },
  },
  {
    path: '/login',
    name: 'login',
    component: AuthPage,
    meta: { guestOnly: true },
  },
  {
    path: '/cadastro',
    name: 'register',
    component: AuthPage,
    meta: { guestOnly: true },
  },

  // Protected routes
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/gastos',
    name: 'expenses',
    component: ExpensesPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/entradas',
    name: 'incomes',
    component: IncomesPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/recorrentes',
    name: 'recurring',
    component: RecurringPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/fechamento-mensal',
    name: 'monthly-closing',
    component: MonthlyClosingPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/score',
    name: 'score',
    component: ScorePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/perfil',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.loading) {
    await auth.initialize()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'portal' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
