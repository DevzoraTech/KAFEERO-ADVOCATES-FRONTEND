import { apiService } from './apiService'

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
      avatar?: string
    }
    token: string
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  avatar?: string
}

class AuthService {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await apiService.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    return {
      user: response.data.user,
      token: response.data.token,
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
