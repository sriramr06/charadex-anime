import { FiPlus, FiX, FiTrash2 } from 'react-icons/fi'
import './AbilitiesEditor.css'

const MAX_ABILITIES = 20
const MAX_TECHNIQUES = 20

// Edits a list of abilities, where each ability has its own list of techniques:
//   [{ name, description, techniques: [{ name, description }] }]
// The parent form owns the list; this component calls onChange with a new list.
function AbilitiesEditor({ abilities, onChange }) {
  // ----- Abilities -----
  const addAbility = () => {
    onChange([...abilities, { name: '', description: '', techniques: [] }])
  }

  const removeAbility = (index) => {
    onChange(abilities.filter((_, i) => i !== index))
  }

  const updateAbility = (index, field, value) => {
    onChange(abilities.map((ability, i) => (i === index ? { ...ability, [field]: value } : ability)))
  }

  // ----- Techniques inside one ability -----
  const addTechnique = (abilityIndex) => {
    const techniques = [...abilities[abilityIndex].techniques, { name: '', description: '' }]
    updateAbility(abilityIndex, 'techniques', techniques)
  }

  const removeTechnique = (abilityIndex, techIndex) => {
    const techniques = abilities[abilityIndex].techniques.filter((_, i) => i !== techIndex)
    updateAbility(abilityIndex, 'techniques', techniques)
  }

  const updateTechnique = (abilityIndex, techIndex, field, value) => {
    const techniques = abilities[abilityIndex].techniques.map((tech, i) =>
      i === techIndex ? { ...tech, [field]: value } : tech
    )
    updateAbility(abilityIndex, 'techniques', techniques)
  }

  return (
    <div className="abilities-editor">
      {abilities.length === 0 && (
        <p className="muted abilities-empty">No abilities yet. Add powers, skills, or weapons.</p>
      )}

      {abilities.map((ability, a) => (
        <div key={a} className="ability-item">
          <div className="ability-item-header">
            <span className="ability-item-title">Ability {a + 1}</span>
            <button
              type="button"
              className="btn-text btn-icon"
              onClick={() => removeAbility(a)}
              aria-label={`Remove ability ${a + 1}`}
            >
              <FiTrash2 aria-hidden="true" />
              Remove
            </button>
          </div>

          <div className="form-group">
            <label htmlFor={`ability-${a}-name`}>Name</label>
            <input
              id={`ability-${a}-name`}
              type="text"
              maxLength={80}
              placeholder="e.g. Petal Blade"
              value={ability.name}
              onChange={(e) => updateAbility(a, 'name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor={`ability-${a}-description`}>Description</label>
            <textarea
              id={`ability-${a}-description`}
              rows={2}
              maxLength={1000}
              placeholder="What does this ability do?"
              value={ability.description}
              onChange={(e) => updateAbility(a, 'description', e.target.value)}
            />
          </div>

          <div className="techniques">
            <p className="techniques-label">Techniques</p>

            {ability.techniques.map((tech, t) => (
              <div key={t} className="technique-row">
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Technique name"
                  aria-label={`Ability ${a + 1}, technique ${t + 1} name`}
                  value={tech.name}
                  onChange={(e) => updateTechnique(a, t, 'name', e.target.value)}
                />
                <input
                  type="text"
                  maxLength={1000}
                  placeholder="Short description (optional)"
                  aria-label={`Ability ${a + 1}, technique ${t + 1} description`}
                  value={tech.description}
                  onChange={(e) => updateTechnique(a, t, 'description', e.target.value)}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => removeTechnique(a, t)}
                  aria-label={`Remove technique ${t + 1}`}
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn-text btn-icon"
              onClick={() => addTechnique(a)}
              disabled={ability.techniques.length >= MAX_TECHNIQUES}
            >
              <FiPlus aria-hidden="true" />
              Add technique
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline btn-icon"
        onClick={addAbility}
        disabled={abilities.length >= MAX_ABILITIES}
      >
        <FiPlus aria-hidden="true" />
        Add ability
      </button>
    </div>
  )
}

export default AbilitiesEditor
