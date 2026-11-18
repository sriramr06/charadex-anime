import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUserPlus, FiUserCheck, FiEdit2 } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import { followCreator, unfollowCreator } from '../api/social'
import { getErrorMessage } from '../api/axios'
import { formatDate } from '../utils/formatDate'
import Avatar from './Avatar'
import './CreatorInfo.css'

// Left column of a creator page: avatar, name, bio, counts, and the
// Follow button (or "Edit profile" on your own page).
//   data = { creator, followerCount, followingCount, characterCount, followedByMe }
//   onFollowChange = called after following/unfollowing (to refresh lists)
function CreatorInfo({ data, onFollowChange }) {
  const { user } = useAuth()
  const { creator } = data

  const [following, setFollowing] = useState(data.followedByMe)
  const [followerCount, setFollowerCount] = useState(data.followerCount)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isMe = user && user._id === creator._id
  const name = creator.displayName || creator.username

  const handleFollow = async () => {
    setBusy(true)
    setError('')
    try {
      const result = following
        ? await unfollowCreator(creator.username)
        : await followCreator(creator.username)
      setFollowing(result.following)
      setFollowerCount(result.followerCount)
      if (onFollowChange) onFollowChange()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  let action
  if (isMe) {
    action = (
      <Link to="/profile" className="btn btn-outline btn-icon btn-block">
        <FiEdit2 aria-hidden="true" />
        Edit profile
      </Link>
    )
  } else if (!user) {
    action = (
      <Link to="/login" className="btn btn-primary btn-icon btn-block">
        <FiUserPlus aria-hidden="true" />
        Log in to follow
      </Link>
    )
  } else {
    action = (
      <button
        type="button"
        className={`btn btn-icon btn-block ${following ? 'btn-outline' : 'btn-primary'}`}
        onClick={handleFollow}
        disabled={busy}
        aria-pressed={following}
      >
        {following ? <FiUserCheck aria-hidden="true" /> : <FiUserPlus aria-hidden="true" />}
        {following ? 'Following' : 'Follow'}
      </button>
    )
  }

  return (
    <div className="creator-info">
      <Avatar user={creator} size="lg" />

      <h1 className="creator-name">{name}</h1>
      <p className="creator-handle muted">
        @{creator.username} · Joined {formatDate(creator.createdAt)}
      </p>

      {creator.bio && <p className="creator-bio">{creator.bio}</p>}

      <dl className="creator-stats">
        <div>
          <dd>{data.characterCount}</dd>
          <dt>{data.characterCount === 1 ? 'Character' : 'Characters'}</dt>
        </div>
        <div>
          <dd>{followerCount}</dd>
          <dt>{followerCount === 1 ? 'Follower' : 'Followers'}</dt>
        </div>
        <div>
          <dd>{data.followingCount}</dd>
          <dt>Following</dt>
        </div>
      </dl>

      {action}

      {error && (
        <p className="form-error creator-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default CreatorInfo
