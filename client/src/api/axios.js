import axios from 'axios'

// One shared axios instance for every API call.
// In development, Vite forwards "/api" requests to the Express server (see vite.config.js).
const api = axios.create({
  baseURL: '/api',
})

// Attach the JWT (if the user is logged in) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
