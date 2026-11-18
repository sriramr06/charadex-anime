import { Link, useLocation, useParams } from 'react-router-dom'
import { FiAlertCircle, FiLock } from 'react-icons/fi'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/authContext'
import PageHeader from '../components/PageHeader'
import CharacterForm from '../components/CharacterForm'
import StatusMessage from '../components/StatusMessage'

function EditCharacter() {
  const { id } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const { data, loading, error } = useApi(`/characters/${id}`)

  // An error passed from the create page (e.g. image upload failed)
  const passedError = location.state?.error || ''

  if (loading) {
    return <p className="page muted">Loading character...</p>
  }

  if (error) {
    return (
      <div className="page">
        <StatusMessage icon={FiAlertCircle} title="Character not available" role="alert">
          {error}
        </StatusMessage>
      </div>
    )
  }

  const character = data.character

  // The server also blocks this; this just shows a friendly message
  if (character.creator?._id !== user._id) {
    return (
      <div className="page">
        <StatusMessage
          icon={FiLock}
          title="You can only edit your own characters"
          action={
            <Link to={`/characters/${id}`} className="btn btn-outline">
              View character
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title={`Edit ${character.name}`} subtitle="Changes are saved when you click Save." />
      {/* key: start a fresh form if we move to a different character */}
      <CharacterForm key={character._id} character={character} initialError={passedError} />
    </div>
  )
}

export default EditCharacter
