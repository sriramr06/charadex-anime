import { useEffect, useState } from 'react'
import api from '../api/axios'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // True while we check a saved token on first page load.
  // If there is no saved token, there is nothing to check.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // On first load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token is invalid or expired, so forget it
        localStorage.removeItem('token')
      })
      .finally(() => setLoading(false))
  }, [])

  // Save the token and user after a successful login/register
  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data)
  }

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    saveSession(res.data)
  }

  // Basic JWT logout: just forget the token on the client
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = { user, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
