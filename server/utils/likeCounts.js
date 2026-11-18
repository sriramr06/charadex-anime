import Like from '../models/Like.js'

// Add a likeCount to each character in a list (used for character cards).
//
// Instead of counting likes once per character, we count them for the whole
// page in ONE aggregation:
//   1. $match  - only likes for the characters on this page
//   2. $group  - one row per character with the number of likes
//
// `characters` must be plain objects (use .lean() on the query).
const addLikeCounts = async (characters) => {
  if (characters.length === 0) return characters

  const ids = characters.map((character) => character._id)

  const rows = await Like.aggregate([
    { $match: { character: { $in: ids } } },
    { $group: { _id: '$character', count: { $sum: 1 } } },
  ])

  // { "<characterId>": count }
  const counts = {}
  rows.forEach((row) => {
    counts[row._id.toString()] = row.count
  })

  return characters.map((character) => ({
    ...character,
    likeCount: counts[character._id.toString()] || 0,
  }))
}

export default addLikeCounts
