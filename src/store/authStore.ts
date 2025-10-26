import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserPermissions {
  canManageUsers: boolean
  canManageClients: boolean
  canManageCases: boolean
  canManageDocuments: boolean
  canManageInvoices: boolean
  canViewReports: boolean
  canManageSettings: boolean
  canViewAllData: boolean
  canManageFinance: boolean
  canManageRecords: boolean
  modules: string[]
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  department: string
  position?: string
  avatar?: string
  isActive: boolean
  permissions?: UserPermissions
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

