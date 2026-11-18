import { cloudinaryUrl } from '../utils/cloudinaryUrl'
import './Avatar.css'

// Round profile picture. Shows the user's first letter when there is no avatar.
//   <Avatar user={user} size="sm" />   sizes: sm (32px), md (48px), lg (160px)
// Pass `src` to show a local preview instead (used while choosing a new avatar).
function Avatar({ user, size = 'sm', src }) {
  const name = user ? user.displayName || user.username || '?' : '?'
  const url = src || (user?.avatar?.url ? cloudinaryUrl(user.avatar.url, 'c_fill,w_320,h_320') : null)

  if (url) {
    return <img className={`avatar avatar-${size}`} src={url} alt="" />
  }

  return (
    <span className={`avatar avatar-${size} avatar-placeholder`} aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export default Avatar
