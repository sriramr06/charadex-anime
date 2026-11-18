import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { MAX_TAGS, normalizeTag, validateTag } from '../utils/tags'
import './Tags.css'

// Type a tag and press Enter or comma to add it as a chip.
// Backspace in an empty box removes the last tag.
//   <TagInput tags={tags} onChange={setTags} />
function TagInput({ tags, onChange }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const addTag = () => {
    const tag = normalizeTag(text)
    if (!tag) return

    if (tags.includes(tag)) {
      setText('') // already there, nothing to do
      return
    }
    if (tags.length >= MAX_TAGS) {
      setError(`You can add up to ${MAX_TAGS} tags.`)
      return
    }
    const problem = validateTag(tag)
    if (problem) {
      setError(problem)
      return
    }

    onChange([...tags, tag])
    setText('')
    setError('')
  }

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
    setError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault() // don't submit the form or type the comma
      addTag()
    } else if (e.key === 'Backspace' && text === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="form-group">
      <label htmlFor="tag-input">Tags</label>

      <div className="tag-input">
        {tags.map((tag) => (
          <span key={tag} className="tag tag-removable">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              <FiX aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          id="tag-input"
          type="text"
          maxLength={40}
          placeholder={tags.length === 0 ? 'e.g. swordswoman, sky pirate' : 'Add a tag'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          disabled={tags.length >= MAX_TAGS}
          aria-describedby="tag-hint"
        />
      </div>

      {error ? (
        <small id="tag-hint" className="form-hint tag-error" role="alert">
          {error}
        </small>
      ) : (
        <small id="tag-hint" className="form-hint">
          Press Enter or comma to add. {tags.length}/{MAX_TAGS} tags. Tags help others find your
          character.
        </small>
      )}
    </div>
  )
}

export default TagInput
