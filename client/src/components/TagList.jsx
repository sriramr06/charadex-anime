import { Link } from 'react-router-dom'
import './Tags.css'

// Shows tags as chips.
//   linked: each chip opens Explore filtered by that tag
//   max:    show only the first few (used on cards)
function TagList({ tags, linked = false, max }) {
  if (!tags || tags.length === 0) return null

  const shown = max ? tags.slice(0, max) : tags
  const hidden = tags.length - shown.length

  return (
    <ul className="tag-list" aria-label="Tags">
      {shown.map((tag) => (
        <li key={tag}>
          {linked ? (
            <Link to={`/explore?tag=${encodeURIComponent(tag)}`} className="tag tag-link">
              {tag}
            </Link>
          ) : (
            <span className="tag">{tag}</span>
          )}
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <span className="tag tag-more">+{hidden}</span>
        </li>
      )}
    </ul>
  )
}

export default TagList
