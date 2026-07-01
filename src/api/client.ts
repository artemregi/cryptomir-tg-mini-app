import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-railway-app.up.railway.app'

const client = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData || ''
  config.headers.Authorization = `tma ${initData}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Invalid initData')
    }
    return Promise.reject(error)
  }
)

export default client
