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
        <q-card-section class="row items-center q-py-sm bg-primary">
          <div class="text-h6 text-white">{{ isEditing ? 'Editar template' : 'Novo template' }}</div>
          <q-space />
          <q-btn icon="close" flat class="text-white" round dense v-close-popup @click="onModalClose" />
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
          <q-card flat class="template-card rounded-borders">
            <q-card-section>
              <div class="row items-start justify-between no-wrap">
                <div class="column" style="min-width: 0">
                  <div class="text-subtitle2 text-weight-medium ellipsis">{{ template.description }}</div>
                  <div class="text-caption text-grey-6">{{ template.category || 'Sem categoria' }}</div>
                  <div class="text-h6 text-weight-bold text-negative q-mt-xs">{{ formatMoney(template.amount) }}</div>
                  <div v-if="template.payment_method" class="text-caption text-grey-5">{{ template.payment_method }}</div>
                </div>
                <div class="column q-gutter-xs q-ml-sm flex-shrink-0">
                  <q-btn flat dense round icon="edit" color="grey-7" size="sm" @click="openEditModal(template)" />
                  <q-btn flat dense round icon="delete" color="negative" size="sm" @click="openDeleteDialog(template)" />
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions>
              <q-btn
                flat
                no-caps
                icon="add_task"
                color="primary"
                label="Lançar este mês"
                :loading="launching[template.id]"
                @click="launchThisMonth(template)"
              />
            </q-card-actions>
          </q-card>
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

onMounted(() => {
  if (!finance.expenses.length) {
    finance.loadData()
  }
})
</script>

<style scoped>
.page-recurring {
  padding: 24px 20px;
}

.template-card {
  background: #fff;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
</style>
