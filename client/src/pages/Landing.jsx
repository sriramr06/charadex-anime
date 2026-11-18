import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import './Landing.css'

function Landing() {
  return (
    <main className="landing">
      <div className="landing-content">
        <p className="brand landing-brand">
          Chara<span>Dex</span>
        </p>

        <h1>Every original character deserves a home.</h1>

        <p className="landing-text muted">
          Build structured profiles for your OCs: artwork, personality, abilities, and backstory,
          all in one place. Then explore characters made by other creators.
        </p>

        <Link to="/register" className="btn btn-primary btn-icon landing-cta">
          Enter Anime Verse
          <FiArrowRight aria-hidden="true" />
        </Link>

        <p className="landing-login muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  )
}

export default Landing
