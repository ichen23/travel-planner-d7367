import axios from 'axios'

const api = axios.create({
  baseURL: 'https://travel-planner-production-d703.up.railway.app/api',
  timeout: 15000,
})

api.interceptors.response.use(
  res => res.data,
  err => ({ success: false, message: err.message })
)

export default api
