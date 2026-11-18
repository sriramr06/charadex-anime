import { useAuth } from '../context/authContext'

// Placeholder page after login. Characters will be listed here later.
function Home() {
  const { user } = useAuth()

  return (
    <section className="page">
      <h1>Welcome, {user.displayName || user.username}</h1>
      <p className="muted">Your characters will appear here soon.</p>
    </section>
  )
}

export default Home
