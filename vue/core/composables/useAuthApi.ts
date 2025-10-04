import type {
  ApiResponse,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponseData
} from '@/types'

/**
 * Authentication API methods
 * Uses useFetch for core auth endpoints (no Bearer token needed for login/register)
 */
export function useAuthApi() {
  /**
   * Login user
   */
  const login = async (credentials: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
    const { execute } = useFetch<AuthResponseData>('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    return execute()
  }

  /**
   * Register new user
   */
  const register = async (userData: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
    const { execute } = useFetch<AuthResponseData>('/api/auth/register', {
      method: 'POST',
      body: userData
    })
    return execute()
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    const { execute } = useFetch('/api/auth/logout', {
      method: 'POST'
    })
    await execute()
  }

  /**
   * Get current user (requires Bearer token - use useApi instead)
   */
  const getCurrentUser = async (): Promise<ApiResponse<User>> => {
    const { get } = useApi()
    return get('/api/users/me')
  }

  /**
   * Update user
   */
  const updateUser = async (id: number, data: any): Promise<ApiResponse<User>> => {
    const { put } = useApi()
    return put(`/api/users/${id}`, data)
  }

  /**
   * Update user password
   */
  const updateUserPassword = async (id: number, data: { old_password: string, new_password: string }): Promise<ApiResponse<void>> => {
    const { put } = useApi()
    return put(`/api/users/${id}/password`, data)
  }

  /**
   * Upload user avatar
   */
  const uploadUserAvatar = async (id: number, formData: FormData): Promise<ApiResponse<User>> => {
    const { put } = useApi()
    return put(`/api/users/${id}/avatar`, formData)
  }

  return {
    login,
    register,
    logout,
    getCurrentUser,
    updateUser,
    updateUserPassword,
    uploadUserAvatar
  }
}
