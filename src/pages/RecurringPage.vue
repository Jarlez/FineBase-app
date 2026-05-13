<template>
  <q-page class="page-recurring">
    <div class="row justify-between">
      <div class="column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Gastos Recorrentes</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Templates de gastos que se repetem todo mês
        </p>
      </div>
      <div class="q-pt-sm">
        <q-btn
          label="Novo template"
          no-caps
          unelevated
          icon="add"
          rounded
          color="primary"
          @click="openFormModal"
        />
      </div>
    </div>

    <!-- Dialog formulário -->
    <q-dialog v-model="formModalOpen" persistent>
      <q-card style="min-width: 450px; max-width: 500px" class="rounded-borders">
        <q-card-section class="row items-center modal-head">
          <div class="modal-title">{{ isEditing ? 'Editar template' : 'Novo template' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="onModalClose" />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="onSubmit">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  label="Descrição"
                  dense
                  outlined
                  :rules="[v => !!v || 'Informe a descrição']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.category"
                  :options="categoryOptions"
                  label="Categoria"
                  dense
                  outlined
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.location" label="Local" dense outlined />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.payment_method"
                  :options="paymentMethods"
                  label="Forma de pagamento"
                  dense
                  outlined
                  emit-value
                  map-options
                  clearable
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
                  :rules="[v => v > 0 || 'Informe um valor maior que zero']"
                />
              </div>
            </div>
            <div class="row items-center justify-end q-mt-md">
              <q-btn
                :label="isEditing ? 'Salvar alterações' : 'Adicionar'"
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

    <!-- Dialog confirmação exclusão -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card style="min-width: 300px" class="rounded-borders">
        <q-card-section>
          <div class="text-body1 text-weight-medium">Excluir template</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            Excluir <strong>{{ deleteTarget?.description }}</strong>? Essa ação não pode ser desfeita.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" unelevated rounded no-caps label="Excluir" :loading="finance.loading" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Skeleton loading -->
    <div v-if="isInitialLoading" class="row q-col-gutter-md">
      <div v-for="i in 4" :key="i" class="col-12 col-sm-6 col-md-4">
        <q-skeleton type="rect" height="140px" class="rounded-borders" />
      </div>
    </div>

    <!-- Lista de templates -->
    <div v-else>
      <div v-if="!finance.recurringTemplates.length" class="text-center q-py-xl">
        <q-icon name="repeat" size="64px" color="grey-3" />
        <div class="text-subtitle1 text-grey-5 q-mt-md">Nenhum template cadastrado</div>
        <div class="text-body2 text-grey-4 q-mt-xs">
          Adicione gastos que se repetem todo mês para lançá-los com um clique.
        </div>
        <q-btn class="q-mt-lg" label="Novo template" no-caps unelevated rounded color="primary" icon="add" @click="openFormModal" />
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="template in finance.recurringTemplates" :key="template.id" class="col-12 col-sm-6 col-md-4">
          <div class="template-card">
            <div class="tc-body">
              <div class="tc-icon">
                <q-icon name="repeat" size="16px" />
              </div>

              <div class="tc-info">
                <div class="tc-description">{{ template.description }}</div>
                <div class="tc-meta">
                  <span v-if="template.category" class="tc-tag" :style="categoryTagStyle(template.category)">
                    {{ template.category }}
                  </span>
                  <span v-if="template.payment_method" class="tc-payment">
                    {{ paymentLabel(template.payment_method) }}
                  </span>
                  <span v-if="template.location" class="tc-location">
                    <q-icon name="location_on" size="11px" />{{ template.location }}
                  </span>
                </div>
              </div>

              <div class="tc-amount-wrap">
                <div class="tc-amount-label">Valor mensal</div>
                <div class="tc-amount">{{ formatMoney(template.amount) }}</div>
              </div>
            </div>

            <div class="tc-footer">
              <q-btn
                no-caps
                unelevated
                rounded
                color="primary"
                icon="add_task"
                :label="launching[template.id] ? 'Lançando...' : 'Lançar este mês'"
                :loading="!!launching[template.id]"
                class="tc-launch-btn"
                @click="launchThisMonth(template)"
              />

              <div class="tc-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="grey-7"
                  size="sm"
                  @click="openEditModal(template)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="grey-7"
                  size="sm"
                  @click="openDeleteDialog(template)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '../stores/financeStore'
import { useQuasar } from 'quasar'

const finance = useFinanceStore()
const $q = useQuasar()

const formModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteDialogOpen = ref(false)
const deleteTarget = ref(null)
const launching = ref({})

const defaultForm = () => ({
  description: '',
  category: null,
  location: '',
  payment_method: null,
  amount: null,
})

const form = ref(defaultForm())

const categoryOptions = [
  { label: 'Assinaturas', value: 'Assinaturas' },
  { label: 'Casa', value: 'Casa' },
  { label: 'Compras', value: 'Compras' },
  { label: 'Delivery', value: 'Delivery' },
  { label: 'Doações', value: 'Doações' },
  { label: 'Educação', value: 'Educação' },
  { label: 'Empréstimos', value: 'Empréstimos' },
  { label: 'Imprevistos', value: 'Imprevistos' },
  { label: 'Investimentos', value: 'Investimentos' },
  { label: 'Lazer', value: 'Lazer' },
  { label: 'Reserva de emergência', value: 'Reserva de emergência' },
  { label: 'Saúde', value: 'Saúde' },
  { label: 'Supermercado', value: 'Supermercado' },
  { label: 'Transporte', value: 'Transporte' },
]

const paymentMethods = [
  { label: 'Débito', value: 'debito' },
  { label: 'Crédito', value: 'credito' },
  { label: 'Pix', value: 'pix' },
  { label: 'Dinheiro', value: 'dinheiro' },
]

const isInitialLoading = computed(() => finance.loading && !finance.recurringTemplates.length)

function openFormModal() {
  form.value = defaultForm()
  isEditing.value = false
  editingId.value = null
  formModalOpen.value = true
}

function openEditModal(template) {
  form.value = {
    description: template.description,
    category: template.category || null,
    location: template.location || '',
    payment_method: template.payment_method || null,
    amount: Number(template.amount),
  }
  isEditing.value = true
  editingId.value = template.id
  formModalOpen.value = true
}

function onModalClose() {
  form.value = defaultForm()
  isEditing.value = false
  editingId.value = null
}

async function onSubmit() {
  try {
    if (isEditing.value) {
      await finance.editRecurringTemplate(editingId.value, form.value)
    } else {
      await finance.addRecurringTemplate(form.value)
    }
    formModalOpen.value = false
    onModalClose()
  } catch (err) {
    console.error(err)
  }
}

function openDeleteDialog(template) {
  deleteTarget.value = template
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  try {
    await finance.removeRecurringTemplate(deleteTarget.value.id)
    deleteDialogOpen.value = false
    deleteTarget.value = null
  } catch (err) {
    console.error(err)
  }
}

async function launchThisMonth(template) {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  launching.value = { ...launching.value, [template.id]: true }
  try {
    await finance.addExpense({
      description: template.description,
      category: template.category,
      location: template.location,
      payment_method: template.payment_method,
      amount: template.amount,
      date: dateStr,
      expense_type: 'fixo',
    })
    $q.notify({
      message: `"${template.description}" lançado com sucesso!`,
      color: 'positive',
      icon: 'check_circle',
      timeout: 2500,
    })
  } catch {
    $q.notify({
      message: 'Erro ao lançar gasto.',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    const next = { ...launching.value }
    delete next[template.id]
    launching.value = next
  }
}

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const paymentLabel = (value) => {
  const map = { debito: 'Débito', credito: 'Crédito', pix: 'Pix', dinheiro: 'Dinheiro' }
  return map[value] ?? value
}

const CATEGORY_COLORS = {
  Assinaturas: '#8d6e63', Casa: '#ef5350', Compras: '#5c6bc0', Delivery: '#ff7043',
  Doações: '#26a69a', Educação: '#42a5f5', Empréstimos: '#ab47bc', Imprevistos: '#ef9a9a',
  Investimentos: '#66bb6a', Lazer: '#26c6da', 'Reserva de emergência': '#fbc02d',
  Saúde: '#ba68c8', Supermercado: '#7cb342', Transporte: '#fb8c00',
}

function categoryTagStyle(category) {
  const color = CATEGORY_COLORS[category] ?? '#94a3b8'
  return {
    background: `${color}18`,
    color,
  }
}

onMounted(() => {
  if (!finance.expenses.length) {
    finance.loadData()
  }
})
</script>

<style scoped>
.page-recurring { padding: 20px 24px; }

/* ── Template card ─────────────────────────────────────── */
.template-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: box-shadow .15s;
  overflow: hidden;
}


.tc-body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.tc-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--bg-soft);
  color: var(--text-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.tc-info {
  flex: 1;
  min-width: 0;
}

.tc-description {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  flex-wrap: wrap;
}

.tc-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.5;
}

.tc-payment {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-3);
  background: var(--bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-soft);
}

.tc-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11.5px;
  color: var(--text-4);
}

.tc-amount-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.tc-amount-label {
  font-size: 10px;
  color: var(--text-4);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-weight: 600;
}

.tc-amount {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  line-height: 1.2;
}

/* ── Footer ────────────────────────────────────────────── */
.tc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-top: 1px solid var(--border-soft);
  background: var(--bg-soft);
  gap: 8px;
}

.tc-launch-btn {
  font-size: 12px;
  font-weight: 600;
}

.tc-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
