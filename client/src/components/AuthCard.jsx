import { Link } from 'react-router-dom'
import './AuthCard.css'

// Centered card used by the Login and Register pages
function AuthCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="auth-page">
      <Link to="/" className="brand auth-brand">
        Chara<span>Dex</span>
      </Link>

      <section className="auth-card card">
        {Icon && (
          <div className="auth-icon">
            <Icon aria-hidden="true" />
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle muted">{subtitle}</p>}

        {children}
      </section>
    </div>
  )
}

export default AuthCard
