import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/authContext'
import GuestRoute from './components/GuestRoute.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Explore from './pages/Explore.jsx'
import MyCharacters from './pages/MyCharacters.jsx'
import CharacterDetail from './pages/CharacterDetail.jsx'
import CreateCharacter from './pages/CreateCharacter.jsx'
import EditCharacter from './pages/EditCharacter.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  const { loading } = useAuth()

  // Wait until we know whether the saved token is still valid
  if (loading) {
    return <p className="page muted">Loading...</p>
  }

  return (
    <Routes>
      {/* Logged-out visitors only, no navbar */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* App pages with the navbar */}
      <Route element={<AppLayout />}>
        {/* Public: anyone can browse */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/characters/:id" element={<CharacterDetail />} />

        {/* Logged-in users only */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-characters" element={<MyCharacters />} />
          <Route path="/characters/new" element={<CreateCharacter />} />
          <Route path="/characters/:id/edit" element={<EditCharacter />} />
        </Route>
      </Route>

      {/* Old address from before; keeps any saved links working */}
      <Route path="/home" element={<Navigate to="/my-characters" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
