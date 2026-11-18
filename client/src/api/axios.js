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

// Pull a readable message out of an axios error
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  if (error.request) {
    return 'Cannot reach the server. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export default api
