import { Link } from 'react-router-dom'
import { FiPlus, FiFeather, FiAlertCircle } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import PageHeader from '../components/PageHeader'
import CharacterCard from '../components/CharacterCard'
import StatusMessage from '../components/StatusMessage'

function MyCharacters() {
  const { data, loading, error } = useApi('/characters/mine')

  const count = data ? data.characters.length : 0
  const subtitle = data
    ? `${count} ${count === 1 ? 'character' : 'characters'} in your collection`
    : 'Your character collection'

  // The navbar already has a "New character" button on every page,
  // so it is only repeated here inside the empty state.
  const newButton = (
    <Link to="/characters/new" className="btn btn-primary btn-icon">
      <FiPlus aria-hidden="true" />
      Create your first character
    </Link>
  )

  return (
    <div className="page">
      <PageHeader title="My Characters" subtitle={subtitle} />

      {loading && <p className="muted">Loading your characters...</p>}

      {error && (
        <StatusMessage icon={FiAlertCircle} title="Could not load your characters" role="alert">
          {error}
        </StatusMessage>
      )}

      {data &&
        (count === 0 ? (
          <StatusMessage icon={FiFeather} title="No characters yet" action={newButton}>
            Create your first original character: give them a name, a look, and a story.
          </StatusMessage>
        ) : (
          <div className="character-grid">
            {data.characters.map((character) => (
              <CharacterCard key={character._id} character={character} showCreator={false} />
            ))}
          </div>
        ))}
    </div>
  )
}

export default MyCharacters
