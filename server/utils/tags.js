// Tag conventions (FR-14)
//   - up to 10 tags per character, no duplicates
//   - each tag 2–30 characters
//   - letters (any language), numbers, and single spaces or hyphens between words
//   - stored lowercase, trimmed, with repeated spaces collapsed

export const MAX_TAGS = 10
export const TAG_MIN = 2
export const TAG_MAX = 30

// \p{L} = any letter (also Japanese, Korean, ...), \p{N} = any number
export const TAG_PATTERN = /^[\p{L}\p{N}]+(?:[ -][\p{L}\p{N}]+)*$/u

// "  Sky   Pirate " -> "sky pirate"
export const normalizeTag = (tag) => String(tag).trim().replace(/\s+/g, ' ').toLowerCase()

// Clean a list of tags: normalize each, drop empty ones and duplicates
export const normalizeTags = (tags) => {
  const cleaned = tags.map(normalizeTag).filter((tag) => tag.length > 0)
  return [...new Set(cleaned)]
}

export const isValidTag = (tag) =>
  tag.length >= TAG_MIN && tag.length <= TAG_MAX && TAG_PATTERN.test(tag)
