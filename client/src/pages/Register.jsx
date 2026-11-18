import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUserPlus, FiMail, FiLock, FiAtSign, FiArrowLeft } from 'react-icons/fi'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/authContext'
import AuthCard from '../components/AuthCard'
import IconInput from '../components/IconInput'

// Two-step sign up:
//   Step 1: email + password  ->  "Sign up"
//   Step 2: choose a username ->  "Create account" (the account is created here)
function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ----- Step 1: email and password -----
  const validateStep1 = () => {
    const { email, password, confirmPassword } = formData

    if (!email || !password || !confirmPassword) {
      return 'Please fill in all fields.'
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return 'Please enter a valid email address.'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  const handleStep1 = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateStep1()
    if (validationError) {
      setError(validationError)
      return
    }

    // Check the email now so the user doesn't find out at the end
    setSubmitting(true)
    try {
      const res = await api.post('/auth/check-email', { email: formData.email })
      if (!res.data.available) {
        setError('This email is already registered. Try logging in instead.')
        return
      }
      setStep(2)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // ----- Step 2: username, then create the account -----
  const validateStep2 = () => {
    const { username } = formData

    if (!username) {
      return 'Please choose a username.'
    }
    if (username.length < 3 || username.length > 20) {
      return 'Username must be 3–20 characters.'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores.'
    }
    return ''
  }

  const handleStep2 = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateStep2()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      await register(formData.username, formData.email, formData.password)
      navigate('/my-characters')
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  const goBack = () => {
    setError('')
    setStep(1)
  }

  return (
    <AuthCard
      icon={step === 1 ? FiUserPlus : FiAtSign}
      title={step === 1 ? 'Create your account' : 'Choose a username'}
      subtitle={
        step === 1
          ? 'Start building your character collection.'
          : 'This is how other creators will find you.'
      }
    >
      {/* Step indicator */}
      <div className="auth-steps" aria-hidden="true">
        <span className="auth-step active" />
        <span className={`auth-step ${step === 2 ? 'active' : ''}`} />
      </div>
      <p className="auth-step-label">Step {step} of 2</p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {step === 1 ? (
        <form onSubmit={handleStep1} noValidate>
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
          />

          <IconInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            icon={FiLock}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Checking...' : 'Sign up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleStep2} noValidate>
          <IconInput
            id="username"
            name="username"
            label="Username"
            icon={FiAtSign}
            autoComplete="username"
            placeholder="e.g. inkfox"
            hint="3–20 characters: letters, numbers, and underscores."
            value={formData.username}
            onChange={handleChange}
            autoFocus
          />

          <div className="auth-actions">
            <button type="button" className="btn btn-outline btn-icon" onClick={goBack}>
              <FiArrowLeft aria-hidden="true" />
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      )}

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthCard>
  )
}

export default Register
