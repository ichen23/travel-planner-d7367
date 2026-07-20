import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.response.use(
  res => res.data,
  err => ({ success: false, message: err.message })
)

export default api
