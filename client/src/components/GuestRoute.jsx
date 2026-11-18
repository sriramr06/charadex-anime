import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext'

// Pages for logged-out visitors only (landing, login, register).
// Logged-in users are sent to their home page instead.
function GuestRoute() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}

export default GuestRoute
