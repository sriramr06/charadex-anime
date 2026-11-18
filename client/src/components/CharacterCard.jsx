import { Link } from 'react-router-dom'
import CharacterImage from './CharacterImage'
import './CharacterCard.css'

// One character in a grid. The whole card links to the detail page.
function CharacterCard({ character, showCreator = true }) {
  return (
    <Link to={`/characters/${character._id}`} className="character-card card">
      <CharacterImage image={character.image} name={character.name} alt="" />

      <div className="character-card-body">
        <h3 className="character-card-name">{character.name}</h3>
        {character.description && (
          <p className="character-card-description muted">{character.description}</p>
        )}
        {showCreator && character.creator && (
          <p className="character-card-creator muted">@{character.creator.username}</p>
        )}
      </div>
    </Link>
  )
}

export default CharacterCard
