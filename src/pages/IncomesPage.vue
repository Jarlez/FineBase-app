<template>
  <q-page class="page-incomes">
     <div class="row  justify-between">
      <div class="page-expenses__header column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Entradas</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Registre e gerencie suas entradas
        </p>
      </div>
      <div class="q-pt-sm">
        <q-btn label="Adicionar entrada" no-caps unelevated icon="add" rounded color="primary" @click="openFormModal" />
      </div>
    </div>

    <q-dialog v-model="formModalOpen" persistent>
      <q-card class="rounded-borders" style="min-width: 450px; max-width: 500px">
        <q-card-section class="row items-center q-py-sm bg-primary">
          <div class="text-h6 text-white">
            {{ isEditing ? 'Editar entrada' : 'Adicionar entrada' }}
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            class="text-white"
            round
            dense
            v-close-popup
            @click="onModalClose"
          />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="onSubmit" @reset.prevent="onReset">
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.date"
                  type="date"
                  label="Data"
                  dense
                  outlined
                  :rules="[val => !!val || 'Informe a data']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.description"
                  label="Descrição"
                  dense
                  outlined
                  :rules="[val => !!val || 'Informe a descrição']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.source"
                  :options="incomeSourceOptions"
                  label="Fonte da entrada"
                  dense
                  outlined
                  emit-value
                  map-options
                  hide-bottom-space
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.amount"
                  label="Valor"
                  type="number"
                  dense
                  outlined
                  prefix="R$"
                  :rules="[val => val > 0 || 'Informe um valor maior que zero']"
                />
              </div>
            </div>

            <div class="row items-center justify-end q-mt-md">
              <q-btn
                :label="isEditing ? 'Salvar alterações' : 'Adicionar Entrada'"
                color="primary"
                unelevated
                rounded
                no-caps
                icon="save"
                type="submit"
                :loading="finance.loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <FilterCard
      class="q-mb-md"
      :category-options="incomeSourceOptions"
      category-label="Fonte da entrada"
      default-preset="this_month"
      @update:date-range="filterDateRange = $event"
      @update:category="filterCategory = $event"
      @update:preset="filterPreset = $event"
    />

    <div class="row q-col-gutter-md q-mb-md stat-cards">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card stat-card--expense">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="receipt_long" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Total no Período</span>
              <span class="stat-card__value stat-card__value--positive">
                {{ totalInPeriodFormatted }}
              </span>
              <span class="stat-card__subtext">
                {{ totalPeriodSubtext }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card stat-card--daily">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="today" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Média Diária</span>
              <span class="stat-card__value stat-card__value--daily">
                {{ averageDailyFormatted }}
              </span>
              <span class="stat-card__subtext">
                {{ averageDailySubtext }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card stat-card--top">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="pie_chart" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Maior Fonte</span>
              <span class="stat-card__top-category">
                {{ topSourceName }}
              </span>
              <span class="stat-card__subtext">
                {{ topSourceSubtext }}
              </span>
            </div>
          </q-card-section>
        </q-card>
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

    <q-table
      class="table-incomes"
      table-header-class="bg-primary text-white"
      table-class="bg-white text-black"
      row-key="id"
      virtual-scroll
      bordered
      style="border-radius: 12px"
      flat
      dense
      hide-pagination
      wrap-cells
      clickable
      hide-bottom
      :rows="filteredIncomes"
      :columns="columns"
      :rows-per-page-options="[0]"
      no-data-label="Nenhuma entrada cadastrada."
    >
          <template #body-cell-detalhes="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                icon="info"
                size="sm"
                color="grey-7"
                @click="openDetailsModal(props.row)"
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                icon="edit"
                size="sm"
                color="primary"
                @click="startEdit(props.row); formModalOpen = true"
              />
              <q-btn
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="removeIncome(props.row)"
              />
            </q-td>
          </template>
    </q-table>

    <q-dialog v-model="detailsModalOpen" persistent>
      <q-card
        class="rounded-borders"
        style="min-width: 380px; max-width: 480px"
      >
        <q-card-section class="row items-center q-py-sm bg-primary">
          <div class="text-h6 text-white">Detalhes da entrada</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            class="text-white"
            v-close-popup
            @click="detailsModalOpen = false"
          />
        </q-card-section>
        <q-card-section v-if="selectedIncomeForDetails">
          <div class="text-center q-mb-md">
            <div class="text-caption text-grey-6">Valor da entrada</div>
            <div class="text-h5 text-positive text-weight-bold">
              {{ formatCurrency(selectedIncomeForDetails.amount) }}
            </div>
          </div>

          <q-separator spaced />

          <div class="q-gutter-sm">
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Data</div>
              <div class="text-weight-medium">
                {{ formatDateBR(selectedIncomeForDetails.date) }}
              </div>
            </div>
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Descrição</div>
              <div>{{ selectedIncomeForDetails.description || '–' }}</div>
            </div>
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Fonte</div>
              <div>{{ selectedIncomeForDetails.source || '–' }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import FilterCard from '../components/FilterCard.vue'
import { formatDateBR } from '../utils/formatDate'

const $q = useQuasar()
const finance = useFinanceStore()

const getDefaultDateRange = () => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(1)
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { start: toISO(start), end: toISO(today) }
}

const filterDateRange = ref(getDefaultDateRange())
const filterCategory = ref(null)
const filterPreset = ref('this_month')

const filteredIncomes = computed(() => {
  let list = finance.incomes
  if (filterDateRange.value) {
    const { start, end } = filterDateRange.value
    list = list.filter(
      (item) => item.date >= start && item.date <= end
    )
  }
  if (filterCategory.value != null && filterCategory.value !== '') {
    list = list.filter((item) => item.source === filterCategory.value)
  }
  return list
})

const daysBetween = (startStr, endStr) => {
  const a = new Date(startStr)
  const b = new Date(endStr)
  return Math.max(1, Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1)
}

const totalInPeriod = computed(() =>
  filteredIncomes.value.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )
)

const daysInPeriod = computed(() => {
  if (!filterDateRange.value) return 1
  return daysBetween(filterDateRange.value.start, filterDateRange.value.end)
})

const totalInPeriodFormatted = computed(() =>
  formatCurrency(totalInPeriod.value)
)

const averageDaily = computed(() =>
  daysInPeriod.value > 0 ? totalInPeriod.value / daysInPeriod.value : 0
)

const averageDailyFormatted = computed(() =>
  formatCurrency(averageDaily.value)
)

const topSourceData = computed(() => {
  const list = filteredIncomes.value
  if (!list.length) return null
  const bySource = {}
  list.forEach((item) => {
    const src = item.source || 'Outros'
    bySource[src] = (bySource[src] || 0) + Number(item.amount || 0)
  })
  const total = totalInPeriod.value
  let maxAmount = 0
  let maxSource = null
  Object.entries(bySource).forEach(([src, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount
      maxSource = src
    }
  })
  if (!maxSource || total <= 0) return null
  const pct = Math.round((maxAmount / total) * 100)
  return { name: maxSource, amount: maxAmount, percent: pct }
})

const topSourceName = computed(() => topSourceData.value?.name ?? '–')
const topSourceSubtext = computed(() => {
  const d = topSourceData.value
  if (!d) return ''
  return `${formatCurrency(d.amount)} (${d.percent}% do total)`
})

const lastMonthComparison = computed(() => {
  if (filterPreset.value !== 'this_month' || !filterDateRange.value)
    return null
  const now = new Date()
  const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const startLast = toISO(firstLastMonth)
  const endLast = toISO(lastLastMonth)
  const lastMonthIncomes = finance.incomes.filter(
    (item) => item.date >= startLast && item.date <= endLast
  )
  const lastMonthTotal = lastMonthIncomes.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )
  const current = totalInPeriod.value
  if (lastMonthTotal === 0) {
    return { total: 0, percent: current > 0 ? 100 : 0 }
  }
  const percent = Math.round(
    ((current - lastMonthTotal) / lastMonthTotal) * 100
  )
  return { total: lastMonthTotal, percent }
})

const totalPeriodSubtext = computed(() => {
  const comp = lastMonthComparison.value
  if (filterPreset.value !== 'this_month' || comp === null) {
    return 'Baseado no filtro selecionado'
  }
  const signal = comp.percent >= 0 ? '🔺 +' : '🔻 '
  return `${signal}${comp.percent}% · Mês passado: ${formatCurrency(comp.total)}`
})

const lastMonthAverageDaily = computed(() => {
  const comp = lastMonthComparison.value
  if (comp === null) return null
  const now = new Date()
  const daysInLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0
  ).getDate()
  return daysInLastMonth > 0 ? comp.total / daysInLastMonth : 0
})

const averageDailySubtext = computed(() => {
  const avg = lastMonthAverageDaily.value
  if (avg === null || filterPreset.value !== 'this_month') {
    return 'Baseado no filtro selecionado'
  }
  return `vs mês passado: ${formatCurrency(avg)}`
})

const incomeSourceOptions = [
  { label: 'Extra', value: 'Extra' },
  { label: 'Presente', value: 'Presente' },
  { label: 'Renda Secundária', value: 'Renda Secundária' },
  { label: 'Resgate investimento', value: 'Resgate investimento' },
  { label: 'Salário', value: 'Salário' },
  { label: 'Vale', value: 'Vale' },
  { label: 'Venda', value: 'Venda' },
]

const columns = [
  {
    name: 'date',
    label: 'Data',
    field: 'date',
    align: 'left',
    format: (val) => formatDateBR(val),
  },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
  { name: 'source', label: 'Fonte', field: 'source', align: 'left' },
  {
    name: 'amount',
    label: 'Valor',
    field: 'amount',
    align: 'right',
    format: (val) => formatCurrency(val),
  },
  { name: 'detalhes', label: 'Detalhes', field: 'detalhes', align: 'center' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
]

const emptyForm = () => ({
  id: null,
  date: '',
  description: '',
  source: '',
  amount: null,
})

const form = reactive(emptyForm())
const editingId = ref(null)
const formModalOpen = ref(false)
const detailsModalOpen = ref(false)
const selectedIncomeForDetails = ref(null)

const isEditing = computed(() => editingId.value !== null)

const openDetailsModal = (row) => {
  selectedIncomeForDetails.value = row
  detailsModalOpen.value = true
}

const openFormModal = () => {
  onReset()
  formModalOpen.value = true
}

const onModalClose = () => {
  onReset()
}

const formatCurrency = (value) => {
  const number = Number(value || 0)
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function onReset() {
  Object.assign(form, emptyForm())
  editingId.value = null
}

async function onSubmit() {
  const payload = {
    date: form.date,
    description: form.description,
    source: form.source,
    amount: Number(form.amount),
  }

  try {
    if (isEditing.value && editingId.value) {
      await finance.editIncome(editingId.value, payload)
      $q.notify({
        type: 'positive',
        message: 'Entrada atualizada com sucesso!',
      })
    } else {
      await finance.addIncome(payload)
      $q.notify({
        type: 'positive',
        message: 'Entrada adicionada com sucesso!',
      })
    }
    onReset()
    formModalOpen.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao salvar entrada.',
    })
  }
}

function startEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    id: row.id,
    date: row.date || '',
    description: row.description || '',
    source: row.source || '',
    amount: row.amount,
  })
}

function cancelEdit() {
  onReset()
  formModalOpen.value = false
}

async function removeIncome(row) {
  $q.dialog({
    title: 'Excluir entrada',
    message: 'Tem certeza que deseja excluir esta entrada?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await finance.removeIncome(row.id)
      $q.notify({
        type: 'positive',
        message: 'Entrada excluída com sucesso!',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao excluir entrada.',
      })
    }
  })
}

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData()
  }
})
</script>

<style scoped>
.page-incomes {
  padding: 24px 20px;
}

.page-card {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.page-card--error {
  background: #fef2f2;
}

.stat-cards {
  --stat-expense: #dc2626;
  --stat-daily: #0ea5e9;
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

.stat-card--expense .stat-card__icon {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

.stat-card--daily .stat-card__icon {
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

.stat-card__value--positive {
  color: #059669;
}

.stat-card__value--daily {
  color: #0ea5e9;
}

.stat-card__top-category {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.stat-card__subtext {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 2px;
}

.table-incomes {
  height: 54vh;
}

.table-incomes :deep(.q-table__middle) {
  overflow: auto;
  max-height: 54vh;
}

.table-incomes :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--q-primary) !important;
  color: white !important;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
}

@media screen and (max-width: 1600px) and (max-height: 900px) {
  .table-incomes {
    height: 42vh;
  }
  .table-incomes :deep(.q-table__middle) {
    max-height: 42vh;
  }
}

@media screen and (max-width: 1365px), screen and (max-height: 767px) {
  .table-incomes {
    height: 29vh;
  }
  .table-incomes :deep(.q-table__middle) {
    max-height: 29vh;
  }
}
</style>

