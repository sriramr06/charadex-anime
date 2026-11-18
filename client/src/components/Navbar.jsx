import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiCompass, FiGrid, FiPlus, FiLogOut, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import Avatar from './Avatar'
import './Navbar.css'

// Top bar for all app pages.
// Left: logo + main links. Right: "New character" + user, or log in / sign up.
// On small screens the link text is hidden and only icons show.
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const name = user ? user.displayName || user.username : ''

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main">
        <div className="navbar-left">
          <Link to={user ? '/my-characters' : '/explore'} className="brand">
            Chara<span>Dex</span>
          </Link>

          <div className="navbar-links">
            <NavLink to="/explore" className="navbar-link">
              <FiCompass aria-hidden="true" />
              <span className="nav-label">Explore</span>
            </NavLink>
            {user && (
              <NavLink to="/my-characters" className="navbar-link">
                <FiGrid aria-hidden="true" />
                <span className="nav-label">My Characters</span>
              </NavLink>
            )}
          </div>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/characters/new" className="btn btn-primary btn-icon">
                <FiPlus aria-hidden="true" />
                <span className="nav-label">New character</span>
              </Link>

              <NavLink to="/profile" className="navbar-user" title="Your profile">
                <Avatar user={user} size="sm" />
                <span className="nav-label">{name}</span>
              </NavLink>

              <button
                type="button"
                className="btn btn-outline btn-icon"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
              >
                <FiLogOut aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-icon">
                <FiLogIn aria-hidden="true" />
                <span className="nav-label">Log in</span>
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
