import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/axios'
import {
  createCharacter,
  updateCharacter,
  uploadCharacterImage,
  removeCharacterImage,
} from '../api/characters'
import ImagePicker from './ImagePicker'
import AbilitiesEditor from './AbilitiesEditor'
import './CharacterForm.css'

// Make sure every ability/technique has all fields (older data may not)
const normalizeAbilities = (abilities = []) =>
  abilities.map((ability) => ({
    name: ability.name || '',
    description: ability.description || '',
    techniques: (ability.techniques || []).map((tech) => ({
      name: tech.name || '',
      description: tech.description || '',
    })),
  }))

// Trim text and drop completely empty rows before sending to the server
const cleanAbilities = (abilities) =>
  abilities
    .map((ability) => ({
      name: ability.name.trim(),
      description: ability.description.trim(),
      techniques: ability.techniques
        .map((tech) => ({ name: tech.name.trim(), description: tech.description.trim() }))
        .filter((tech) => tech.name || tech.description),
    }))
    .filter((ability) => ability.name || ability.description || ability.techniques.length > 0)

// Shared form for creating and editing a character.
// Layout matches the detail page: artwork on the left, details on the right.
function CharacterForm({ character, initialError = '' }) {
  const navigate = useNavigate()
  const isEdit = Boolean(character)

  const [fields, setFields] = useState({
    name: character?.name || '',
    description: character?.description || '',
    personality: character?.personality || '',
    backstory: character?.backstory || '',
  })
  const [abilities, setAbilities] = useState(normalizeAbilities(character?.abilities))
  const [imageFile, setImageFile] = useState(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [error, setError] = useState(initialError)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value })
  }

  const handleImageChange = (file, removed) => {
    setImageFile(file)
    setImageRemoved(removed)
  }

  const showError = (message) => {
    setError(message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validate = (cleaned) => {
    if (!fields.name.trim()) return 'Please give your character a name.'
    for (let i = 0; i < cleaned.length; i++) {
      if (!cleaned[i].name) return `Ability ${i + 1} needs a name.`
      if (cleaned[i].techniques.some((tech) => !tech.name)) {
        return `Every technique in ability ${i + 1} needs a name.`
      }
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanedAbilities = cleanAbilities(abilities)
    const validationError = validate(cleanedAbilities)
    if (validationError) {
      showError(validationError)
      return
    }

    const data = {
      name: fields.name.trim(),
      description: fields.description.trim(),
      personality: fields.personality.trim(),
      backstory: fields.backstory.trim(),
      abilities: cleanedAbilities,
    }

    setSaving(true)

    // Step 1: save the text fields
    let saved
    try {
      saved = isEdit ? await updateCharacter(character._id, data) : await createCharacter(data)
    } catch (err) {
      showError(getErrorMessage(err))
      setSaving(false)
      return
    }

    // Step 2: upload or remove the image (needs the saved character's id)
    try {
      if (imageFile) {
        await uploadCharacterImage(saved._id, imageFile)
      } else if (imageRemoved && character?.image?.url) {
        await removeCharacterImage(saved._id)
      }
    } catch (err) {
      const message = `Character saved, but the image could not be updated: ${getErrorMessage(err)}`
      if (isEdit) {
        showError(message)
        setSaving(false)
      } else {
        // The character exists now, so continue on its edit page
        navigate(`/characters/${saved._id}/edit`, { replace: true, state: { error: message } })
      }
      return
    }

    navigate(`/characters/${saved._id}`)
  }

  return (
    <form className="character-form" onSubmit={handleSubmit} noValidate>
      <div className="character-form-layout">
        <aside className="character-form-media">
          <ImagePicker
            currentImage={character?.image}
            file={imageFile}
            removed={imageRemoved}
            name={fields.name}
            onChange={handleImageChange}
            onError={(message) => (message ? showError(message) : setError(''))}
          />
        </aside>

        <div className="character-form-main">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <section className="form-section card">
            <h2>Basics</h2>

            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength={60}
                placeholder="Your character's name"
                value={fields.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Short description</label>
              <textarea
                id="description"
                name="description"
                rows={2}
                maxLength={300}
                placeholder="One or two sentences shown on character cards"
                value={fields.description}
                onChange={handleChange}
                aria-describedby="description-count"
              />
              <small id="description-count" className="form-hint">
                {fields.description.length}/300
              </small>
            </div>
          </section>

          <section className="form-section card">
            <h2>
              <label htmlFor="personality">Personality</label>
            </h2>
            <textarea
              id="personality"
              name="personality"
              rows={4}
              maxLength={2000}
              placeholder="Temperament, habits, likes and dislikes..."
              value={fields.personality}
              onChange={handleChange}
            />
          </section>

          <section className="form-section card">
            <h2>Abilities</h2>
            <AbilitiesEditor abilities={abilities} onChange={setAbilities} />
          </section>

          <section className="form-section card">
            <h2>
              <label htmlFor="backstory">Backstory</label>
            </h2>
            <textarea
              id="backstory"
              name="backstory"
              rows={8}
              maxLength={10000}
              placeholder="Where they came from and what shaped them..."
              value={fields.backstory}
              onChange={handleChange}
            />
          </section>

          <div className="form-actions">
            <Link
              to={isEdit ? `/characters/${character._id}` : '/my-characters'}
              className="btn btn-outline"
            >
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create character'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default CharacterForm
