// Escape special regex characters in user input so a search like "(Kai)"
// is treated as plain text instead of breaking the query.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default escapeRegex
