import { createContext, useContext } from 'react'

// The context object. AuthProvider.jsx fills it with values.
export const AuthContext = createContext(null)

// Small helper so components can write: const { user, login } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
