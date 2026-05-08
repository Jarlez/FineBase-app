<template>
  <q-layout view="hHh lpR fFf" class="app-layout">
    <q-header class="app-header text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :icon="isMini ? 'menu' : 'menu_open'"
          :aria-label="isMini ? 'Expandir menu lateral' : 'Recolher para menu compacto'"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title class="text-weight-medium">
          FineBase App
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      :model-value="true"
      show-if-above
      bordered
      class="app-drawer"
      :width="260"
      :mini="isMini"
    >
      <q-list padding class="q-pt-md">

        <q-item
          clickable
          tag="router-link"
          to="/dashboard"
          :active="$route.name === 'dashboard'"
          active-class="app-drawer-item--active"
          class="app-drawer-item"
          exact
        >
          <q-item-section avatar>
            <q-icon name="dashboard" size="sm" />
          </q-item-section>
          <q-item-section v-if="!isMini">Dashboard</q-item-section>
        </q-item>

        <q-item
          clickable
          tag="router-link"
          to="/gastos"
          :active="$route.name === 'expenses'"
          active-class="app-drawer-item--active"
          class="app-drawer-item"
        >
          <q-item-section avatar>
            <q-icon name="trending_down" size="sm" />
          </q-item-section>
          <q-item-section v-if="!isMini">Gastos</q-item-section>
        </q-item>

        <q-item
          clickable
          tag="router-link"
          to="/entradas"
          :active="$route.name === 'incomes'"
          active-class="app-drawer-item--active"
          class="app-drawer-item"
        >
          <q-item-section avatar>
            <q-icon name="trending_up" size="sm" />
          </q-item-section>
          <q-item-section v-if="!isMini">Entradas</q-item-section>
        </q-item>

        <q-item
          clickable
          tag="router-link"
          to="/recorrentes"
          :active="$route.name === 'recurring'"
          active-class="app-drawer-item--active"
          class="app-drawer-item"
        >
          <q-item-section avatar>
            <q-icon name="repeat" size="sm" />
          </q-item-section>
          <q-item-section v-if="!isMini">Recorrentes</q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <!-- Indicador de saldo do mês -->
        <div v-if="!isMini" class="balance-widget q-px-md q-pb-md q-pt-sm">
          <div class="text-caption text-grey-6 q-mb-xs">Saldo de {{ currentMonthName }}</div>
          <div
            class="text-subtitle1 text-weight-bold"
            :class="currentMonthBalance >= 0 ? 'text-positive' : 'text-negative'"
          >
            {{ formatMoney(currentMonthBalance) }}
          </div>
          <div class="row q-gutter-x-sm q-mt-xs">
            <div class="col">
              <div class="text-caption text-grey-5">Entradas</div>
              <div class="text-caption text-positive text-weight-medium">{{ formatMoney(currentMonthIncomes) }}</div>
            </div>
            <div class="col">
              <div class="text-caption text-grey-5">Gastos</div>
              <div class="text-caption text-negative text-weight-medium">{{ formatMoney(currentMonthExpenses) }}</div>
            </div>
          </div>
        </div>

        <!-- Versão mini: apenas ícone com cor do saldo -->
        <div v-else class="column items-center q-py-sm">
          <q-icon
            name="account_balance_wallet"
            size="sm"
            :color="currentMonthBalance >= 0 ? 'positive' : 'negative'"
          >
            <q-tooltip anchor="center right" self="center left">
              Saldo: {{ formatMoney(currentMonthBalance) }}
            </q-tooltip>
          </q-icon>
        </div>

      </q-list>
    </q-drawer>

    <q-page-container class="app-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from './stores/financeStore'

const isMini = ref(false)
const finance = useFinanceStore()

const toggleLeftDrawer = () => {
  isMini.value = !isMini.value
}

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

const currentMonthName = now.toLocaleString('pt-BR', { month: 'long' })

const currentMonthBalance = computed(() => finance.balance(currentMonth, currentYear))
const currentMonthIncomes = computed(() => finance.monthlyIncomesTotal(currentMonth, currentYear))
const currentMonthExpenses = computed(() => finance.monthlyExpensesTotal(currentMonth, currentYear))

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>

<style scoped>
.app-header {
  background: var(--q-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.app-drawer {
  background: #fafafa;
}

/* Drawer fixo: não rola junto com o conteúdo da página */
.app-layout :deep(.q-drawer) {
  position: fixed !important;
  top: 0;
  bottom: 0;
  z-index: 2000;
}
.app-layout :deep(.q-drawer__content) {
  position: fixed !important;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-drawer-item--active {
  color: var(--q-primary);
  background: rgba(37, 99, 235, 0.08);
}

.balance-widget {
  background: #f1f5f9;
  border-radius: 12px;
  margin: 0 8px;
}

.app-page-container {
  background: #f1f5f9;
  overflow: auto;
}

/* Apenas o conteúdo da página rola; header e drawer permanecem fixos */
.app-layout {
  overflow: hidden;
}
</style>
