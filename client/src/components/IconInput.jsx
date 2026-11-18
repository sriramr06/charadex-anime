import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import './IconInput.css'

// A labelled input with an icon on the left.
// Password inputs also get a show/hide button on the right.
function IconInput({ id, label, icon: Icon, type = 'text', hint, ...inputProps }) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <div className={`input-wrap ${isPassword ? 'has-toggle' : ''}`}>
        {Icon && <Icon className="input-icon" aria-hidden="true" />}

        <input id={id} type={inputType} aria-describedby={hintId} {...inputProps} />

        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
          </button>
        )}
      </div>

      {hint && (
        <small id={hintId} className="form-hint">
          {hint}
        </small>
      )}
    </div>
  )
}

export default IconInput
