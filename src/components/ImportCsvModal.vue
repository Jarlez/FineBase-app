<template>
  <q-dialog v-model="open" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="import-modal">
      <!-- Header -->
      <q-card-section class="row items-center modal-head">
        <q-icon name="upload_file" size="18px" class="q-mr-sm" style="color: var(--accent)" />
        <div class="modal-title">Importar CSV do Nubank</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="handleClose" />
      </q-card-section>

      <!-- Upload area (fase 1: sem arquivo) -->
      <template v-if="!parsedRows.length">
        <q-card-section class="column flex-center q-pa-xl" style="min-height: 60vh">
          <div
            class="upload-dropzone column flex-center q-pa-xl rounded-borders"
            :class="{ 'upload-dropzone--active': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <q-icon name="upload_file" size="56px" color="grey-4" class="q-mb-md" />
            <p class="text-body1 text-grey-6 q-mb-xs">Arraste o arquivo CSV aqui</p>
            <p class="text-body2 text-grey-5 q-mb-lg">ou clique para selecionar</p>
            <q-btn
              label="Selecionar arquivo"
              color="primary"
              unelevated
              rounded
              no-caps
              icon="folder_open"
              @click="$refs.fileInput.click()"
            />
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden-input"
              @change="onFileInputChange"
            />
          </div>

          <div class="q-mt-xl text-center">
            <p class="text-caption text-grey-5 q-mb-xs">Como exportar do Nubank:</p>
            <p class="text-caption text-grey-6">
              Nubank → Cartão de Crédito → Acessar fatura → Exportar → Exportar CSV
            </p>
          </div>

          <q-banner v-if="parseError" class="bg-negative text-white q-mt-md rounded-borders" dense>
            <template #avatar><q-icon name="error" /></template>
            {{ parseError }}
          </q-banner>
        </q-card-section>
      </template>

      <!-- Preview (fase 2: arquivo carregado) -->
      <template v-else>
        <q-card-section class="q-py-sm bg-grey-1 row items-center q-gutter-sm">
          <q-chip color="positive" text-color="white" icon="check_circle" dense>
            {{ selectedRows.length }} selecionados para importar
          </q-chip>
          <q-chip v-if="skippedRows.length" color="grey-5" text-color="white" icon="block" dense>
            {{ skippedRows.length }} pagamentos ignorados
          </q-chip>
          <q-chip v-if="duplicateCount" color="warning" text-color="white" icon="warning" dense>
            {{ duplicateCount }} possíveis duplicatas
          </q-chip>
          <q-space />
          <q-btn flat no-caps dense icon="upload_file" color="grey-7" label="Trocar arquivo" @click="resetFile" />
        </q-card-section>

        <q-card-section class="q-pa-none" style="flex: 1; overflow: auto">
          <q-table
            :rows="expenseRows"
            :columns="previewColumns"
            row-key="_id"
            flat
            dense
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <!-- Checkbox de seleção -->
            <template #header-cell-selected="props">
              <q-th :props="props">
                <q-checkbox
                  :model-value="allSelected"
                  :indeterminate="someSelected"
                  color="white"
                  @update:model-value="toggleAll"
                />
              </q-th>
            </template>
            <template #body-cell-selected="props">
              <q-td :props="props">
                <q-checkbox v-model="props.row.selected" color="primary" />
              </q-td>
            </template>

            <!-- Data -->
            <template #body-cell-date="props">
              <q-td :props="props">{{ formatDateBR(props.row.date) }}</q-td>
            </template>

            <!-- Descrição editável -->
            <template #body-cell-description="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <q-input
                    v-model="props.row.description"
                    dense
                    borderless
                    style="min-width: 180px"
                    :input-style="props.row.isDuplicate ? 'color: #9e9e9e' : ''"
                  />
                  <q-badge
                    v-if="props.row.isDuplicate"
                    color="grey-4"
                    text-color="grey-7"
                    label="Já existe"
                    class="q-ml-xs"
                    style="flex-shrink: 0; font-size: 10px"
                  />
                </div>
              </q-td>
            </template>

            <!-- Categoria editável -->
            <template #body-cell-category="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.category"
                  :options="categoryOptions"
                  dense
                  borderless
                  emit-value
                  map-options
                  style="min-width: 160px"
                >
                  <template #prepend>
                    <q-icon
                      :name="props.row.category ? 'label' : 'label_off'"
                      :color="props.row.category ? 'primary' : 'grey-4'"
                      size="16px"
                    />
                  </template>
                </q-select>
              </q-td>
            </template>

            <!-- Parcelas (detectadas do título) -->
            <template #body-cell-installments="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  v-if="props.row.expense_type === 'parcelado'"
                  color="accent"
                  :label="`${props.row.installments}x`"
                />
                <span v-else class="text-grey-4">–</span>
              </q-td>
            </template>

            <!-- Valor -->
            <template #body-cell-amount="props">
              <q-td :props="props" class="text-right text-negative text-weight-medium">
                {{ formatCurrency(props.row.amount) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <!-- Footer de ação -->
        <q-card-section class="row items-center justify-between q-py-md bg-white shadow-up-1">
          <div class="text-body2 text-grey-6">
            <span v-if="selectedRows.length">
              Total selecionado: <strong class="text-negative">{{ formatCurrency(selectedTotal) }}</strong>
            </span>
            <span v-else class="text-warning">Nenhum item selecionado</span>
          </div>
          <div class="row q-gutter-sm">
            <q-btn flat no-caps rounded label="Cancelar" @click="handleClose" />
            <q-btn
              unelevated
              no-caps
              rounded
              color="primary"
              icon="download_done"
              :label="`Importar ${selectedRows.length} gasto${selectedRows.length !== 1 ? 's' : ''}`"
              :disable="!selectedRows.length"
              :loading="importing"
              @click="doImport"
            />
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>

  <!-- Confirmação de duplicatas -->
  <q-dialog v-model="confirmDuplicateDialog" persistent>
    <q-card style="min-width: 420px; max-width: 520px">
      <q-card-section class="row items-center q-pb-sm">
        <q-icon name="warning" color="warning" size="28px" class="q-mr-md" />
        <div>
          <div class="text-h6">Possíveis duplicatas</div>
          <div class="text-body2 text-grey-6">
            {{ selectedDuplicates.length }} item{{ selectedDuplicates.length !== 1 ? 's' : '' }} selecionado{{ selectedDuplicates.length !== 1 ? 's' : '' }} já exist{{ selectedDuplicates.length !== 1 ? 'em' : 'e' }} na base.
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p class="text-body2 q-mb-sm">Deseja importar mesmo assim?</p>
        <q-list dense bordered separator class="rounded-borders" style="max-height: 260px; overflow-y: auto">
          <q-item v-for="row in selectedDuplicates" :key="row._id" dense class="q-py-xs">
            <q-item-section>
              <q-item-label lines="1">{{ row.description }}</q-item-label>
              <q-item-label caption>{{ formatDateBR(row.date) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-negative text-weight-medium text-body2">{{ formatCurrency(row.amount) }}</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat no-caps rounded label="Cancelar" v-close-popup />
        <q-btn unelevated no-caps rounded color="warning" icon="warning" label="Importar mesmo assim" @click="confirmAndImport" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceStore } from '../stores/financeStore'
import { formatDateBR } from '../utils/formatDate'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'imported'])

const $q = useQuasar()
const finance = useFinanceStore()

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const fileInput = ref(null)
const isDragging = ref(false)
const parseError = ref(null)
const parsedRows = ref([])
const importing = ref(false)
const confirmDuplicateDialog = ref(false)

// Apenas registros com amount > 0 (gastos reais)
const expenseRows = computed(() => parsedRows.value.filter(r => r.amount > 0))
// Registros negativos (pagamentos de fatura)
const skippedRows = computed(() => parsedRows.value.filter(r => r.amount <= 0))

const selectedRows = computed(() => expenseRows.value.filter(r => r.selected))
const selectedTotal = computed(() => selectedRows.value.reduce((s, r) => s + r.amount, 0))

const allSelected = computed(() => expenseRows.value.length > 0 && expenseRows.value.every(r => r.selected))
const someSelected = computed(() => !allSelected.value && expenseRows.value.some(r => r.selected))

const duplicateCount = computed(() => expenseRows.value.filter(r => r.isDuplicate).length)
const selectedDuplicates = computed(() => selectedRows.value.filter(r => r.isDuplicate))

const categoryOptions = [
  { label: '— Sem categoria —', value: '' },
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

const previewColumns = [
  { name: 'selected', label: '', field: 'selected', align: 'center', style: 'width: 40px' },
  { name: 'date', label: 'Data', field: 'date', align: 'left' },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
  { name: 'category', label: 'Categoria', field: 'category', align: 'left' },
  { name: 'installments', label: 'Parcelas', field: 'installments', align: 'center' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'right' },
]

// Regras de categorização automática por palavra-chave
function suggestCategory(title) {
  const t = title.toLowerCase()
  if (/supermercado|diniz|cariri|atacad[aã]o|mercadinho|mart|hortifruti/.test(t)) return 'Supermercado'
  if (/uber|99pop|99|taxi|t[aá]xi|gasolina|combust[ií]vel|posto|shell|ipiranga|br avia/.test(t)) return 'Transporte'
  if (/ifood|ifd\*|delivery|pizza|hamburguer|burger|lanche|restaurante|sushi|jap[oô]n/.test(t)) return 'Delivery'
  if (/google|youtube|netflix|spotify|amazon.*prime|disney|hbo|paramount|apple|xbox|deezer|assinatura|membership/.test(t)) return 'Assinaturas'
  if (/farm[aá]cia|pague menos|drogasil|ultrafarma|ultramed|drogaria|rem[eé]dio/.test(t)) return 'Saúde'
  if (/mercado livre|shopee|amazon|magazine|americanas|shein|aliexpress|wish/.test(t)) return 'Compras'
  if (/escola|faculdade|curso|udemy|alura|livro|livraria|educação|ensino/.test(t)) return 'Educação'
  if (/luz|[aá]gua|internet|telefone|aluguel|condom[ií]nio|energia|enel|sabesp|cedae/.test(t)) return 'Casa'
  if (/empr[eé]stimo|parcela|financiamento/.test(t)) return 'Empréstimos'
  return ''
}

// Detecta parcelas no título: "Parcela 4/12" → extrai parcela atual E total
function parseInstallments(title) {
  const m = title.match(/parcela\s+(\d+)\/(\d+)/i) || title.match(/\s(\d+)\/(\d+)\s*$/)
  if (!m) return { expense_type: 'variavel', installments: null, current_installment: null }
  return {
    expense_type: 'parcelado',
    installments: parseInt(m[2], 10),
    current_installment: parseInt(m[1], 10),
  }
}

// Calcula a data real da parcela N, dado que a parcela currentN foi cobrada em csvDateStr.
// Preserva o dia do mês; ajusta para o último dia se o mês destino for menor (ex: dia 29 em fev → 28).
function calcInstallmentDate(csvDateStr, currentN, targetN) {
  const [year, month, day] = csvDateStr.split('-').map(Number)
  const monthOffset = targetN - currentN
  // Primeiro dia do mês alvo para obter ano/mês corretos sem rollover de dia
  const anchor = new Date(year, month - 1 + monthOffset, 1)
  const targetYear = anchor.getFullYear()
  const targetMonth = anchor.getMonth()
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate()
  const safeDay = Math.min(day, lastDay)
  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`
}

function parseCSV(text) {
  const clean = text.replace(/^﻿/, '') // remove BOM
  const lines = clean.trim().split('\n')
  if (lines.length < 2) throw new Error('Arquivo sem dados. Verifique se é um CSV válido do Nubank.')

  const header = lines[0].toLowerCase()
  if (!header.includes('date') && !header.includes('title') && !header.includes('amount')) {
    throw new Error('Formato não reconhecido. O arquivo deve ter as colunas date, title e amount.')
  }

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parser simples respeitando aspas
    const parts = []
    let current = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes }
      else if (ch === ',' && !inQuotes) { parts.push(current.trim()); current = '' }
      else { current += ch }
    }
    parts.push(current.trim())

    if (parts.length < 3) continue

    const date = parts[0].replace(/"/g, '')
    const title = parts[1].replace(/"/g, '')
    const amount = parseFloat(parts[2].replace(/"/g, '').replace(',', '.'))

    if (!date || !title || isNaN(amount)) continue

    const { expense_type, installments, current_installment } = parseInstallments(title)

    if (expense_type === 'parcelado' && current_installment && installments) {
      // Gera um registro por parcela já ocorrida (1 até current_installment)
      for (let n = 1; n <= current_installment; n++) {
        const installDate = calcInstallmentDate(date, current_installment, n)
        const installDesc = title.replace(/parcela\s+\d+\/\d+/i, `Parcela ${n}/${installments}`)
        rows.push({
          _id: `${date}-${title}-${amount}-${i}-${n}`,
          date: installDate,
          description: installDesc,
          category: suggestCategory(title),
          amount: Math.abs(amount),
          originalAmount: amount,
          expense_type,
          installments,
          current_installment: n,
          payment_method: 'credito',
          location: '',
          selected: amount > 0,
          isDuplicate: false,
        })
      }
    } else {
      rows.push({
        _id: `${date}-${title}-${amount}-${i}`,
        date,
        description: title,
        category: suggestCategory(title),
        amount: Math.abs(amount),
        originalAmount: amount,
        expense_type,
        installments,
        current_installment,
        payment_method: 'credito',
        location: '',
        selected: amount > 0,
        isDuplicate: false,
      })
    }
  }

  if (!rows.length) throw new Error('Nenhuma transação encontrada no arquivo.')
  return rows
}

function processFile(file) {
  parseError.value = null
  if (!file || !file.name.endsWith('.csv')) {
    parseError.value = 'Selecione um arquivo .csv válido.'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const rows = parseCSV(e.target.result)
      rows.forEach((row) => {
        if (row.amount > 0) {
          const isDuplicate = row.expense_type === 'parcelado'
            // Parcelados: descrição inclui "Parcela X/Y", que é única por compra+parcela
            ? finance.expenses.some(
                (exp) => exp.description === row.description && Number(exp.amount) === row.amount
              )
            // Outros gastos: data + valor (comportamento original)
            : finance.expenses.some(
                (exp) => exp.date === row.date && Number(exp.amount) === row.amount
              )
          if (isDuplicate) {
            row.isDuplicate = true
            row.selected = false
          }
        }
      })
      parsedRows.value = rows
    } catch (err) {
      parseError.value = err.message
    }
  }
  reader.readAsText(file, 'UTF-8')
}

function onFileInputChange(e) {
  processFile(e.target.files[0])
}

function onDrop(e) {
  isDragging.value = false
  processFile(e.dataTransfer.files[0])
}

function resetFile() {
  parsedRows.value = []
  parseError.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function toggleAll(val) {
  expenseRows.value.forEach(r => (r.selected = val))
}

function handleClose() {
  resetFile()
  open.value = false
}

async function doImport() {
  if (selectedDuplicates.value.length > 0) {
    confirmDuplicateDialog.value = true
    return
  }
  await runImport()
}

async function confirmAndImport() {
  confirmDuplicateDialog.value = false
  await runImport()
}

async function runImport() {
  importing.value = true
  let success = 0
  let errors = 0

  for (const row of selectedRows.value) {
    try {
      await finance.addExpense({
        date: row.date,
        description: row.description,
        category: row.category || null,
        location: row.location || null,
        payment_method: row.payment_method,
        amount: row.amount,
        expense_type: row.expense_type,
        installments: row.installments,
      })
      success++
    } catch {
      errors++
    }
  }

  importing.value = false

  if (errors === 0) {
    $q.notify({ type: 'positive', message: `${success} gasto${success !== 1 ? 's' : ''} importado${success !== 1 ? 's' : ''} com sucesso!` })
    emit('imported', success)
    handleClose()
  } else {
    $q.notify({ type: 'warning', message: `${success} importados, ${errors} com erro.` })
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<style scoped>
.import-modal {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.upload-dropzone {
  border: 2px dashed #cbd5e1;
  min-width: 400px;
  max-width: 600px;
  width: 100%;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.upload-dropzone--active {
  border-color: var(--q-primary);
  background: rgba(37, 99, 235, 0.04);
}

.hidden-input {
  display: none;
}

.shadow-up-1 {
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.06);
}
</style>
