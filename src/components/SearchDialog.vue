<template>
  <q-dialog
    v-model="open"
    transition-show="jump-down"
    transition-hide="jump-up"
    @hide="query = ''"
  >
    <q-card class="search-palette">
      <!-- Input -->
      <div class="search-palette__input-row">
        <q-icon name="search" size="17px" class="search-palette__search-icon" />
        <input
          ref="inputRef"
          v-model="query"
          class="search-palette__input"
          placeholder="Buscar páginas e ações…"
          autocomplete="off"
          spellcheck="false"
          @keydown.down.prevent="moveDown"
          @keydown.up.prevent="moveUp"
          @keydown.enter.prevent="selectActive"
          @keydown.esc="open = false"
        />
      </div>

      <q-separator />

      <!-- Results -->
      <div class="search-palette__list">
        <template v-if="results.length">
          <button
            v-for="(item, i) in results"
            :key="item.label"
            class="search-result"
            :class="{ 'search-result--active': activeIndex === i }"
            @click="select(item)"
            @mouseenter="activeIndex = i"
          >
            <div class="search-result__icon">
              <q-icon :name="item.icon" size="16px" />
            </div>
            <div class="search-result__body">
              <div class="search-result__label">{{ item.label }}</div>
              <div class="search-result__desc">{{ item.description }}</div>
            </div>
            <div v-if="activeIndex === i" class="search-result__enter">
              <q-icon name="keyboard_return" size="13px" />
            </div>
          </button>
        </template>
        <div v-else class="search-palette__empty">
          Nenhum resultado para "<em>{{ query }}</em>"
        </div>
      </div>

      <!-- Footer -->
      <div class="search-palette__footer">
        <span><kbd>↑↓</kbd> navegar</span>
        <span><kbd>↵</kbd> acessar</span>
        <span><kbd>Esc</kbd> fechar</span>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { SEARCH_INDEX } from '../data/searchIndex'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'open-budgets'])

const router = useRouter()
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const results = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return SEARCH_INDEX
  return SEARCH_INDEX.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q),
  )
})

watch(open, async (val) => {
  if (val) {
    query.value = ''
    activeIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(results, () => {
  activeIndex.value = 0
})

function moveDown() {
  if (activeIndex.value < results.value.length - 1) activeIndex.value++
}

function moveUp() {
  if (activeIndex.value > 0) activeIndex.value--
}

function select(item) {
  open.value = false
  if (item.to) {
    router.push(item.to)
  } else if (item.action === 'openBudgets') {
    emit('open-budgets')
  }
}

function selectActive() {
  const item = results.value[activeIndex.value]
  if (item) select(item)
}
</script>

<style lang="scss" scoped>
.search-palette {
  width: 520px;
  max-width: 92vw;
  background: var(--surface) !important;
  border: 1px solid var(--border);
  border-radius: 12px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18) !important;
  overflow: hidden;
}

// ── Input row ─────────────────────────────────────────────────────────
.search-palette__input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
}

.search-palette__search-icon {
  color: var(--text-3);
  flex-shrink: 0;
}

.search-palette__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--text);
  font-family: var(--font-sans);

  &::placeholder {
    color: var(--text-4);
  }
}

// ── Results list ───────────────────────────────────────────────────────
.search-palette__list {
  max-height: 340px;
  overflow-y: auto;
  padding: 6px 6px;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  font-family: var(--font-sans);

  &--active {
    background: var(--bg-soft);
  }
}

.search-result__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-soft);
  border: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  flex-shrink: 0;

  .search-result--active & {
    background: var(--surface-2);
    color: var(--accent);
  }
}

.search-result__body {
  flex: 1;
  min-width: 0;
}

.search-result__label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.3;
}

.search-result__desc {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result__enter {
  color: var(--text-4);
  flex-shrink: 0;
}

// ── Empty state ─────────────────────────────────────────────────────────
.search-palette__empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-3);

  em {
    font-style: normal;
    color: var(--text-2);
  }
}

// ── Footer ──────────────────────────────────────────────────────────────
.search-palette__footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--border-soft);
  font-size: 11.5px;
  color: var(--text-4);

  kbd {
    font-family: var(--font-mono);
    font-size: 10.5px;
    padding: 1px 5px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--surface-2);
    color: var(--text-3);
  }
}
</style>
