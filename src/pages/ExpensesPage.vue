<template>
  <q-page class="page-expenses">
    <div class="row justify-between">
      <div class="page-expenses__header column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Gastos</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Registre e gerencie seus gastos
        </p>
      </div>
      <div class="q-pt-sm">
        <q-btn
          label="Adicionar gasto"
          no-caps
          unelevated
          icon="add"
          rounded
          color="primary"
          @click="openFormModal"
        />
      </div>
    </div>
    <q-dialog v-model="formModalOpen" persistent>
      <q-card
        class="rounded-borders"
        style="min-width: 450px; max-width: 500px"
      >
        <q-card-section class="row items-center q-py-sm bg-primary">
          <div class="text-h6 text-white">
            {{ isEditing ? "Editar gasto" : "Adicionar gasto" }}
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
                  :rules="[(val) => !!val || 'Informe a data']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.location"
                  label="Local do gasto"
                  dense
                  outlined
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
                  hide-bottom-space
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.description"
                  label="Descrição"
                  dense
                  outlined
                  :rules="[(val) => !!val || 'Informe a descrição']"
                />
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
                  :rules="[
                    (val) => val > 0 || 'Informe um valor maior que zero',
                  ]"
                />
              </div>

              <div class="col-12 col-md-6 q-pb-lg">
                <q-select
                  v-model="form.expense_type"
                  :options="expenseTypes"
                  label="Tipo de gasto"
                  dense
                  outlined
                  emit-value
                  map-options
                />
              </div>

              <div
                v-if="form.expense_type === 'parcelado'"
                class="col-12 col-md-6"
              >
                <q-input
                  v-model.number="form.installments"
                  label="Parcelas"
                  type="number"
                  dense
                  outlined
                  :rules="[(val) => val > 0 || 'Informe o número de parcelas']"
                />
              </div>
            </div>

            <div class="row items-center justify-end q-mt-md">
              <q-btn
                :label="isEditing ? 'Salvar alterações' : 'Adicionar Gasto'"
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
      :category-options="categoryOptions"
      category-label="Categoria"
      default-preset="this_month"
      @update:date-range="filterDateRange = $event"
      @update:category="filterCategory = $event"
      @update:preset="filterPreset = $event"
    />

    <div class="row q-col-gutter-md q-mb-md stat-cards">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--expense">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="receipt_long" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Total no Período</span>
              <span class="stat-card__value stat-card__value--expense">
                {{ totalInPeriodFormatted }}
              </span>
              <span class="stat-card__subtext">
                {{ totalPeriodSubtext }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
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
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--top">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="pie_chart" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label">Maior Categoria</span>
              <span class="stat-card__top-category">
                {{ topCategoryName }}
              </span>
              <span class="stat-card__subtext">
                {{ topCategorySubtext }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card stat-card--payment">
          <q-card-section class="stat-card__content">
            <div class="stat-card__icon">
              <q-icon name="credit_card" size="28px" />
            </div>
            <div class="stat-card__body">
              <span class="stat-card__label"
                >Forma de pagamento mais usada</span
              >
              <span class="stat-card__top-category">
                {{ mostUsedPaymentLabel }}
              </span>
              <span class="stat-card__subtext">
                Menos usada: {{ leastUsedPaymentLabel }}
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
      class="table-expenses"
      table-header-class="bg-primary text-white"
      card-class=" text-white"
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
      :rows="filteredExpenses"
      :columns="columns"
      :rows-per-page-options="[0]"
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
            @click="
              startEdit(props.row);
              formModalOpen = true;
            "
          />
          <q-btn
            flat
            round
            icon="delete"
            size="sm"
            color="negative"
            @click="removeExpense(props.row)"
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
          <div class="text-h6 text-white">Detalhes do gasto</div>
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
        <q-card-section v-if="selectedExpenseForDetails">
          <!-- VALOR EM DESTAQUE -->
          <div class="text-center q-mb-md">
            <div class="text-caption text-grey-6">Valor do gasto</div>
            <div class="text-h5 text-negative text-weight-bold">
              {{ formatCurrency(selectedExpenseForDetails.amount) }}
            </div>
          </div>

          <q-separator spaced />

          <!-- INFORMAÇÕES -->
          <div class="q-gutter-sm">
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Data</div>
              <div class="text-weight-medium">
                {{ formatDateBR(selectedExpenseForDetails.date) }}
              </div>
            </div>

            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Categoria</div>
              <div>{{ selectedExpenseForDetails.category || "–" }}</div>
            </div>

            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Descrição</div>
              <div>{{ selectedExpenseForDetails.description || "–" }}</div>
            </div>

            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Local</div>
              <div>{{ selectedExpenseForDetails.location || "–" }}</div>
            </div>
          </div>

          <q-separator spaced />

          <!-- PAGAMENTO -->
          <div class="q-gutter-sm">
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Forma de pagamento</div>
              <div>
                {{
                  paymentMethodLabel(selectedExpenseForDetails.payment_method)
                }}
              </div>
            </div>

            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Tipo</div>
              <div>
                {{ expenseTypeLabel(selectedExpenseForDetails.expense_type) }}
              </div>
            </div>

            <div
              v-if="
                selectedExpenseForDetails.expense_type === 'parcelado' &&
                selectedExpenseForDetails.installments
              "
              class="row justify-between items-center"
            >
              <div class="text-caption text-grey-7">Parcelas</div>
              <div>{{ selectedExpenseForDetails.installments }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useFinanceStore } from "../stores/financeStore";
import FilterCard from "../components/FilterCard.vue";
import { formatDateBR } from "../utils/formatDate";

const $q = useQuasar();
const finance = useFinanceStore();

function getDefaultDateRange() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(1); // primeiro dia do mês atual
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { start: toISO(start), end: toISO(today) };
}

const filterDateRange = ref(getDefaultDateRange());
const filterCategory = ref(null);
const filterPreset = ref("this_month");

const filteredExpenses = computed(() => {
  let list = finance.expenses;
  if (filterDateRange.value) {
    const { start, end } = filterDateRange.value;
    list = list.filter((item) => item.date >= start && item.date <= end);
  }
  if (filterCategory.value != null && filterCategory.value !== "") {
    list = list.filter((item) => item.category === filterCategory.value);
  }
  return list;
});

function daysBetween(startStr, endStr) {
  const a = new Date(startStr);
  const b = new Date(endStr);
  return Math.max(1, Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1);
}

const totalInPeriod = computed(() =>
  filteredExpenses.value.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )
);

const daysInPeriod = computed(() => {
  if (!filterDateRange.value) return 1;
  return daysBetween(filterDateRange.value.start, filterDateRange.value.end);
});

const totalInPeriodFormatted = computed(() =>
  formatCurrency(totalInPeriod.value)
);

const averageDaily = computed(() =>
  daysInPeriod.value > 0 ? totalInPeriod.value / daysInPeriod.value : 0
);

const averageDailyFormatted = computed(() =>
  formatCurrency(averageDaily.value)
);

const topCategoryData = computed(() => {
  const list = filteredExpenses.value;
  if (!list.length) return null;
  const byCategory = {};
  list.forEach((item) => {
    const cat = item.category || "Outros";
    byCategory[cat] = (byCategory[cat] || 0) + Number(item.amount || 0);
  });
  const total = totalInPeriod.value;
  let maxAmount = 0;
  let maxCategory = null;
  Object.entries(byCategory).forEach(([cat, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      maxCategory = cat;
    }
  });
  if (!maxCategory || total <= 0) return null;
  const pct = Math.round((maxAmount / total) * 100);
  return { name: maxCategory, amount: maxAmount, percent: pct };
});

const topCategoryName = computed(() => topCategoryData.value?.name ?? "–");
const topCategorySubtext = computed(() => {
  const d = topCategoryData.value;
  if (!d) return "";
  return `${formatCurrency(d.amount)} (${d.percent}% do total)`;
});

const mostUsedPayment = computed(() => {
  const list = filteredExpenses.value;
  if (!list.length) return null;
  const count = {};
  list.forEach((item) => {
    const pm = item.payment_method || "debito";
    count[pm] = (count[pm] || 0) + 1;
  });
  let maxCount = 0;
  let maxKey = null;
  Object.entries(count).forEach(([key, c]) => {
    if (c > maxCount) {
      maxCount = c;
      maxKey = key;
    }
  });
  return maxKey;
});

const mostUsedPaymentLabel = computed(() => {
  const key = mostUsedPayment.value;
  if (!key) return "–";
  const found = paymentMethods.find((m) => m.value === key);
  return found ? found.label : key;
});

const lastMonthComparison = computed(() => {
  if (filterPreset.value !== "this_month" || !filterDateRange.value)
    return null;
  const now = new Date();
  const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const startLast = toISO(firstLastMonth);
  const endLast = toISO(lastLastMonth);
  const lastMonthExpenses = finance.expenses.filter(
    (item) => item.date >= startLast && item.date <= endLast
  );
  const lastMonthTotal = lastMonthExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const current = totalInPeriod.value;
  if (lastMonthTotal === 0) {
    return { total: 0, percent: current > 0 ? 100 : 0 };
  }
  const percent = Math.round(
    ((current - lastMonthTotal) / lastMonthTotal) * 100
  );
  return { total: lastMonthTotal, percent };
});

const totalPeriodSubtext = computed(() => {
  const comp = lastMonthComparison.value;
  if (filterPreset.value !== "this_month" || comp === null) {
    return "Baseado no filtro selecionado";
  }
  const signal = comp.percent >= 0 ? "🔺 +" : "🔻 ";
  return `${signal}${comp.percent}% · Mês passado: ${formatCurrency(
    comp.total
  )}`;
});

const lastMonthAverageDaily = computed(() => {
  const comp = lastMonthComparison.value;
  if (comp === null) return null;
  const now = new Date();
  const daysInLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0
  ).getDate();
  return daysInLastMonth > 0 ? comp.total / daysInLastMonth : 0;
});

const averageDailySubtext = computed(() => {
  const avg = lastMonthAverageDaily.value;
  if (avg === null || filterPreset.value !== "this_month") {
    return "Baseado no filtro selecionado";
  }
  return `vs mês passado: ${formatCurrency(avg)}`;
});

const leastUsedPayment = computed(() => {
  const list = filteredExpenses.value;
  if (!list.length) return null;
  const count = {};
  list.forEach((item) => {
    const pm = item.payment_method || "debito";
    count[pm] = (count[pm] || 0) + 1;
  });
  const keys = Object.keys(count);
  if (keys.length === 0) return null;
  let minCount = Infinity;
  let minKey = null;
  keys.forEach((key) => {
    if (count[key] < minCount) {
      minCount = count[key];
      minKey = key;
    }
  });
  return minKey;
});

const leastUsedPaymentLabel = computed(() => {
  const key = leastUsedPayment.value;
  if (!key) return "–";
  const found = paymentMethods.find((m) => m.value === key);
  return found ? found.label : key;
});

const paymentMethods = [
  { label: "Débito", value: "debito" },
  { label: "Crédito", value: "credito" },
  { label: "Pix", value: "pix" },
  { label: "Dinheiro", value: "dinheiro" },
];

const categoryOptions = [
  { label: "Assinaturas", value: "Assinaturas" },
  { label: "Casa", value: "Casa" },
  { label: "Compras", value: "Compras" },
  { label: "Delivery", value: "Delivery" },
  { label: "Doações", value: "Doações" },
  { label: "Educação", value: "Educação" },
  { label: "Empréstimos", value: "Empréstimos" },
  { label: "Imprevistos", value: "Imprevistos" },
  { label: "Investimentos", value: "Investimentos" },
  { label: "Lazer", value: "Lazer" },
  { label: "Reserva de emergência", value: "Reserva de emergência" },
  { label: "Saúde", value: "Saúde" },
  { label: "Supermercado", value: "Supermercado" },
  { label: "Transporte", value: "Transporte" },
];

const expenseTypes = [
  { label: "Fixo", value: "fixo" },
  { label: "Variável", value: "variavel" },
  { label: "Parcelado", value: "parcelado" },
];

const columns = [
  {
    name: "date",
    label: "Data",
    field: "date",
    align: "left",
    format: (val) => formatDateBR(val),
  },
  { name: "category", label: "Categoria", field: "category", align: "left" },
  { name: "location", label: "Local", field: "location", align: "left" },
  {
    name: "payment_method",
    label: "Forma de pagamento",
    field: "payment_method",
    align: "left",
  },
  {
    name: "amount",
    label: "Valor",
    field: "amount",
    align: "right",
    format: (val) => formatCurrency(val),
  },
  { name: "detalhes", label: "Detalhes", field: "detalhes", align: "center" },
  { name: "actions", label: "Ações", field: "actions", align: "center" },
];

const emptyForm = () => ({
  id: null,
  date: "",
  description: "",
  category: "",
  location: "",
  payment_method: "debito",
  amount: null,
  expense_type: "variavel",
  installments: null,
});

const form = reactive(emptyForm());
const editingId = ref(null);
const formModalOpen = ref(false);
const detailsModalOpen = ref(false);
const selectedExpenseForDetails = ref(null);

const isEditing = computed(() => editingId.value !== null);

const paymentMethodLabel = (value) =>
  paymentMethods.find((m) => m.value === value)?.label ?? value ?? "–";
const expenseTypeLabel = (value) =>
  expenseTypes.find((t) => t.value === value)?.label ?? value ?? "–";

const openDetailsModal = (row) => {
  selectedExpenseForDetails.value = row;
  detailsModalOpen.value = true;
};

function openFormModal() {
  onReset();
  formModalOpen.value = true;
}

function onModalClose() {
  onReset();
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function onReset() {
  Object.assign(form, emptyForm());
  editingId.value = null;
}

async function onSubmit() {
  const payload = {
    date: form.date,
    description: form.description,
    category: form.category,
    location: form.location,
    payment_method: form.payment_method,
    amount: Number(form.amount),
    expense_type: form.expense_type,
    installments:
      form.expense_type === "parcelado" ? Number(form.installments || 0) : null,
  };

  try {
    if (isEditing.value && editingId.value) {
      await finance.editExpense(editingId.value, payload);
      $q.notify({
        type: "positive",
        message: "Gasto atualizado com sucesso!",
      });
    } else {
      await finance.addExpense(payload);
      $q.notify({
        type: "positive",
        message: "Gasto adicionado com sucesso!",
      });
    }
    onReset();
    formModalOpen.value = false;
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "Erro ao salvar gasto.",
    });
  }
}

function startEdit(row) {
  editingId.value = row.id;
  Object.assign(form, {
    id: row.id,
    date: row.date || "",
    description: row.description || "",
    category: row.category || "",
    location: row.location || "",
    payment_method: row.payment_method || "debito",
    amount: row.amount,
    expense_type: row.expense_type || "variavel",
    installments: row.installments,
  });
}

function cancelEdit() {
  onReset();
  formModalOpen.value = false;
}

async function removeExpense(row) {
  $q.dialog({
    title: "Excluir gasto",
    message: "Tem certeza que deseja excluir este gasto?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await finance.removeExpense(row.id);
      $q.notify({
        type: "positive",
        message: "Gasto excluído com sucesso!",
      });
    } catch (error) {
      $q.notify({
        type: "negative",
        message: error.message || "Erro ao excluir gasto.",
      });
    }
  });
}

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData();
  }
});
</script>

<style scoped>
.page-expenses {
  padding: 24px 20px;
}

.page-card {
  background: #fff;
}

.page-card--error {
  background: #fef2f2;
}

/* Stat cards — mesmo estilo do dashboard */
.stat-cards {
  --stat-expense: #dc2626;
  --stat-daily: #0ea5e9;
  --stat-top: #7c3aed;
  --stat-payment: #059669;
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
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
}

.stat-card--daily .stat-card__icon {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
}

.stat-card--top .stat-card__icon {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.stat-card--payment .stat-card__icon {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

.stat-card--compare {
  background: #f8fafc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
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

.stat-card__value--expense {
  color: #dc2626;
}

.stat-card__value--daily {
  color: #0ea5e9;
}

.stat-card__value--positive {
  color: #059669;
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

.table-expenses {
  height: 54vh;
}
.table-expenses :deep(.q-table__middle) {
  overflow: auto;
  max-height: 54vh;
}

.table-expenses :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--q-primary) !important;
  color: white !important;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
}

/* Telas 1600x900 ou maiores */
@media screen and (max-width: 1600px) and (max-height: 900px) {
  .table-expenses {
    height: 42vh;
  }
  .table-expenses :deep(.q-table__middle) {
    max-height: 42vh;
  }
}

/* Telas menores que 1366x768 */
@media screen and (max-width: 1365px), screen and (max-height: 767px) {
  .table-expenses {
    height: 29vh;
  }
  .table-expenses :deep(.q-table__middle) {
    max-height: 29vh;
  }
}
</style>
