import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import './UserList.css'

// A list of people (followers / following). Each row links to their creator page.
function UserList({ users }) {
  return (
    <ul className="user-list">
      {users.map((person) => (
        <li key={person._id}>
          <Link to={`/creators/${person.username}`} className="user-row">
            <Avatar user={person} size="md" />
            <span className="user-row-text">
              <span className="user-row-name">{person.displayName || person.username}</span>
              <span className="user-row-handle muted">@{person.username}</span>
              {person.bio && <span className="user-row-bio muted">{person.bio}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default UserList
