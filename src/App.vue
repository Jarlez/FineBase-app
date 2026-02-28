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
      </q-list>
    </q-drawer>

    <q-page-container class="app-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const isMini = ref(false)

const toggleLeftDrawer = () => {
  isMini.value = !isMini.value
}
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

.app-page-container {
  background: #f1f5f9;
  overflow: auto;
}

/* Apenas o conteúdo da página rola; header e drawer permanecem fixos */
.app-layout {
  overflow: hidden;
}
</style>
