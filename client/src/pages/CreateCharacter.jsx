import PageHeader from '../components/PageHeader'
import CharacterForm from '../components/CharacterForm'

function CreateCharacter() {
  return (
    <div className="page">
      <PageHeader title="New character" subtitle="Only the name is required. You can add more later." />
      <CharacterForm />
    </div>
  )
}

export default CreateCharacter
