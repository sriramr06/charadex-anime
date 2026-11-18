import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import { likeCharacter, unlikeCharacter } from '../api/social'
import { getErrorMessage } from '../api/axios'
import './LikeButton.css'

// Like / unlike toggle with the like count.
// Visitors see the count and a link to log in.
function LikeButton({ characterId, initialLiked, initialCount }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const label = `${count} ${count === 1 ? 'like' : 'likes'}`

  if (!user) {
    return (
      <Link to="/login" className="like-button" title="Log in to like this character">
        <FiHeart aria-hidden="true" />
        {label}
      </Link>
    )
  }

  const handleClick = async () => {
    setBusy(true)
    setError('')
    try {
      // The server answers with the real state, so we just copy it
      const result = liked ? await unlikeCharacter(characterId) : await likeCharacter(characterId)
      setLiked(result.liked)
      setCount(result.likeCount)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="like-wrap">
      <button
        type="button"
        className={`like-button ${liked ? 'liked' : ''}`}
        onClick={handleClick}
        disabled={busy}
        aria-pressed={liked}
      >
        <FiHeart aria-hidden="true" />
        {liked ? 'Liked' : 'Like'} · {label}
      </button>
      {error && (
        <span className="like-error" role="alert">
          {error}
        </span>
      )}
    </span>
  )
}

export default LikeButton
