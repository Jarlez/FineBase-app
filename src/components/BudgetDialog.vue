<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 380px; max-width: 500px" class="rounded-borders">
      <q-card-section class="row items-center modal-head">
        <div class="modal-title">Gerenciar orçamentos</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="text-caption text-grey-6 q-mb-md">
          Defina um limite mensal por categoria. O dashboard mostra a barra de
          progresso e alerta quando excedido.
        </div>
        <div class="row q-col-gutter-sm q-mb-md items-end">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="budgetForm.category"
              :options="budgetCategoryOptions"
              label="Categoria"
              dense
              outlined
              emit-value
              map-options
              hide-bottom-space
            />
          </div>
          <div class="col-8 col-sm-4">
            <q-input
              v-model.number="budgetForm.limit_amount"
              type="number"
              label="Limite (R$)"
              dense
              outlined
              prefix="R$"
              hide-bottom-space
            />
          </div>
          <div class="col-4 col-sm-2">
            <q-btn
              unelevated
              color="primary"
              icon="save"
              round
              :loading="budgetSaving"
              :disable="!budgetForm.category || !budgetForm.limit_amount"
              @click="saveBudgetForm"
            />
          </div>
        </div>
        <q-list separator>
          <q-item v-for="b in finance.budgets" :key="b.id" dense>
            <q-item-section>
              <q-item-label>{{ b.category }}</q-item-label>
              <q-item-label caption>Limite: {{ formatMoney(b.limit_amount) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                @click="removeBudgetItem(b.id)"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="!finance.budgets.length">
            <q-item-section class="text-caption text-grey-5 text-center">
              Nenhum orçamento configurado
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useFinanceStore } from "../stores/financeStore";
import { formatMoney } from "../utils/formatMoney";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);

const finance = useFinanceStore();

const budgetSaving = ref(false);
const budgetForm = ref({ category: null, limit_amount: null });

const budgetCategoryOptions = [
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

async function saveBudgetForm() {
  if (!budgetForm.value.category || !budgetForm.value.limit_amount) return;
  budgetSaving.value = true;
  try {
    await finance.saveBudget(budgetForm.value.category, budgetForm.value.limit_amount);
    budgetForm.value = { category: null, limit_amount: null };
  } finally {
    budgetSaving.value = false;
  }
}

async function removeBudgetItem(id) {
  await finance.removeBudget(id);
}
</script>

<style scoped>
.modal-head {
  padding-bottom: 8px;
}
.modal-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
</style>
