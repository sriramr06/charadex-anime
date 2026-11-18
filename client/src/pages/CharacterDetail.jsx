import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/authContext'
import { deleteCharacter } from '../api/characters'
import { getErrorMessage } from '../api/axios'
import { formatDate } from '../utils/formatDate'
import CharacterImage from '../components/CharacterImage'
import Avatar from '../components/Avatar'
import StatusMessage from '../components/StatusMessage'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import './CharacterDetail.css'

function CharacterDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error } = useApi(`/characters/${id}`)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  if (loading) {
    return <p className="page muted">Loading character...</p>
  }

  if (error) {
    return (
      <div className="page">
        <StatusMessage
          icon={FiAlertCircle}
          title="Character not available"
          role="alert"
          action={
            <Link to="/explore" className="btn btn-outline">
              Back to Explore
            </Link>
          }
        >
          {error}
        </StatusMessage>
      </div>
    )
  }

  const character = data.character
  const creator = character.creator
  const isOwner = user && creator && creator._id === user._id
  const hasDetails =
    character.personality || character.abilities.length > 0 || character.backstory

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${character.name}"? This cannot be undone.`)) return

    setDeleting(true)
    setDeleteError('')
    try {
      await deleteCharacter(character._id)
      navigate('/my-characters')
    } catch (err) {
      setDeleteError(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <Link to={isOwner ? '/my-characters' : '/explore'} className="back-link">
        <FiArrowLeft aria-hidden="true" />
        {isOwner ? 'My Characters' : 'Explore'}
      </Link>

      <article className="detail-layout">
        {/* Left: artwork */}
        <aside className="detail-media">
          <CharacterImage image={character.image} name={character.name} size="detail" />
        </aside>

        {/* Right: information */}
        <div className="detail-body">
          <header className="detail-header">
            <div>
              <h1>{character.name}</h1>
              <p className="detail-meta muted">
                <Avatar user={creator} size="sm" />
                <span>
                  by{' '}
                  {creator ? (
                    <Link to={`/creators/${creator.username}`} className="creator-link">
                      @{creator.username}
                    </Link>
                  ) : (
                    '@unknown'
                  )}{' '}
                  · Created {formatDate(character.createdAt)}
                </span>
              </p>
              <div className="detail-like">
                <LikeButton
                  key={character._id}
                  characterId={character._id}
                  initialLiked={data.likedByMe}
                  initialCount={data.likeCount}
                />
              </div>
            </div>

            {isOwner && (
              <div className="detail-actions">
                <Link to={`/characters/${character._id}/edit`} className="btn btn-outline btn-icon">
                  <FiEdit2 aria-hidden="true" />
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <FiTrash2 aria-hidden="true" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </header>

          {deleteError && (
            <p className="form-error" role="alert">
              {deleteError}
            </p>
          )}

          {character.description && <p className="detail-description">{character.description}</p>}

          {character.personality && (
            <section className="detail-section">
              <h2>Personality</h2>
              <p className="detail-text">{character.personality}</p>
            </section>
          )}

          {character.abilities.length > 0 && (
            <section className="detail-section">
              <h2>Abilities</h2>
              <ul className="ability-list">
                {character.abilities.map((ability, index) => (
                  <li key={index} className="ability">
                    <h3>{ability.name}</h3>
                    {ability.description && (
                      <p className="detail-text muted">{ability.description}</p>
                    )}

                    {ability.techniques.length > 0 && (
                      <ul className="technique-list">
                        {ability.techniques.map((tech, t) => (
                          <li key={t}>
                            <span className="technique-name">{tech.name}</span>
                            {tech.description && (
                              <span className="muted"> — {tech.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {character.backstory && (
            <section className="detail-section">
              <h2>Backstory</h2>
              <p className="detail-text">{character.backstory}</p>
            </section>
          )}

          {!hasDetails && (
            <p className="muted detail-empty">
              {isOwner
                ? 'Add personality, abilities, and a backstory to bring this character to life.'
                : 'The creator has not added more details yet.'}
            </p>
          )}

          <CommentSection key={character._id} characterId={character._id} />
        </div>
      </article>
    </div>
  )
}

export default CharacterDetail
