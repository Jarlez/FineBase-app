<template>
  <q-page class="page-incomes">
    <div class="row justify-between">
      <div class="page-expenses__header column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Entradas</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Registre e gerencie suas entradas
        </p>
      </div>
      <div class="q-pt-sm">
        <q-btn
          label="Adicionar entrada"
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
        <q-card-section class="row items-center modal-head">
          <div class="modal-title">
            {{ isEditing ? "Editar entrada" : "Adicionar entrada" }}
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
                  v-model="form.description"
                  label="Descrição"
                  dense
                  outlined
                  :rules="[(val) => !!val || 'Informe a descrição']"
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
                  :rules="[
                    (val) => val > 0 || 'Informe um valor maior que zero',
                  ]"
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

    <div
      v-if="!isInitialLoading"
      class="row q-col-gutter-md q-mb-md stat-cards"
    >
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
    <FilterCard
      class="q-mb-md"
      :category-options="incomeSourceOptions"
      category-label="Fonte da entrada"
      default-preset="this_month"
      @update:date-range="filterDateRange = $event"
      @update:category="filterCategory = $event"
      @update:preset="filterPreset = $event"
    />
    <q-card
      v-if="finance.error"
      flat
      class="page-card page-card--error rounded-borders q-mb-md"
    >
      <q-card-section class="text-negative">
        {{ finance.error }}
      </q-card-section>
    </q-card>

    <!-- Skeleton de carregamento inicial -->
    <template v-if="isInitialLoading">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
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
      class="table-incomes"
      row-key="id"
      virtual-scroll
      bordered
      style="border-radius: 12px"
      flat
      dense
      hide-pagination
      wrap-cells
      clickable
      :rows="filteredIncomes"
      :columns="columns"
      :rows-per-page-options="[0]"
    >
      <template #no-data>
        <div class="full-width column flex-center q-py-xl text-grey-5">
          <q-icon name="savings" size="56px" color="grey-4" />
          <p class="text-body1 text-grey-6 q-mt-sm q-mb-xs">
            Nenhuma entrada encontrada
          </p>
          <p class="text-body2 text-grey-5 q-ma-none">
            Ajuste os filtros ou adicione uma nova entrada
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
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            class="table-action-btn q-mr-sm"
            flat
            round
            dense
            icon="edit"
            color="grey-7"
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
        <q-card-section class="row items-center modal-head">
          <div class="modal-title">Detalhes da entrada</div>
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
              <div>{{ selectedIncomeForDetails.description || "–" }}</div>
            </div>
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">Fonte</div>
              <div>{{ selectedIncomeForDetails.source || "–" }}</div>
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

const getDefaultDateRange = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(1);
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { start: toISO(start), end: toISO(today) };
};

const filterDateRange = ref(getDefaultDateRange());
const filterCategory = ref(null);
const filterPreset = ref("this_month");

const filteredIncomes = computed(() => {
  let list = finance.incomes;
  if (filterDateRange.value) {
    const { start, end } = filterDateRange.value;
    list = list.filter((item) => item.date >= start && item.date <= end);
  }
  if (filterCategory.value != null && filterCategory.value !== "") {
    list = list.filter((item) => item.source === filterCategory.value);
  }
  return list;
});

const daysBetween = (startStr, endStr) => {
  const a = new Date(startStr);
  const b = new Date(endStr);
  return Math.max(1, Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1);
};

const totalInPeriod = computed(() =>
  filteredIncomes.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
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

const topSourceData = computed(() => {
  const list = filteredIncomes.value;
  if (!list.length) return null;
  const bySource = {};
  list.forEach((item) => {
    const src = item.source || "Outros";
    bySource[src] = (bySource[src] || 0) + Number(item.amount || 0);
  });
  const total = totalInPeriod.value;
  let maxAmount = 0;
  let maxSource = null;
  Object.entries(bySource).forEach(([src, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      maxSource = src;
    }
  });
  if (!maxSource || total <= 0) return null;
  const pct = Math.round((maxAmount / total) * 100);
  return { name: maxSource, amount: maxAmount, percent: pct };
});

const topSourceName = computed(() => topSourceData.value?.name ?? "–");
const topSourceSubtext = computed(() => {
  const d = topSourceData.value;
  if (!d) return "";
  return `${formatCurrency(d.amount)} (${d.percent}% do total)`;
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
  const lastMonthIncomes = finance.incomes.filter(
    (item) => item.date >= startLast && item.date <= endLast
  );
  const lastMonthTotal = lastMonthIncomes.reduce(
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

const incomeSourceOptions = [
  { label: "Extra", value: "Extra" },
  { label: "Presente", value: "Presente" },
  { label: "Renda Secundária", value: "Renda Secundária" },
  { label: "Resgate investimento", value: "Resgate investimento" },
  { label: "Salário", value: "Salário" },
  { label: "Vale", value: "Vale" },
  { label: "Venda", value: "Venda" },
];

const columns = [
  {
    name: "date",
    label: "Data",
    field: "date",
    align: "left",
    format: (val) => formatDateBR(val),
  },
  {
    name: "description",
    label: "Descrição",
    field: "description",
    align: "left",
  },
  { name: "source", label: "Fonte", field: "source", align: "left" },
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
  source: "",
  amount: null,
});

const form = reactive(emptyForm());
const editingId = ref(null);
const formModalOpen = ref(false);
const detailsModalOpen = ref(false);
const selectedIncomeForDetails = ref(null);

const isEditing = computed(() => editingId.value !== null);
const isInitialLoading = computed(
  () => finance.loading && finance.incomes.length === 0
);

const openDetailsModal = (row) => {
  selectedIncomeForDetails.value = row;
  detailsModalOpen.value = true;
};

const openFormModal = () => {
  onReset();
  formModalOpen.value = true;
};

const onModalClose = () => {
  onReset();
};

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

function onReset() {
  Object.assign(form, emptyForm());
  editingId.value = null;
}

async function onSubmit() {
  const payload = {
    date: form.date,
    description: form.description,
    source: form.source,
    amount: Number(form.amount),
  };

  try {
    if (isEditing.value && editingId.value) {
      await finance.editIncome(editingId.value, payload);
      $q.notify({
        type: "positive",
        message: "Entrada atualizada com sucesso!",
      });
    } else {
      await finance.addIncome(payload);
      $q.notify({
        type: "positive",
        message: "Entrada adicionada com sucesso!",
      });
    }
    onReset();
    formModalOpen.value = false;
  } catch (error) {
    $q.notify({
      type: "negative",
      message: error.message || "Erro ao salvar entrada.",
    });
  }
}

function startEdit(row) {
  editingId.value = row.id;
  Object.assign(form, {
    id: row.id,
    date: row.date || "",
    description: row.description || "",
    source: row.source || "",
    amount: row.amount,
  });
}

function cancelEdit() {
  onReset();
  formModalOpen.value = false;
}

async function removeIncome(row) {
  $q.dialog({
    title: "Excluir entrada",
    message: "Tem certeza que deseja excluir esta entrada?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await finance.removeIncome(row.id);
      $q.notify({
        type: "positive",
        message: "Entrada excluída com sucesso!",
      });
    } catch (error) {
      $q.notify({
        type: "negative",
        message: error.message || "Erro ao excluir entrada.",
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
.page-incomes {
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
/* .stat-card__value--positive {
  color: var(--pos);
} */
.stat-card__value--daily {
  color: var(--text);
}
.stat-card__top-category {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.stat-card__subtext {
  font-size: 12px;
  color: var(--text-4);
}

/* ── Table ──────────────────────────────────────────────── */
.table-incomes {
  height: 60vh;
}
.table-incomes :deep(.q-table__middle) {
  overflow: auto;
  max-height: 60vh;
}
.table-incomes :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface) !important;
  color: var(--text-3) !important;
  border-bottom: 1px solid var(--border) !important;
}
.table-action-btn {
  min-width: 30px;
  min-height: 30px;
}
.table-action-btn :deep(.q-icon) {
  font-size: 18px !important;
}

@media screen and (max-width: 1600px) and (max-height: 900px) {
  .table-incomes {
    height: 52vh;
  }
  .table-incomes :deep(.q-table__middle) {
    max-height: 52vh;
  }
}
@media screen and (max-width: 1365px), screen and (max-height: 767px) {
  .table-incomes {
    height: 42vh;
  }
  .table-incomes :deep(.q-table__middle) {
    max-height: 42vh;
  }
}
</style>
