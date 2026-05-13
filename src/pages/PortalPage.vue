<template>
  <div class="portal">
    <div class="portal__card">
      <!-- Logo -->
      <div class="portal__brand">
        <div class="portal__logo">FB</div>
        <span class="portal__name">FineBase</span>
      </div>

      <h1 class="portal__title">Controle financeiro<br>pessoal, sem complicação.</h1>
      <p class="portal__sub">
        Registre gastos, acompanhe entradas, analise parcelamentos e veja sua saúde financeira em tempo real.
      </p>

      <div class="portal__actions">
        <q-btn
          unelevated
          label="Entrar"
          class="portal__btn portal__btn--primary"
          @click="$router.push('/login')"
        />
        <q-btn
          outline
          label="Criar conta"
          class="portal__btn portal__btn--outline"
          @click="$router.push('/cadastro')"
        />
      </div>
    </div>

    <!-- Background decoration -->
    <div class="portal__bg-grid" />
  </div>
</template>

<script setup>
</script>

<style scoped>
.portal {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg, #f1f5f9);
  position: relative;
  overflow: hidden;
  font-family: var(--font-sans);
}

.portal__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-soft, rgba(0,0,0,.06)) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft, rgba(0,0,0,.06)) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.portal__card {
  position: relative;
  z-index: 1;
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 20px;
  padding: 48px 52px;
  width: 420px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.10);
  text-align: center;
}

.portal__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
}

.portal__logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--text, #0f172a);
  color: var(--bg, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

.portal__name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.portal__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.portal__sub {
  font-size: 14px;
  color: var(--text-3);
  line-height: 1.6;
  margin: 0 0 36px;
}

.portal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.portal__btn {
  width: 100%;
  height: 44px;
  border-radius: 10px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  font-family: var(--font-sans) !important;
  letter-spacing: -0.01em;
}

.portal__btn--primary {
  background: var(--text) !important;
  color: var(--bg) !important;
}

.portal__btn--outline {
  border-color: var(--border) !important;
  color: var(--text) !important;
}

.portal__btn--outline:hover {
  background: var(--bg-soft) !important;
}
</style>
