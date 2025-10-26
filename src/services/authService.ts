import { apiService } from './apiService'
import { UserPermissions } from '../store/authStore'

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: {
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
    }
    token: string
    permissions: UserPermissions
  }
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

class AuthService {
  async login(email: string, password: string): Promise<{ user: User; token: string; permissions: UserPermissions }> {
    const response = await apiService.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    return {
      user: { ...response.data.user, permissions: response.data.permissions },
      token: response.data.token,
      permissions: response.data.permissions,
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ success: boolean; data: { user: User } }>('/auth/me')
    
    if (!response.success) {
      throw new Error('Failed to get current user')
    }

    return response.data.user
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiService.put<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    })

    if (!response.success) {
      throw new Error(response.message)
    }
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout')
  }
}

export const authService = new AuthService()

