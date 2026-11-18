import Character from '../models/Character.js'
import Like from '../models/Like.js'

// Both handlers answer with the latest state: { liked, likeCount }

// @route   POST /api/characters/:id/like
// @access  Private
export const likeCharacter = async (req, res) => {
  const character = await Character.findById(req.params.id)
  if (!character) {
    return res.status(404).json({ message: 'Character not found' })
  }

  try {
    await Like.create({ user: req.user._id, character: character._id })
  } catch (error) {
    // 11000 = duplicate key: already liked, which is fine
    if (error.code !== 11000) throw error
  }

  const likeCount = await Like.countDocuments({ character: character._id })
  res.json({ liked: true, likeCount })
}

// @route   DELETE /api/characters/:id/like
// @access  Private
export const unlikeCharacter = async (req, res) => {
  const character = await Character.findById(req.params.id)
  if (!character) {
    return res.status(404).json({ message: 'Character not found' })
  }

  await Like.findOneAndDelete({ user: req.user._id, character: character._id })

  const likeCount = await Like.countDocuments({ character: character._id })
  res.json({ liked: false, likeCount })
}
