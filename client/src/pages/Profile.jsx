import { useEffect, useMemo, useRef, useState } from 'react'
import { FiUpload, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import { getErrorMessage } from '../api/axios'
import { updateProfile, uploadAvatar, removeAvatar } from '../api/users'
import { validateImage } from '../utils/validateImage'
import { formatDate } from '../utils/formatDate'
import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'
import './Profile.css'

// Edit your own profile. Same layout as the character form:
// picture on the left, details on the right, one Save button.
function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  // Temporary URL to preview a newly chosen avatar
  const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const hasAvatar = Boolean(previewUrl) || (Boolean(user.avatar?.url) && !avatarRemoved)

  const handleFileChange = (e) => {
    const chosen = e.target.files[0]
    e.target.value = ''
    if (!chosen) return

    const problem = validateImage(chosen)
    if (problem) {
      setError(problem)
      setSuccess('')
      return
    }
    setError('')
    setAvatarFile(chosen)
    setAvatarRemoved(false)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarRemoved(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    // Step 1: save display name and bio
    let latestUser
    try {
      latestUser = await updateProfile({ displayName, bio })
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
      return
    }

    // Step 2: upload or remove the avatar if it changed
    try {
      if (avatarFile) {
        latestUser = await uploadAvatar(avatarFile)
      } else if (avatarRemoved && user.avatar?.url) {
        latestUser = await removeAvatar()
      }
      setSuccess('Profile saved.')
    } catch (err) {
      setError(`Details saved, but the avatar could not be updated: ${getErrorMessage(err)}`)
    }

    // Update the logged-in user everywhere (navbar etc.)
    updateUser(latestUser)
    setDisplayName(latestUser.displayName || '')
    setBio(latestUser.bio || '')
    setAvatarFile(null)
    setAvatarRemoved(false)
    setSaving(false)
  }

  return (
    <div className="page">
      <PageHeader
        title="Your profile"
        subtitle={`Member since ${formatDate(user.createdAt)}`}
      />

      <form className="profile-layout" onSubmit={handleSubmit} noValidate>
        {/* Left: avatar */}
        <aside className="profile-avatar">
          <p className="picker-label">Avatar</p>
          <Avatar user={avatarRemoved ? { ...user, avatar: null } : user} size="lg" src={previewUrl} />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            hidden
          />

          <div className="picker-actions">
            <button
              type="button"
              className="btn btn-outline btn-icon"
              onClick={() => fileInputRef.current.click()}
            >
              <FiUpload aria-hidden="true" />
              {hasAvatar ? 'Change' : 'Upload'}
            </button>
            {hasAvatar && (
              <button type="button" className="btn btn-outline btn-icon" onClick={handleRemoveAvatar}>
                <FiTrash2 aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
          <small className="form-hint">JPG, PNG, or WEBP. Max 2 MB.</small>
        </aside>

        {/* Right: details */}
        <div className="profile-main">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="form-success" role="status">
              {success}
            </p>
          )}

          <section className="form-section card">
            <h2>Account</h2>
            <dl className="profile-account">
              <div>
                <dt>Username</dt>
                <dd>@{user.username}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
            <small className="form-hint">Username and email can&apos;t be changed yet.</small>
          </section>

          <section className="form-section card">
            <h2>Public profile</h2>

            <div className="form-group">
              <label htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                type="text"
                maxLength={50}
                placeholder={user.username}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                aria-describedby="displayName-hint"
              />
              <small id="displayName-hint" className="form-hint">
                Shown instead of your username. Leave empty to use @{user.username}.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                rows={4}
                maxLength={300}
                placeholder="Tell other creators about yourself and your characters"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                aria-describedby="bio-count"
              />
              <small id="bio-count" className="form-hint">
                {bio.length}/300
              </small>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Profile
