<template>
  <div class="row">
    <div class="filter-bar">
      <div class="filter-bar__presets">
        <button
          v-for="preset in datePresets"
          :key="preset.value"
          :class="[
            'filter-bar__btn',
            { 'is-active': selectedPreset === preset.value },
          ]"
          @click="selectPreset(preset.value)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <div class="row q-gutter-x-md q-ml-md">
      <q-select
        v-if="categoryOptions?.length"
        :model-value="selectedCategory"
        :options="categoryOptionsWithAll"
        :label="categoryLabel"
        dense
        options-dense
        outlined
        emit-value
        map-options
        :clearable="selectedCategory !== null"
        class="filter-bar__select"
        @update:model-value="onCategoryChange"
      />

      <q-select
        v-for="filter in extraFilters"
        :key="filter.key"
        :model-value="extraSelected[filter.key] ?? null"
        :options="[{ label: 'Todas', value: null }, ...filter.options]"
        :label="filter.label"
        dense
        options-dense
        outlined
        emit-value
        map-options
        :clearable="extraSelected[filter.key] != null"
        class="filter-bar__select"
        @update:model-value="(val) => onExtraFilterChange(filter.key, val)"
      />
    </div>
  </div>
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
  extraFilters: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "update:dateRange",
  "update:category",
  "update:preset",
  "update:filter",
]);

const datePresets = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Este mês", value: "this_month" },
  { label: "Mês passado", value: "last_month" },
  { label: "3 meses", value: "3m" },
  { label: "6 meses", value: "6m" },
];

const selectedPreset = ref(props.defaultPreset);
const selectedCategory = ref(null);
const extraSelected = ref({});

const categoryOptionsWithAll = computed(() => [
  { label: "Todas", value: null },
  ...(props.categoryOptions || []),
]);

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
    case "last_month": {
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      return { start: toISO(start), end: toISO(lastDay) };
    }
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

function onExtraFilterChange(key, value) {
  extraSelected.value = { ...extraSelected.value, [key]: value ?? null };
  emit("update:filter", { key, value: value ?? null });
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
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  flex-wrap: wrap;
}

.filter-bar__presets {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-bar__btn {
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-3);
  transition: background 0.1s, color 0.1s, border-color 0.1s;
  white-space: nowrap;
  line-height: 1.5;
}

.filter-bar__btn:hover {
  background: var(--bg-soft);
  color: var(--text-2);
}

.filter-bar__btn.is-active {
  background: var(--bg-soft);
  border-color: var(--border);
  color: var(--text);
  font-weight: 600;
}

.filter-bar__select {
  min-width: 170px;
  flex-shrink: 0;
}

.filter-bar__select :deep(.q-field__control) {
  height: 34px;
  min-height: 34px;
  background: var(--surface) !important;
}

.filter-bar__select :deep(.q-field__native) {
  padding-top: 0;
  padding-bottom: 0;
  font-size: 12px;
}

.filter-bar__select :deep(.q-field__label) {
  font-size: 12px;
  top: 8px;
}

.filter-bar__select :deep(.q-field__label--floating) {
  transform: translateY(-65%) scale(0.75);
}

.filter-bar__select :deep(.q-field__control:after) {
  display: none;
}

.filter-bar__select :deep(.q-field--focused .q-field__control:before) {
  border-color: var(--border) !important;
}
</style>
