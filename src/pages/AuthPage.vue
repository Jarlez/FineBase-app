<template>
  <div class="auth-page">
    <div class="auth-page__bg-grid" />

    <div v-if="!confirmPending" class="auth-card">
      <!-- Brand -->
      <div class="auth-card__brand" @click="$router.push('/portal')" role="button" tabindex="0" @keydown.enter="$router.push('/portal')">
        <div class="auth-card__logo">FB</div>
        <span class="auth-card__name">FineBase</span>
      </div>

      <!-- Title -->
      <h1 class="auth-card__title">{{ isLogin ? 'Seja Bem-vindo' : 'Criar sua conta' }}</h1>
      <p class="auth-card__sub">{{ isLogin ? 'Insira suas credenciais para acessar.' : 'Preencha os dados para começar.' }}</p>

      <!-- Error -->
      <div v-if="error" class="auth-error">
        <q-icon name="error_outline" size="15px" />
        {{ error }}
      </div>

      <!-- Google button -->
      <button class="auth-google" @click="handleGoogle" :disabled="loading">
        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar com Google
      </button>

      <div class="auth-divider"><span>ou</span></div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name (only for register) -->
        <div v-if="!isLogin" class="auth-field">
          <label class="auth-label">Nome</label>
          <input
            v-model="form.name"
            type="text"
            class="auth-input"
            placeholder="Seu nome"
            autocomplete="name"
            required
          />
        </div>

        <div class="auth-field">
          <label class="auth-label">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            class="auth-input"
            placeholder="seu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="auth-field">
          <label class="auth-label">Senha</label>
          <div class="auth-input-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input auth-input--with-icon"
              :placeholder="isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'"
              autocomplete="current-password"
              required
            />
            <button type="button" class="auth-eye" @click="showPassword = !showPassword" tabindex="-1">
              <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="16px" />
            </button>
          </div>
        </div>

        <div v-if="!isLogin" class="auth-field">
          <label class="auth-label">Confirmar senha</label>
          <div class="auth-input-wrap">
            <input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              class="auth-input auth-input--with-icon"
              placeholder="Repita a senha"
              autocomplete="new-password"
              required
            />
            <button type="button" class="auth-eye" @click="showConfirm = !showConfirm" tabindex="-1">
              <q-icon :name="showConfirm ? 'visibility_off' : 'visibility'" size="16px" />
            </button>
          </div>
        </div>

        <button type="submit" class="auth-submit" :disabled="loading">
          <q-spinner-dots v-if="loading" size="18px" color="white" />
          <span v-else>{{ isLogin ? 'Entrar' : 'Criar conta' }}</span>
        </button>
      </form>

      <!-- Toggle mode -->
      <p class="auth-toggle">
        {{ isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
        <button class="auth-toggle__link" @click="toggleMode">
          {{ isLogin ? 'Criar conta' : 'Entrar' }}
        </button>
      </p>
    </div>

    <!-- Email confirmation pending state -->
    <div v-if="confirmPending" class="auth-card auth-confirm">
      <div class="auth-confirm__icon">
        <q-icon name="mark_email_read" size="36px" style="color: var(--accent)" />
      </div>
      <h2 class="auth-confirm__title">Confirme seu e-mail</h2>
      <p class="auth-confirm__text">
        Enviamos um link de confirmação para <strong>{{ form.email }}</strong>.
        Acesse seu e-mail e clique no link para ativar sua conta.
      </p>
      <button class="auth-submit" style="margin-top: 8px" @click="confirmPending = false; toggleMode()">
        Voltar ao login
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useFinanceStore } from '../stores/financeStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const finance = useFinanceStore()

const mode = ref(route.name === 'register' ? 'register' : 'login')
const isLogin = computed(() => mode.value === 'login')

const loading = ref(false)
const error = ref('')
const confirmPending = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

const form = ref({ name: '', email: '', password: '', confirmPassword: '' })

function toggleMode() {
  error.value = ''
  form.value = { name: '', email: '', password: '', confirmPassword: '' }
  mode.value = isLogin.value ? 'register' : 'login'
  router.replace({ name: isLogin.value ? 'login' : 'register' })
}

async function handleGoogle() {
  error.value = ''
  try {
    await auth.loginWithGoogle()
  } catch (err) {
    error.value = err.message || 'Erro ao entrar com Google.'
  }
}

async function handleSubmit() {
  error.value = ''

  if (!isLogin.value && form.value.password !== form.value.confirmPassword) {
    error.value = 'As senhas não coincidem.'
    return
  }
  if (!isLogin.value && form.value.password.length < 6) {
    error.value = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }

  loading.value = true
  try {
    if (isLogin.value) {
      await auth.login(form.value.email, form.value.password)
      await finance.loadData()
      router.push('/dashboard')
    } else {
      const result = await auth.register(form.value.email, form.value.password, form.value.name)

      if (auth.isAuthenticated) {
        await finance.loadData()
        router.push('/dashboard')
      } else if (result?.user?.identities?.length === 0) {
        // Email already registered (Supabase omits error for security, but returns empty identities)
        error.value = 'Este e-mail já possui uma conta. Use "Entrar" ou continue com Google.'
      } else {
        // Session null = email confirmation pending
        confirmPending.value = true
      }
    }
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('Invalid login credentials')) {
      error.value = 'E-mail ou senha incorretos.'
    } else if (msg.includes('User already registered')) {
      error.value = 'Este e-mail já está cadastrado.'
    } else if (msg.includes('Password should be')) {
      error.value = 'A senha deve ter no mínimo 6 caracteres.'
    } else {
      error.value = msg || 'Ocorreu um erro. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg, #f1f5f9);
  position: relative;
  overflow: hidden;
  font-family: var(--font-sans);
}

.auth-page__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-soft, rgba(0,0,0,.06)) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft, rgba(0,0,0,.06)) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.auth-card {
  position: relative;
  z-index: 1;
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 20px;
  padding: 40px 44px;
  width: 400px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.10);
}

.auth-card__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  cursor: pointer;
  width: fit-content;
}

.auth-card__logo {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--text, #0f172a);
  color: var(--bg, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

.auth-card__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.auth-card__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.auth-card__sub {
  font-size: 13px;
  color: var(--text-3);
  margin: 0 0 20px;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.20);
  border-radius: 8px;
  font-size: 13px;
  color: #dc2626;
  margin-bottom: 16px;
}

.auth-google {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  font-family: var(--font-sans);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.auth-google:hover:not(:disabled) {
  background: var(--bg-soft);
  border-color: var(--text-3);
}
.auth-google:disabled { opacity: 0.5; cursor: not-allowed; }

.auth-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  color: var(--text-4);
  font-size: 12px;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-soft);
}

.auth-field { margin-bottom: 14px; }

.auth-label {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: 5px;
}

.auth-input-wrap { position: relative; }

.auth-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.12s;
}
.auth-input:focus { border-color: var(--accent); }
.auth-input::placeholder { color: var(--text-4); }
.auth-input--with-icon { padding-right: 38px; }

.auth-eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  display: flex;
  align-items: center;
  padding: 0;
}
.auth-eye:hover { color: var(--text); }

.auth-submit {
  width: 100%;
  height: 42px;
  margin-top: 6px;
  border-radius: 9px;
  border: none;
  background: var(--text);
  color: var(--bg);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.12s;
}
.auth-submit:hover:not(:disabled) { opacity: 0.87; }
.auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.auth-toggle {
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
  margin: 18px 0 0;
}
.auth-toggle__link {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-family: var(--font-sans);
}
.auth-toggle__link:hover { text-decoration: underline; }

.auth-confirm {
  text-align: center;
  padding: 44px 44px 40px;
}
.auth-confirm__icon { margin-bottom: 16px; }
.auth-confirm__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 10px;
  letter-spacing: -0.02em;
}
.auth-confirm__text {
  font-size: 13.5px;
  color: var(--text-3);
  line-height: 1.6;
  margin: 0 0 20px;
}
.auth-confirm__text strong { color: var(--text-2); font-weight: 600; }
</style>
