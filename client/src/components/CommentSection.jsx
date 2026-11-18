import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiTrash2, FiMessageSquare } from 'react-icons/fi'
import { useAuth } from '../context/authContext'
import { getComments, addComment, deleteComment } from '../api/social'
import { getErrorMessage } from '../api/axios'
import { formatDate } from '../utils/formatDate'
import Avatar from './Avatar'
import './CommentSection.css'

const MAX_LENGTH = 500

// Comments for one character: a form to post (when logged in),
// the list newest first, and a "Load more" button for older ones.
function CommentSection({ characterId }) {
  const { user } = useAuth()

  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [formError, setFormError] = useState('')

  // Load the first page when the section appears
  useEffect(() => {
    getComments(characterId, 1)
      .then((data) => {
        setComments(data.comments)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [characterId])

  const loadMore = async () => {
    setLoading(true)
    try {
      const data = await getComments(characterId, page + 1)
      // Skip any comment we already have (new comments can shift pages)
      setComments((current) => {
        const ids = new Set(current.map((c) => c._id))
        return [...current, ...data.comments.filter((c) => !ids.has(c._id))]
      })
      setPage(page + 1)
      setTotalPages(data.totalPages)
    } catch (err) {
      setLoadError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!text.trim()) {
      setFormError('Write something before posting.')
      return
    }

    setPosting(true)
    try {
      const comment = await addComment(characterId, text)
      setComments([comment, ...comments]) // newest goes on top
      setTotal(total + 1)
      setText('')
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(commentId)
      setComments(comments.filter((c) => c._id !== commentId))
      setTotal(total - 1)
    } catch (err) {
      setLoadError(getErrorMessage(err))
    }
  }

  return (
    <section className="detail-section comment-section" aria-labelledby="comments-title">
      <h2 id="comments-title">
        Comments <span className="muted comment-count">({total})</span>
      </h2>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit} noValidate>
          <Avatar user={user} size="sm" />
          <div className="comment-form-body">
            <label htmlFor="comment-text" className="sr-only">
              Write a comment
            </label>
            <textarea
              id="comment-text"
              rows={3}
              maxLength={MAX_LENGTH}
              placeholder="Share your thoughts about this character"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <div className="comment-form-footer">
              <small className="form-hint">
                {text.length}/{MAX_LENGTH}
              </small>
              <button type="submit" className="btn btn-primary" disabled={posting || !text.trim()}>
                {posting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="comment-login muted">
          <Link to="/login">Log in</Link> to join the conversation.
        </p>
      )}

      {loadError && (
        <p className="form-error" role="alert">
          {loadError}
        </p>
      )}

      {!loading && comments.length === 0 && !loadError && (
        <p className="comment-empty muted">
          <FiMessageSquare aria-hidden="true" />
          No comments yet. {user ? 'Be the first to say something.' : ''}
        </p>
      )}

      <ul className="comment-list">
        {comments.map((comment) => {
          const author = comment.author
          const isAuthor = user && author && author._id === user._id

          return (
            <li key={comment._id} className="comment">
              <Avatar user={author} size="sm" />
              <div className="comment-body">
                <p className="comment-meta">
                  {author ? (
                    <Link to={`/creators/${author.username}`} className="comment-author">
                      {author.displayName || author.username}
                    </Link>
                  ) : (
                    <span className="comment-author">Deleted user</span>
                  )}
                  {author && <span className="muted">@{author.username}</span>}
                  <span className="muted">· {formatDate(comment.createdAt)}</span>
                </p>
                <p className="comment-text">{comment.text}</p>
              </div>

              {isAuthor && (
                <button
                  type="button"
                  className="icon-button comment-delete"
                  onClick={() => handleDelete(comment._id)}
                  aria-label="Delete your comment"
                  title="Delete"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {loading && <p className="muted">Loading comments...</p>}

      {!loading && page < totalPages && (
        <button type="button" className="btn btn-outline" onClick={loadMore}>
          Load older comments
        </button>
      )}
    </section>
  )
}

export default CommentSection
