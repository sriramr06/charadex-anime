import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext'

// Pages for logged-in users only. Everyone else goes to the landing page.
// (This also handles logout: once the user is cleared, this redirect runs.)
function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
