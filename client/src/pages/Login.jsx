import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import { getErrorMessage } from '../api/axios'
import AuthCard from '../components/AuthCard'
import IconInput from '../components/IconInput'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.')
      return
    }

    setSubmitting(true)
    try {
      await login(formData.email, formData.password)
      navigate('/my-characters')
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthCard icon={FiLogIn} title="Welcome back" subtitle="Log in to continue to CharaDex.">
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <IconInput
          id="email"
          name="email"
          label="Email"
          type="email"
          icon={FiMail}
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
        />

        <IconInput
          id="password"
          name="password"
          label="Password"
          type="password"
          icon={FiLock}
          autoComplete="current-password"
          placeholder="Your password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="auth-switch">
        New to CharaDex? <Link to="/register">Create an account</Link>
      </p>
    </AuthCard>
  )
}

export default Login
