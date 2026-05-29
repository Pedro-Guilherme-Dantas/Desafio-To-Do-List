import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (!envUrl) {
    return 'http://localhost:8000/api'
  }
  // Se a URL do ambiente já contiver '/api', removemos barras extras no final e usamos
  if (envUrl.includes('/api')) {
    return envUrl.replace(/\/+$/, '')
  }
  // Caso contrário, removemos barras no final e concatenamos '/api'
  const cleanUrl = envUrl.replace(/\/+$/, '')
  return `${cleanUrl}/api`
}

const api = axios.create({
  baseURL: getBaseURL(),
})

// Request interceptor to add the JWT access token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
      params: config.params
    })
    return config
  },
  (error) => {
    console.error(`[API Request Error]`, error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh, 401s, and log responses/errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
    return response
  },
  async (error) => {
    console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    })

    const originalRequest = error.config
    
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        console.log(`[API Token Refresh] Tentando atualizar o token de acesso...`)
        const refreshToken = localStorage.getItem('refresh')
        const response = await axios.post(`${api.defaults.baseURL}/users/token/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access', access)
        console.log(`[API Token Refresh] Token atualizado com sucesso!`)
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (err) {
        console.error(`[API Token Refresh Error] Falha ao atualizar o token`, err)
        // Refresh token failed, clear local storage and redirect to login
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
