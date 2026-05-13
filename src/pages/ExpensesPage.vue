<template>
  <q-page class="page-expenses">
    <div class="row justify-between">
      <div class="page-expenses__header column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Gastos</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Registre e gerencie seus gastos
        </p>
      </div>
      <div class="q-pt-sm row q-gutter-sm items-start">
        <q-btn
          label="Importar CSV"
          no-caps
          unelevated
          icon="upload"
          rounded
          style="border: 1px solid var(--border)"
          class="bg-white text-secondary"
          @click="importModalOpen = true"
        />
        <q-btn
          label="Exportar CSV"
          no-caps
          unelevated
          icon="download"
          rounded
          style="border: 1px solid var(--border)"
          class="bg-white text-secondary"
          :disable="!filteredExpenses.length"
          @click="exportCSV"
        />
        <q-btn
          label="Adicionar gasto"
          no-caps
          unelevated
          icon="add"
          rounded
          class="bg-primary text-white"
          @click="openFormModal"
        />
      </div>
    </div>
    <ImportCsvModal v-model="importModalOpen" />

    <q-dialog v-model="formModalOpen" persistent>
      <q-card
        class="rounded-borders"
        style="min-width: 450px; max-width: 500px"
      >
        <q-card-section class="row items-center modal-head">
          <div class="modal-title">
            {{ isEditing ? "Editar gasto" : "Adicionar gasto" }}
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
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
                :loading="submitting"
                :disable="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div
      v-if="!isInitialLoading"
      class="row q-col-gutter-md q-mb-md stat-cards"
    >
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
                {{ topCategoryName  }}
              </span>
              <span class="stat-card__subtext">
                {{ topCategorySubtext }} do total
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
    <div class="row items-center q-mb-md">
      <FilterCard
        :category-options="categoryOptions"
        category-label="Categoria"
        default-preset="this_month"
        :extra-filters="extraFilters"
        @update:date-range="filterDateRange = $event"
        @update:category="filterCategory = $event"
        @update:preset="filterPreset = $event"
        @update:filter="onExtraFilterChange"
      />
      <q-space></q-space>
      <div class="text-body2 text-grey-7 q-ml-md">
        {{ filteredExpenses.length }} Lançamentos
      </div>
    </div>
    <!-- Skeleton de carregamento inicial -->
    <template v-if="isInitialLoading">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-3">
          <q-card flat class="stat-card">
            <q-card-section class="stat-card__content">
              <q-skeleton
                type="rect"
                width="48px"
                height="48px"
                style="border-radius: 12px; flex-shrink: 0"
              />
              <div class="stat-card__body">
                <q-skeleton type="text" width="60%" />
                <q-skeleton
                  type="text"
                  width="80%"
                  height="20px"
                  class="q-mt-xs"
                />
                <q-skeleton type="text" width="50%" class="q-mt-xs" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-skeleton type="rect" height="300px" style="border-radius: 12px" />
    </template>

    <q-table
      v-else
      class="table-expenses"
      row-key="id"
      virtual-scroll
      flat
      dense
      hide-pagination
      wrap-cells
      clickable
      :rows="filteredExpenses"
      :columns="columns"
      :rows-per-page-options="[0]"
    >
      <template #no-data>
        <div class="full-width column flex-center q-py-xl text-grey-5">
          <q-icon name="receipt_long" size="56px" color="grey-4" />
          <p class="text-body1 text-grey-6 q-mt-sm q-mb-xs">
            Nenhum gasto encontrado
          </p>
          <p class="text-body2 text-grey-5 q-ma-none">
            Ajuste os filtros ou adicione um novo gasto
          </p>
        </div>
      </template>
      <template #body-cell-detalhes="props">
        <q-td :props="props">
          <q-btn
            class="table-action-btn"
            flat
            round
            dense
            icon="info"
            color="grey-7"
            @click="openDetailsModal(props.row)"
          />
        </q-td>
      </template>
      <template #body-cell-category="props">
        <q-td :props="props">
          <div class="category-cell">
            <span
              class="category-dot"
              :style="{ backgroundColor: getCategoryColor(props.row.category) }"
            ></span>
            <span>{{ categoryLabel(props.row.category) }}</span>
          </div>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            class="table-action-btn q-mr-sm"
            flat
            round
            dense
            icon="edit"
            color="grey-7"
            :disable="deletingId === props.row.id"
            @click="
              startEdit(props.row);
              formModalOpen = true;
            "
          />
          <q-btn
            class="table-action-btn"
            flat
            round
            dense
            icon="delete"
            color="grey-7"
            :loading="deletingId === props.row.id"
            :disable="deletingId === props.row.id"
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
        <q-card-section class="row items-center modal-head">
          <div class="modal-title">Detalhes do gasto</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
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
import ImportCsvModal from "../components/ImportCsvModal.vue";
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
const filterExpenseType = ref(null);
const filterPaymentMethod = ref(null);

const extraFilters = [
  {
    key: "expense_type",
    label: "Tipo",
    options: [
      { label: "Fixo", value: "fixo" },
      { label: "Variável", value: "variavel" },
      { label: "Parcelado", value: "parcelado" },
    ],
  },
  {
    key: "payment_method",
    label: "Pagamento",
    options: [
      { label: "Débito", value: "debito" },
      { label: "Crédito", value: "credito" },
      { label: "Pix", value: "pix" },
      { label: "Dinheiro", value: "dinheiro" },
    ],
  },
];

function onExtraFilterChange({ key, value }) {
  if (key === "expense_type") filterExpenseType.value = value;
  if (key === "payment_method") filterPaymentMethod.value = value;
}

const filteredExpenses = computed(() => {
  let list = finance.expenses;
  if (filterDateRange.value) {
    const { start, end } = filterDateRange.value;
    list = list.filter((item) => item.date >= start && item.date <= end);
  }
  if (filterCategory.value != null && filterCategory.value !== "") {
    list = list.filter((item) => item.category === filterCategory.value);
  }
  if (filterExpenseType.value != null) {
    list = list.filter((item) => item.expense_type === filterExpenseType.value);
  }
  if (filterPaymentMethod.value != null) {
    list = list.filter(
      (item) => item.payment_method === filterPaymentMethod.value
    );
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
  return `${formatCurrency(d.amount)} (${d.percent}%)`;
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
  const signal = comp.percent >= 0 ? "+ " : "- ";
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

const categoryColorMap = {
  Assinaturas: "#8d6e63",
  Casa: "#ef5350",
  Compras: "#5c6bc0",
  Delivery: "#ff7043",
  Doações: "#26a69a",
  Educação: "#42a5f5",
  Empréstimos: "#ab47bc",
  Imprevistos: "#ef9a9a",
  Investimentos: "#66bb6a",
  Lazer: "#26c6da",
  "Reserva de emergência": "#fbc02d",
  Saúde: "#ba68c8",
  Supermercado: "#7cb342",
  Transporte: "#fb8c00",
};

const columns = [
  {
    name: "date",
    label: "Data",
    field: "date",
    align: "left",
    format: (val) => formatDateBR(val),
  },
  { name: "category", label: "Categoria", field: "category", align: "left" },
  {
    name: "payment_method",
    label: "Forma de pagamento",
    field: "payment_method",
    align: "left",
    format: (val) => paymentMethodLabel(val),
  },
  {
    name: "expense_type",
    label: "Tipo",
    field: "expense_type",
    align: "left",
    format: (val, row) => {
      if (val === "parcelado" && row.installments) {
        const match = row.description?.match(/parcela\s+(\d+)\/(\d+)/i);
        if (match) return `Parcelado ${match[1]}/${match[2]}`;
        const start = new Date(row.date + "T00:00:00");
        const today = new Date();
        const diff =
          (today.getFullYear() - start.getFullYear()) * 12 +
          (today.getMonth() - start.getMonth()) +
          1;
        const current = Math.min(Math.max(1, diff), row.installments);
        return `Parcelado ${current}/${row.installments}`;
      }
      return expenseTypeLabel(val);
    },
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

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyForm = () => ({
  id: null,
  date: getTodayDate(),
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
const submitting = ref(false);
const deletingId = ref(null);

const isEditing = computed(() => editingId.value !== null);
const isInitialLoading = computed(
  () => finance.loading && finance.expenses.length === 0
);
const importModalOpen = ref(false);

const paymentMethodLabel = (value) =>
  paymentMethods.find((m) => m.value === value)?.label ?? value ?? "–";
const expenseTypeLabel = (value) =>
  expenseTypes.find((t) => t.value === value)?.label ?? value ?? "–";
const categoryLabel = (value) => value || "Sem categoria";
const getCategoryColor = (category) => categoryColorMap[category] || "#94a3b8";

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
  if (submitting.value) return;
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

  submitting.value = true;
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
  } finally {
    submitting.value = false;
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
    deletingId.value = row.id;
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
    } finally {
      deletingId.value = null;
    }
  });
}

function exportCSV() {
  const headers = [
    "Data",
    "Descrição",
    "Categoria",
    "Local",
    "Forma de Pagamento",
    "Tipo",
    "Parcelas",
    "Valor",
  ];
  const rows = filteredExpenses.value.map((item) => [
    formatDateBR(item.date),
    item.description || "",
    item.category || "",
    item.location || "",
    paymentMethodLabel(item.payment_method),
    expenseTypeLabel(item.expense_type),
    item.installments || "",
    String(Number(item.amount || 0)).replace(".", ","),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    )
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gastos_${filterDateRange.value?.start ?? "todos"}_${
    filterDateRange.value?.end ?? ""
  }.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  if (!finance.expenses.length || !finance.incomes.length) {
    finance.loadData();
  }
});
</script>

<style scoped>
.page-expenses {
  padding: 20px 24px;
}

.page-card {
  background: var(--surface);
}
.page-card--error {
  background: var(--neg-soft);
  border-color: var(--neg) !important;
}

/* ── Stat cards ─────────────────────────────────────────── */
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-card__content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
}
.stat-card__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-soft);
  color: var(--text-2);
}

.stat-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-3);
}
.stat-card__value {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: var(--letter-tighter);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--text);
  line-height: 1.2;
}
/* .stat-card__value--expense {
  color: var(--neg);
} */
.stat-card__value--daily {
  color: var(--text);
}
.stat-card__value--positive {
  color: var(--pos);
}
.stat-card__top-category {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.stat-card__subtext {
  font-size: 12px;
  color: var(--text-4);
}

/* ── Table ──────────────────────────────────────────────── */
.table-expenses {
  height: 60vh;
}
.table-expenses :deep(.q-table__middle) {
  overflow: auto;
  max-height: 60vh;
}
.table-expenses :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface) !important;
  color: var(--text-3) !important;
  border-bottom: 1px solid var(--border) !important;
}
.category-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}
.table-action-btn {
  min-width: 30px;
  min-height: 30px;
}
.table-action-btn :deep(.q-icon) {
  font-size: 18px !important;
}

@media screen and (max-width: 1600px) and (max-height: 900px) {
  .table-expenses {
    height: 52vh;
  }
  .table-expenses :deep(.q-table__middle) {
    max-height: 52vh;
  }
}
@media screen and (max-width: 1365px), screen and (max-height: 767px) {
  .table-expenses {
    height: 42vh;
  }
  .table-expenses :deep(.q-table__middle) {
    max-height: 42vh;
  }
}
</style>
