<template>
  <q-card flat class="filter-card" style="border-radius: 12px">
    <q-card-section class="q-pb-none">
      <div class="row items-center q-mb-md">
        <q-icon name="event" size="sm" color="primary" class="q-mr-sm" />
        <span class="text-subtitle1 text-weight-medium"
          >Intervalo de Datas</span
        >
      </div>
      <div class="row q-col-gutter-md">
        <div class="row q-mb-md">
          <q-btn
            v-for="preset in datePresets"
            :key="preset.value"
            :label="preset.label"
            :icon="preset.value === 'today' ? 'today' : undefined"
            no-caps
            unelevated
            rounded
            :outline="selectedPreset !== preset.value"
            :color="selectedPreset === preset.value ? 'primary' : 'grey-7'"
            class="filter-card__btn q-mr-sm"
            @click="selectPreset(preset.value)"
          />
        </div>
        <q-space />
        <div v-if="categoryOptions?.length" class="row items-center q-pb-md">
          <q-select
            :model-value="selectedCategory"
            :options="categoryOptionsWithAll"
            :label="categoryLabel"
            dense
            options-dense
            outlined
            emit-value
            map-options
            clearable
            class="filter-card__select"
            style="min-width: 200px"
            @update:model-value="onCategoryChange"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  categoryOptions: {
    type: Array,
    default: () => [],
  },
  categoryLabel: {
    type: String,
    default: "Categoria",
  },
  defaultPreset: {
    type: String,
    default: "this_month",
  },
});

const emit = defineEmits([
  "update:dateRange",
  "update:category",
  "update:preset",
]);

const datePresets = [
  { label: "Hoje", value: "today" },
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este Mês", value: "this_month" },
  { label: "Mês Passado", value: "last_month" },
  { label: "Últimos 3 meses", value: "3m" },
  { label: "Últimos 6 meses", value: "6m" },
];

const selectedPreset = ref(props.defaultPreset);
const selectedCategory = ref(null);

const categoryOptionsWithAll = computed(() => {
  const opts = [...(props.categoryOptions || [])];
  return [{ label: "Todas", value: null }, ...opts];
});

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateRange(preset) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return { start: toISO(today), end: toISO(today) };
    case "7d":
      start.setDate(start.getDate() - 6);
      return { start: toISO(start), end: toISO(today) };
    case "30d":
      start.setDate(start.getDate() - 29);
      return { start: toISO(start), end: toISO(today) };
    case "this_month":
      start.setDate(1);
      return { start: toISO(start), end: toISO(today) };
    case "last_month":
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      return { start: toISO(start), end: toISO(lastDay) };
    case "3m":
      start.setMonth(start.getMonth() - 2);
      start.setDate(1);
      return { start: toISO(start), end: toISO(today) };
    case "6m":
      start.setMonth(start.getMonth() - 5);
      start.setDate(1);
      return { start: toISO(start), end: toISO(today) };
    default:
      start.setDate(start.getDate() - 29);
      return { start: toISO(start), end: toISO(today) };
  }
}

function selectPreset(value) {
  selectedPreset.value = value;
  const range = getDateRange(value);
  emit("update:dateRange", range);
  emit("update:preset", value);
}

function onCategoryChange(value) {
  selectedCategory.value = value;
  emit("update:category", value ?? null);
}

watch(
  () => props.defaultPreset,
  (v) => {
    selectedPreset.value = v;
    emit("update:dateRange", getDateRange(v));
    emit("update:preset", v);
  },
  { immediate: true }
);
</script>

<style scoped>
.filter-card {
  background: #fff;
}

.filter-card__btn {
  font-size: 0.8rem;
}
</style>
