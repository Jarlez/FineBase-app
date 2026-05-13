<template>
  <q-page class="profile-page">
    <div class="profile-wrap">

      <!-- Header do usuário -->
      <div class="profile-header">
        <div class="profile-avatar">{{ auth.userInitials }}</div>
        <div class="profile-header__info">
          <div class="profile-header__name">{{ auth.userName }}</div>
          <div class="profile-header__email">{{ auth.userEmail }}</div>
        </div>
      </div>

      <!-- Informações pessoais -->
      <div class="profile-section">
        <div class="profile-section__title">Informações pessoais</div>

        <div class="profile-field">
          <label class="profile-label">Nome de exibição</label>
          <div class="profile-input-row">
            <input
              v-model="nameForm.value"
              type="text"
              class="profile-input"
              placeholder="Seu nome"
            />
            <button
              class="profile-btn-save"
              :disabled="nameForm.loading"
              @click="saveName"
            >
              <q-spinner-dots v-if="nameForm.loading" size="14px" color="white" />
              <span v-else>Salvar</span>
            </button>
          </div>
          <p v-if="nameForm.success" class="profile-feedback profile-feedback--ok">
            <q-icon name="check_circle" size="13px" /> Nome atualizado com sucesso.
          </p>
          <p v-if="nameForm.error" class="profile-feedback profile-feedback--err">
            <q-icon name="error_outline" size="13px" /> {{ nameForm.error }}
          </p>
        </div>
      </div>

      <!-- Segurança -->
      <div class="profile-section">
        <div class="profile-section__title">Segurança</div>

        <div class="profile-field">
          <label class="profile-label">Nova senha</label>
          <div class="profile-input-wrap">
            <input
              v-model="pwForm.password"
              :type="showPw ? 'text' : 'password'"
              class="profile-input profile-input--icon"
              placeholder="Mínimo 6 caracteres"
            />
            <button type="button" class="profile-eye" @click="showPw = !showPw" tabindex="-1">
              <q-icon :name="showPw ? 'visibility_off' : 'visibility'" size="15px" />
            </button>
          </div>
        </div>

        <div class="profile-field">
          <label class="profile-label">Confirmar nova senha</label>
          <div class="profile-input-wrap">
            <input
              v-model="pwForm.confirm"
              :type="showConfirmPw ? 'text' : 'password'"
              class="profile-input profile-input--icon"
              placeholder="Repita a nova senha"
            />
            <button type="button" class="profile-eye" @click="showConfirmPw = !showConfirmPw" tabindex="-1">
              <q-icon :name="showConfirmPw ? 'visibility_off' : 'visibility'" size="15px" />
            </button>
          </div>
        </div>

        <button
          class="profile-btn-save"
          :disabled="pwForm.loading"
          style="width: fit-content"
          @click="savePassword"
        >
          <q-spinner-dots v-if="pwForm.loading" size="14px" color="white" />
          <span v-else>Alterar senha</span>
        </button>

        <p v-if="pwForm.success" class="profile-feedback profile-feedback--ok">
          <q-icon name="check_circle" size="13px" /> Senha alterada com sucesso.
        </p>
        <p v-if="pwForm.error" class="profile-feedback profile-feedback--err">
          <q-icon name="error_outline" size="13px" /> {{ pwForm.error }}
        </p>
      </div>

      <!-- Zona de perigo -->
      <div class="profile-section profile-section--danger">
        <div class="profile-section__title profile-section__title--danger">
          <q-icon name="warning_amber" size="14px" />
          Atenção: ações irreversíveis
        </div>

        <div class="danger-item">
          <div>
            <div class="danger-item__label">Excluir conta</div>
            <div class="danger-item__desc">Remove permanentemente sua conta e todos os dados financeiros. Essa ação não pode ser desfeita.</div>
          </div>
          <button class="profile-btn-danger" @click="deleteConfirm = true">
            Excluir conta
          </button>
        </div>
      </div>

    </div>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="deleteConfirm">
      <q-card class="delete-dialog">
        <q-card-section>
          <div class="delete-dialog__title">
            <q-icon name="delete_forever" size="20px" style="color: #dc2626" />
            Excluir conta
          </div>
          <p class="delete-dialog__text">
            Todos os seus dados financeiros (gastos, entradas, orçamentos e recorrentes) serão
            <strong>removidos permanentemente</strong>. Essa ação não pode ser desfeita.
          </p>
        </q-card-section>
        <q-card-actions align="right" style="padding: 8px 16px 16px">
          <q-btn flat label="Cancelar" v-close-popup style="color: var(--text-3); font-size: 13px" />
          <button class="profile-btn-danger" @click="deleteAccount">Excluir tudo</button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useFinanceStore } from '../stores/financeStore'

const router = useRouter()
const auth = useAuthStore()
const finance = useFinanceStore()

const deleteConfirm = ref(false)
const showPw = ref(false)
const showConfirmPw = ref(false)

const nameForm = ref({ value: '', loading: false, success: false, error: '' })
const pwForm = ref({ password: '', confirm: '', loading: false, success: false, error: '' })

onMounted(() => {
  nameForm.value.value = auth.userName
})

async function saveName() {
  nameForm.value.error = ''
  nameForm.value.success = false
  if (!nameForm.value.value.trim()) {
    nameForm.value.error = 'Informe um nome.'
    return
  }
  nameForm.value.loading = true
  try {
    await auth.updateProfile({ name: nameForm.value.value.trim() })
    nameForm.value.success = true
  } catch (err) {
    nameForm.value.error = err.message || 'Erro ao salvar nome.'
  } finally {
    nameForm.value.loading = false
  }
}

async function savePassword() {
  pwForm.value.error = ''
  pwForm.value.success = false
  if (pwForm.value.password.length < 6) {
    pwForm.value.error = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }
  if (pwForm.value.password !== pwForm.value.confirm) {
    pwForm.value.error = 'As senhas não coincidem.'
    return
  }
  pwForm.value.loading = true
  try {
    await auth.updatePassword(pwForm.value.password)
    pwForm.value.success = true
    pwForm.value.password = ''
    pwForm.value.confirm = ''
  } catch (err) {
    pwForm.value.error = err.message || 'Erro ao alterar senha.'
  } finally {
    pwForm.value.loading = false
  }
}

async function deleteAccount() {
  deleteConfirm.value = false
  try {
    await auth.logout()
    finance.clearData()
    router.push('/portal')
  } catch {
    // ignore
  }
}
</script>

<style scoped>
.profile-page {
  background: var(--bg);
  min-height: 100vh;
  padding: 32px 24px;
}

.profile-wrap {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.profile-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

.profile-header__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
}

.profile-header__email {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 2px;
}

/* Seções */
.profile-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-section--danger {
  border-color: rgba(220, 38, 38, 0.25);
  background: var(--surface);
}

.profile-section__title {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-3);
}

.profile-section__title--danger {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(220, 38, 38, 0.75);
}

/* Campos */
.profile-field { display: flex; flex-direction: column; gap: 5px; }

.profile-label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-2);
}

.profile-input-row {
  display: flex;
  gap: 8px;
}

.profile-input-wrap { position: relative; }

.profile-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-soft);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.12s;
  box-sizing: border-box;
  width: 100%;
}
.profile-input:focus { border-color: var(--accent); }
.profile-input::placeholder { color: var(--text-4); }
.profile-input--icon { padding-right: 38px; }

.profile-eye {
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
.profile-eye:hover { color: var(--text); }

/* Botões */
.profile-btn-save {
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  height: 38px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.12s;
}
.profile-btn-save:hover:not(:disabled) { opacity: 0.87; }
.profile-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.profile-btn-danger {
  background: transparent;
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  padding: 0 14px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s;
}
.profile-btn-danger:hover {
  background: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.5);
}

/* Feedback */
.profile-feedback {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  margin: 0;
}
.profile-feedback--ok { color: var(--positive, #059669); }
.profile-feedback--err { color: #dc2626; }

/* Zona de perigo */
.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(220, 38, 38, 0.04);
  border: 1px solid rgba(220, 38, 38, 0.12);
  border-radius: 10px;
}

.danger-item__label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 3px;
}

.danger-item__desc {
  font-size: 12.5px;
  color: var(--text-3);
  line-height: 1.5;
}

/* Dialog de exclusão */
.delete-dialog {
  background: var(--surface) !important;
  min-width: 340px;
  max-width: 440px;
  border-radius: 14px !important;
}

.delete-dialog__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
}

.delete-dialog__text {
  font-size: 13.5px;
  color: var(--text-3);
  line-height: 1.6;
  margin: 0;
}

.delete-dialog__text strong {
  color: var(--text-2);
  font-weight: 600;
}
</style>
