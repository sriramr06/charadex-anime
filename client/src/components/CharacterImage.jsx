import { cloudinaryUrl } from '../utils/cloudinaryUrl'
import './CharacterImage.css'

// Image sizes requested from Cloudinary
const SIZES = {
  card: 'c_fill,w_400,h_500',
  detail: 'c_limit,w_800',
}

// Shows the character's artwork, or a placeholder with their first letter.
// Pass alt="" when the name is already shown next to the image (e.g. cards).
function CharacterImage({ image, name, size = 'card', alt }) {
  if (image && image.url) {
    return (
      <img
        className="character-image"
        src={cloudinaryUrl(image.url, SIZES[size])}
        alt={alt !== undefined ? alt : `Artwork of ${name}`}
        loading="lazy"
      />
    )
  }

  return (
    <div className="character-image character-image-placeholder" aria-hidden="true">
      <span>{name ? name.charAt(0).toUpperCase() : '?'}</span>
    </div>
  )
}

export default CharacterImage
