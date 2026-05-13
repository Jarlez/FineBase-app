<template>
  <q-page class="score-page">
    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="row justify-between">
      <div class="column q-mb-lg">
        <h1 class="text-h5 text-weight-medium q-ma-none">Score Financeiro</h1>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">
          Entenda como sua nota é calculada e como melhorá-la
        </p>
      </div>
      <div class="row items-center q-gutter-sm q-mb-lg">
        <q-select
          v-model="selectedMonth"
          :options="monthOptions"
          label="Mês"
          dense
          outlined
          emit-value
          map-options
          hide-bottom-space
          class="close-select"
          style="min-width: 140px"
        />
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Ano"
          dense
          outlined
          emit-value
          map-options
          hide-bottom-space
          class="close-select"
          style="min-width: 92px"
        />
      </div>
    </div>

    <!-- ── Skeleton ────────────────────────────────────────────────── -->
    <template v-if="isInitialLoading">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <q-skeleton type="rect" height="260px" style="border-radius: 10px" />
        </div>
        <div class="col-12 col-sm-8">
          <q-skeleton type="rect" height="260px" style="border-radius: 10px" />
        </div>
      </div>
      <q-skeleton type="rect" height="380px" class="q-mb-md" style="border-radius: 10px" />
      <q-skeleton type="rect" height="300px" style="border-radius: 10px" />
    </template>

    <template v-else>
      <div class="score-content-wrap" :class="{ 'is-locked': !hasEnoughData }">
      <div class="score-content-inner">
      <!-- ── Row 1: Hero + Faixas ────────────────────────────────── -->
      <div class="row q-col-gutter-md q-mb-md items-stretch">
        <!-- Hero score -->
        <div class="col-12 col-sm-5 col-md-4">
          <q-card class="score-hero-card full-height">
            <q-card-section class="score-hero">
              <!-- SVG gauge -->
              <svg viewBox="0 0 120 90" class="score-gauge-svg">
                <path
                  d="M 10 70 A 50 50 0 0 1 110 70"
                  fill="none"
                  stroke="var(--bg-soft)"
                  stroke-width="12"
                  stroke-linecap="round"
                />
                <path
                  v-if="monthlyScore > 0"
                  :d="gaugeArcPath"
                  fill="none"
                  :stroke="scoreColor"
                  stroke-width="12"
                  stroke-linecap="round"
                />
                <text
                  x="60"
                  y="60"
                  text-anchor="middle"
                  font-size="26"
                  font-weight="700"
                  :fill="scoreColor"
                >{{ monthlyScore }}</text>
                <text x="60" y="76" text-anchor="middle" font-size="11" fill="#94a3b8">/100</text>
              </svg>

              <div class="score-hero__label" :style="{ color: scoreColor }">
                {{ monthlyScoreLabel }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">{{ periodLabel }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Faixas de classificação -->
        <div class="col-12 col-sm-7 col-md-8">
          <q-card class="full-height">
            <q-card-section class="sp-card-header">
              <div class="text-subtitle1 text-weight-medium">Faixas de classificação</div>
              <div class="text-caption text-grey-6">Em qual faixa você está neste mês</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="score-bands">
                <div
                  v-for="band in scoreBands"
                  :key="band.id"
                  class="score-band"
                  :class="{ 'score-band--active': band.active }"
                >
                  <div class="score-band__stripe" :style="{ background: band.color }" />
                  <div class="score-band__content">
                    <div
                      class="score-band__range"
                      :style="band.active ? { color: band.color } : {}"
                    >{{ band.range }}</div>
                    <div class="score-band__name">{{ band.label }}</div>
                    <div class="score-band__desc">{{ band.desc }}</div>
                  </div>
                  <q-icon
                    v-if="band.active"
                    name="chevron_left"
                    size="18px"
                    :style="{ color: band.color }"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ── Row 2: Como é calculado ────────────────────────────── -->
      <div class="q-mb-md">
        <q-card>
          <q-card-section class="sp-card-header">
            <div class="text-subtitle1 text-weight-medium">Como é calculado</div>
            <div class="text-caption text-grey-6">
              Cada critério contribui com pontos positivos ou negativos para sua nota
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="score-factors-grid">
              <div
                v-for="factor in scoreFactors"
                :key="factor.id"
                class="score-factor"
              >
                <div class="score-factor__header">
                  <div class="score-factor__icon" :class="`score-factor__icon--${factor.status}`">
                    <q-icon :name="factor.icon" size="17px" />
                  </div>
                  <div class="score-factor__title">{{ factor.label }}</div>
                  <div
                    class="score-factor__badge"
                    :class="`score-factor__badge--${factor.status}`"
                  >
                    <template v-if="factor.penalty > 0">−{{ factor.penalty }} pts</template>
                    <template v-else-if="factor.bonus > 0">+{{ factor.bonus }} pts</template>
                    <template v-else>OK</template>
                  </div>
                </div>
                <p class="score-factor__desc">{{ factor.description }}</p>
                <p class="score-factor__hint">{{ factor.hint }}</p>
                <div class="score-factor__bar">
                  <div
                    class="score-factor__bar-fill"
                    :class="`score-factor__bar-fill--${factor.status}`"
                    :style="{
                      width: `${factor.maxPenalty > 0 ? (factor.penalty / factor.maxPenalty) * 100 : 0}%`,
                    }"
                  />
                </div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  penalidade máx.: {{ factor.maxPenalty }} pts
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ── Row 3: Histórico + Dicas ───────────────────────────── -->
      <div class="row q-col-gutter-md">
        <!-- Gráfico 12 meses -->
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section class="sp-card-header">
              <div class="text-subtitle1 text-weight-medium">Evolução — últimos 12 meses</div>
              <div class="text-caption text-grey-6">Score calculado mês a mês</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="score-history-chart">
                <Line :data="historyChartData" :options="historyChartOptions" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Dicas personalizadas -->
        <div class="col-12 col-md-4">
          <q-card class="full-height">
            <q-card-section class="sp-card-header">
              <div class="text-subtitle1 text-weight-medium">Dicas para melhorar</div>
              <div class="text-caption text-grey-6">Baseadas no mês selecionado</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <template v-if="improvementTips.length">
                <div class="score-tips">
                  <div
                    v-for="tip in improvementTips"
                    :key="tip.id"
                    class="score-tip"
                  >
                    <div
                      class="score-tip__icon"
                      :class="`score-tip__icon--${tip.status}`"
                    >
                      <q-icon :name="tip.icon" size="15px" />
                    </div>
                    <div class="score-tip__body">
                      <div class="score-tip__label">{{ tip.label }}</div>
                      <div class="score-tip__hint">{{ tip.hint }}</div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="text-center q-py-md">
                <q-icon name="check_circle" size="40px" color="positive" />
                <div class="text-body2 text-grey-6 q-mt-sm">Score em boa forma!</div>
                <div class="text-caption text-grey-5">Continue com esses hábitos.</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      </div><!-- score-content-inner -->

      <!-- ── Gate overlay ──────────────────────────────────────────── -->
      <div v-if="!hasEnoughData" class="score-gate">
        <div class="score-gate__card">
          <q-icon name="insert_chart_outlined" size="48px" class="score-gate__icon" />
          <div class="score-gate__title">Score indisponível</div>
          <p class="score-gate__text">
            Registre pelo menos <strong>3 gastos</strong> em
            <strong>{{ periodLabel }}</strong> para calcular seu score financeiro.
          </p>
          <q-btn
            label="Registrar gastos"
            unelevated no-caps rounded
            color="primary"
            icon="trending_down"
            to="/gastos"
          />
        </div>
      </div>

      </div><!-- score-content-wrap -->
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { Line } from 'vue-chartjs'
import { useFinanceStore } from '../stores/financeStore'
import { useMonthlyClosing } from '../composables/useMonthlyClosing'

const finance = useFinanceStore()
const $q = useQuasar()

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())

const monthOptions = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
]

const yearOptions = computed(() => {
  const years = new Set([selectedYear.value, now.getFullYear()])
  finance.expenses.forEach((e) => { const y = parseYear(e.date); if (y) years.add(y) })
  finance.incomes.forEach((i) => { const y = parseYear(i.date); if (y) years.add(y) })
  return Array.from(years).sort((a, b) => b - a)
})

function parseYear(dateString) {
  if (!dateString) return null
  const d = new Date(`${dateString}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d.getFullYear()
}

const {
  periodLabel,
  monthlyScore,
  monthlyScoreColor,
  monthlyScoreLabel,
  scoreFactors,
  scoreHistoryLong,
  totalExpenseTransactions,
} = useMonthlyClosing(selectedMonth, selectedYear)

const isInitialLoading = computed(() => {
  const hasNoData = !finance.expenses.length && !finance.incomes.length
  return finance.loading && hasNoData
})

const hasEnoughData = computed(() => totalExpenseTransactions.value >= 3)

// Mapeamento de cor Quasar → hex
const COLOR_MAP = { positive: '#059669', info: '#0ea5e9', warning: '#d97706', negative: '#dc2626' }
const scoreColor = computed(() => COLOR_MAP[monthlyScoreColor.value] ?? '#2563eb')

// Arco SVG do gauge — o arco vai de 0° a no máximo 180°, então largeArc é sempre 0
const gaugeArcPath = computed(() => {
  const s = monthlyScore.value
  if (s <= 0) return ''
  const angleRad = ((180 - 180 * s / 100) * Math.PI) / 180
  const endX = 60 + 50 * Math.cos(angleRad)
  const endY = 70 - 50 * Math.sin(angleRad)
  return `M 10 70 A 50 50 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`
})

// Faixas de classificação
const scoreBands = computed(() => [
  {
    id: 'excellent',
    range: '85 – 100',
    label: 'Excelente',
    desc: 'Controle financeiro sólido. Continue assim.',
    color: '#059669',
    active: monthlyScore.value >= 85,
  },
  {
    id: 'good',
    range: '70 – 84',
    label: 'Bom controle',
    desc: 'Poucas melhorias necessárias para alcançar o topo.',
    color: '#0ea5e9',
    active: monthlyScore.value >= 70 && monthlyScore.value < 85,
  },
  {
    id: 'warning',
    range: '55 – 69',
    label: 'Atenção moderada',
    desc: 'Alguns critérios precisam de ajuste.',
    color: '#d97706',
    active: monthlyScore.value >= 55 && monthlyScore.value < 70,
  },
  {
    id: 'critical',
    range: '0 – 54',
    label: 'Crítico',
    desc: 'Vários critérios comprometidos. Aja agora.',
    color: '#dc2626',
    active: monthlyScore.value < 55,
  },
])

// Dicas: fatores com penalidade ou warning, ordenados por impacto
const improvementTips = computed(() =>
  scoreFactors.value
    .filter((f) => f.penalty > 0 || f.status === 'warning')
    .sort((a, b) => b.penalty - a.penalty),
)

// Gráfico de histórico
function pointColor(score) {
  if (score >= 85) return '#059669'
  if (score >= 70) return '#0ea5e9'
  if (score >= 55) return '#d97706'
  return '#dc2626'
}

const historyChartData = computed(() => ({
  labels: scoreHistoryLong.value.map((h) => h.label),
  datasets: [
    {
      data: scoreHistoryLong.value.map((h) => h.score),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.07)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: scoreHistoryLong.value.map((h) => pointColor(h.score)),
      pointBorderColor: scoreHistoryLong.value.map((h) => pointColor(h.score)),
      pointBorderWidth: 2,
    },
  ],
}))

const historyChartOptions = computed(() => {
  const textColor = $q.dark.isActive ? '#94a3b8' : '#64748b'
  const gridColor = $q.dark.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` Score: ${ctx.raw}/100` } },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25, color: textColor },
        grid: { color: gridColor },
      },
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  }
})

onMounted(async () => {
  if (!finance.expenses.length && !finance.incomes.length) {
    await finance.loadData()
  }
})
</script>

<style lang="scss" scoped>
.score-page {
  padding: 24px;
  background: var(--bg-page);
  min-height: 100vh;
}

// ── Selects (padrão do app)
.close-select :deep(.q-field__control) {
  background: var(--surface) !important;
}

// ── Header card sections ───────────────────────────────────────────
.sp-card-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px 10px;
}

// ── Hero ───────────────────────────────────────────────────────────
.score-hero-card {
  display: flex;
  flex-direction: column;
}

.score-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px 20px;
  text-align: center;
}

.score-gauge-svg {
  width: 170px;
  height: auto;
  margin-bottom: 8px;
}

.score-hero__label {
  font-size: 14px;
  font-weight: 600;
}

// ── Faixas ─────────────────────────────────────────────────────────
.score-bands {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-band {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--bg-soft);
  opacity: 0.55;
  transition: opacity 0.2s;
}

.score-band--active {
  opacity: 1;
  background: var(--bg-page);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.score-band__stripe {
  width: 4px;
  height: 38px;
  border-radius: 2px;
  flex-shrink: 0;
}

.score-band__content {
  flex: 1;
}

.score-band__range {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-1);
}

.score-band__name {
  font-size: 13px;
  font-weight: 500;
}

.score-band__desc {
  font-size: 12px;
  color: var(--text-3);
}

// ── Critérios ──────────────────────────────────────────────────────
.score-factors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.score-factor {
  background: var(--bg-soft);
  border-radius: 10px;
  padding: 14px;
}

.score-factor__header {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
}

.score-factor__icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-factor__icon--positive { background: rgba(5, 150, 105, 0.12); color: #059669; }
.score-factor__icon--warning  { background: rgba(217, 119, 6, 0.12);  color: #d97706; }
.score-factor__icon--negative { background: rgba(220, 38, 38, 0.12);  color: #dc2626; }

.score-factor__title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.score-factor__badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.score-factor__badge--positive { background: rgba(5, 150, 105, 0.12); color: #059669; }
.score-factor__badge--warning  { background: rgba(217, 119, 6, 0.12);  color: #d97706; }
.score-factor__badge--negative { background: rgba(220, 38, 38, 0.12);  color: #dc2626; }

.score-factor__desc {
  font-size: 12px;
  color: var(--text-3);
  margin: 0 0 4px;
  line-height: 1.45;
}

.score-factor__hint {
  font-size: 12px;
  color: var(--text-2);
  margin: 0 0 8px;
  line-height: 1.45;
}

.score-factor__bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.score-factor__bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-factor__bar-fill--positive { background: #059669; }
.score-factor__bar-fill--warning  { background: #d97706; }
.score-factor__bar-fill--negative { background: #dc2626; }

// ── Gráfico ────────────────────────────────────────────────────────
.score-history-chart {
  height: 230px;
  position: relative;
}

// ── Dicas ──────────────────────────────────────────────────────────
.score-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-tip {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.score-tip__icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.score-tip__icon--positive { background: rgba(5, 150, 105, 0.12); color: #059669; }
.score-tip__icon--warning  { background: rgba(217, 119, 6, 0.12);  color: #d97706; }
.score-tip__icon--negative { background: rgba(220, 38, 38, 0.12);  color: #dc2626; }

.score-tip__label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.score-tip__hint {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.45;
}

// ── Data gate ──────────────────────────────────────────────────────
.score-content-wrap {
  position: relative;
}

.is-locked .score-content-inner {
  filter: blur(5px);
  opacity: 0.45;
  pointer-events: none;
  user-select: none;
}

.score-gate {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10;
  padding: 24px;
}

.score-gate__card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px 44px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.14);
  max-width: 420px;
  width: 100%;
}

.score-gate__icon {
  color: var(--accent);
  margin-bottom: 16px;
}

.score-gate__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.score-gate__text {
  font-size: 14px;
  color: var(--text-3);
  line-height: 1.65;
  margin: 0 0 24px;

  strong {
    color: var(--text-2);
    font-weight: 600;
  }
}
</style>
