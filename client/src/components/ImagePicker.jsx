import { useEffect, useMemo, useRef } from 'react'
import { FiUpload, FiTrash2 } from 'react-icons/fi'
import CharacterImage from './CharacterImage'
import { validateImage } from '../utils/validateImage'

// Lets the user choose, preview, or remove the character image.
// The parent form keeps track of the chosen file and does the actual upload.
//
// Props:
//   currentImage  - the image already saved on the character (or undefined)
//   file          - the newly chosen File (or null)
//   removed       - true if the user removed the saved image
//   name          - character name (for the placeholder letter)
//   onChange(file, removed)
//   onError(message)
function ImagePicker({ currentImage, file, removed, name, onChange, onError }) {
  const inputRef = useRef(null)

  // Temporary URL so the browser can preview the chosen file
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  // Free the temporary URL when it is no longer needed
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e) => {
    const chosen = e.target.files[0]
    e.target.value = '' // allow choosing the same file again later
    if (!chosen) return

    const problem = validateImage(chosen)
    if (problem) {
      onError(problem)
      return
    }

    onError('')
    onChange(chosen, false)
  }

  const handleRemove = () => {
    onChange(null, true)
  }

  // What to show: new file > saved image (unless removed) > placeholder
  let shownImage = null
  if (previewUrl) {
    shownImage = { url: previewUrl }
  } else if (currentImage && currentImage.url && !removed) {
    shownImage = currentImage
  }

  const hasImage = Boolean(shownImage)

  return (
    <div className="image-picker">
      <p className="picker-label">Artwork</p>

      {/* Blob previews can't be resized by Cloudinary, so show them as-is */}
      {previewUrl ? (
        <img className="character-image" src={previewUrl} alt="Preview of the chosen artwork" />
      ) : (
        <CharacterImage image={shownImage} name={name || '?'} size="detail" alt="Current artwork" />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        hidden
      />

      <div className="picker-actions">
        <button
          type="button"
          className="btn btn-outline btn-icon"
          onClick={() => inputRef.current.click()}
        >
          <FiUpload aria-hidden="true" />
          {hasImage ? 'Change image' : 'Upload image'}
        </button>

        {hasImage && (
          <button type="button" className="btn btn-outline btn-icon" onClick={handleRemove}>
            <FiTrash2 aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <small className="form-hint">JPG, PNG, or WEBP. Max 2 MB.</small>
    </div>
  )
}

export default ImagePicker
