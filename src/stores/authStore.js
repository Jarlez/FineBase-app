import { defineStore } from 'pinia'
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
  getSession,
  updateProfile,
  updatePassword,
} from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.session,

    userName: (state) => state.user?.user_metadata?.name || state.user?.email?.split('@')[0] || '',

    userEmail: (state) => state.user?.email || '',

    userInitials: (state) => {
      const name = state.user?.user_metadata?.name
      if (name) {
        const parts = name.trim().split(' ').filter(Boolean)
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        return parts[0][0].toUpperCase()
      }
      return state.user?.email?.[0]?.toUpperCase() || '?'
    },
  },

  actions: {
    async initialize() {
      this.loading = true
      try {
        const session = await getSession()
        this.session = session
        this.user = session?.user || null
      } finally {
        this.loading = false
      }
    },

    setSession(session) {
      this.session = session
      this.user = session?.user || null
    },

    async login(email, password) {
      const { session } = await signIn(email, password)
      this.session = session
      this.user = session?.user || null
    },

    async loginWithGoogle() {
      await signInWithGoogle()
    },

    async register(email, password, name) {
      const data = await signUp(email, password, name)
      this.session = data.session
      this.user = data.session?.user || data.user || null
      return data
    },

    async logout() {
      await signOut()
      this.session = null
      this.user = null
    },

    async updateProfile(updates) {
      const user = await updateProfile(updates)
      this.user = user
    },

    async updatePassword(newPassword) {
      await updatePassword(newPassword)
    },
  },
})
