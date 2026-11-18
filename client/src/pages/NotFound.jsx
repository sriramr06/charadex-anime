import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="page">
      <h1>Page not found</h1>
      <p className="muted">
        The page you are looking for does not exist. <Link to="/">Go home</Link>
      </p>
    </main>
  )
}

export default NotFound
