import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FiAlertCircle, FiFeather } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/authContext'
import CreatorInfo from '../components/CreatorInfo'
import CharacterCard from '../components/CharacterCard'
import Pagination from '../components/Pagination'
import StatusMessage from '../components/StatusMessage'
import './CreatorPage.css'

// Public page for one creator. Same layout as a character page:
// creator info on the left, their characters on the right.
function CreatorPage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  const profile = useApi(`/users/${username}`)
  const characters = useApi(`/users/${username}/characters?page=${page}`)

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

  const handlePageChange = (newPage) => {
    setSearchParams(newPage > 1 ? { page: newPage } : {})
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="page">
      <div className="creator-layout">
        {/* Left: who they are. key = fresh follow state per creator */}
        <aside className="creator-aside">
          <CreatorInfo key={creator._id} data={profile.data} />
        </aside>

        {/* Right: their characters */}
        <section className="creator-main" aria-labelledby="creator-characters-title">
          <h2 id="creator-characters-title" className="creator-section-title">
            Characters
          </h2>

          {characters.loading && <p className="muted">Loading characters...</p>}

          {characters.error && (
            <StatusMessage icon={FiAlertCircle} title="Could not load characters" role="alert">
              {characters.error}
            </StatusMessage>
          )}

          {characters.data &&
            (characters.data.characters.length === 0 ? (
              <StatusMessage icon={FiFeather} title="No characters yet">
                {isMe
                  ? 'Characters you create will appear here.'
                  : 'This creator has not published any characters yet.'}
              </StatusMessage>
            ) : (
              <>
                <div className="character-grid">
                  {characters.data.characters.map((character) => (
                    <CharacterCard key={character._id} character={character} showCreator={false} />
                  ))}
                </div>
                <Pagination
                  page={characters.data.page}
                  totalPages={characters.data.totalPages}
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
