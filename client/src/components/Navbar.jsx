import { Link } from 'react-router-dom'
import { FiLogOut, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main">
        <Link to="/home" className="brand">
          Chara<span>Dex</span>
        </Link>

        <div className="navbar-links">
          <span className="navbar-user">
            <FiUser aria-hidden="true" />
            {user.displayName || user.username}
          </span>
          <button type="button" className="btn btn-outline btn-icon" onClick={logout}>
            <FiLogOut aria-hidden="true" />
            Log out
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
