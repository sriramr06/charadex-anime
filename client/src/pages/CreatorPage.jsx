import { useState } from 'react'
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom'
import { FiAlertCircle, FiFeather, FiUsers } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/authContext'
import CreatorInfo from '../components/CreatorInfo'
import CharacterCard from '../components/CharacterCard'
import UserList from '../components/UserList'
import Pagination from '../components/Pagination'
import StatusMessage from '../components/StatusMessage'
import './CreatorPage.css'

// Public page for one creator. Same layout as a character page:
// creator info on the left; on the right, tabs for their characters,
// their followers, and the people they follow.
//   tab: 'characters' | 'followers' | 'following' (set by the route in App.jsx)
function CreatorPage({ tab = 'characters' }) {
  const { username } = useParams()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  // Goes up by 1 after following/unfollowing, so the open list reloads
  const [listVersion, setListVersion] = useState(0)

  const profile = useApi(`/users/${username}`)
  // The right column: one request for whichever tab is open
  const list = useApi(`/users/${username}/${tab}?page=${page}`, listVersion)

  if (profile.loading) {
    return <p className="page muted">Loading creator...</p>
  }

  if (profile.error) {
    return (
      <div className="page">
        <StatusMessage
          icon={FiAlertCircle}
          title="Creator not available"
          role="alert"
          action={
            <Link to="/explore" className="btn btn-outline">
              Back to Explore
            </Link>
          }
        >
          {profile.error}
        </StatusMessage>
      </div>
    )
  }

  const creator = profile.data.creator
  const isMe = user && user._id === creator._id
  const base = `/creators/${creator.username}`

  const handlePageChange = (newPage) => {
    setSearchParams(newPage > 1 ? { page: newPage } : {})
    window.scrollTo({ top: 0 })
  }

  // Messages for an empty list on each tab
  const emptyMessages = {
    characters: {
      icon: FiFeather,
      title: 'No characters yet',
      text: isMe
        ? 'Characters you create will appear here.'
        : 'This creator has not published any characters yet.',
    },
    followers: {
      icon: FiUsers,
      title: 'No followers yet',
      text: isMe ? 'When people follow you, they will appear here.' : 'Be the first to follow.',
    },
    following: {
      icon: FiUsers,
      title: 'Not following anyone yet',
      text: isMe
        ? 'Creators you follow will appear here.'
        : 'This creator is not following anyone yet.',
    },
  }

  const items = list.data ? list.data[tab === 'characters' ? 'characters' : 'users'] : []
  const empty = emptyMessages[tab]

  return (
    <div className="page">
      <div className="creator-layout">
        {/* Left: who they are. key = fresh follow state per creator */}
        <aside className="creator-aside">
          <CreatorInfo
            key={creator._id}
            data={profile.data}
            onFollowChange={() => setListVersion((v) => v + 1)}
          />
        </aside>

        {/* Right: tabs + the chosen list */}
        <section className="creator-main">
          <nav className="creator-tabs" aria-label={`${creator.username}'s pages`}>
            <NavLink to={base} end className="creator-tab">
              Characters
            </NavLink>
            <NavLink to={`${base}/followers`} className="creator-tab">
              Followers
            </NavLink>
            <NavLink to={`${base}/following`} className="creator-tab">
              Following
            </NavLink>
          </nav>

          {list.loading && <p className="muted">Loading...</p>}

          {list.error && (
            <StatusMessage icon={FiAlertCircle} title="Could not load this list" role="alert">
              {list.error}
            </StatusMessage>
          )}

          {list.data &&
            (items.length === 0 ? (
              <StatusMessage icon={empty.icon} title={empty.title}>
                {empty.text}
              </StatusMessage>
            ) : (
              <>
                {tab === 'characters' ? (
                  <div className="character-grid">
                    {items.map((character) => (
                      <CharacterCard key={character._id} character={character} showCreator={false} />
                    ))}
                  </div>
                ) : (
                  <UserList users={items} />
                )}

                <Pagination
                  page={list.data.page}
                  totalPages={list.data.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ))}
        </section>
      </div>
    </div>
  )
}

export default CreatorPage
