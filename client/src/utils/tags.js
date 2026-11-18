// Same tag rules as the server (server/utils/tags.js)
export const MAX_TAGS = 10

const TAG_PATTERN = /^[\p{L}\p{N}]+(?:[ -][\p{L}\p{N}]+)*$/u

// "  Sky   Pirate " -> "sky pirate"
export const normalizeTag = (tag) => tag.trim().replace(/\s+/g, ' ').toLowerCase()

// Returns an error message, or '' if the (already normalized) tag is fine
export const validateTag = (tag) => {
  if (tag.length < 2 || tag.length > 30) {
    return 'Tags must be 2–30 characters.'
  }
  if (!TAG_PATTERN.test(tag)) {
    return 'Tags can use letters, numbers, and single spaces or hyphens between words.'
  }
  return ''
}
