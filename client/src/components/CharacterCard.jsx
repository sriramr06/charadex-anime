import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import CharacterImage from './CharacterImage'
import TagList from './TagList'
import './CharacterCard.css'

// One character in a grid. The whole card links to the detail page.
function CharacterCard({ character, showCreator = true }) {
  const likeLabel = character.likeCount === 1 ? 'like' : 'likes'

  return (
    <Link to={`/characters/${character._id}`} className="character-card card">
      <CharacterImage image={character.image} name={character.name} alt="" />

      <div className="character-card-body">
        <h3 className="character-card-name">{character.name}</h3>
        {character.description && (
          <p className="character-card-description muted">{character.description}</p>
        )}
        {character.tags?.length > 0 && (
          <div className="character-card-tags">
            <TagList tags={character.tags} max={3} />
          </div>
        )}

        {/* Footer: creator on the left, likes on the right */}
        <div className="character-card-footer muted">
          {showCreator && character.creator && <span>@{character.creator.username}</span>}
          {character.likeCount !== undefined && (
            <span className="character-card-likes" title={likeLabel}>
              <FiHeart aria-hidden="true" />
              {character.likeCount}
              <span className="sr-only"> {likeLabel}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CharacterCard
