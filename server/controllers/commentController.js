import Character from '../models/Character.js'
import Comment from '../models/Comment.js'

const AUTHOR_FIELDS = 'username displayName avatar'
const COMMENTS_PER_PAGE = 20

// @route   GET /api/characters/:id/comments?page=
// @access  Public
export const getComments = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const filter = { character: req.params.id }

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * COMMENTS_PER_PAGE)
      .limit(COMMENTS_PER_PAGE)
      .populate('author', AUTHOR_FIELDS),
    Comment.countDocuments(filter),
  ])

  res.json({
    comments,
    page,
    totalPages: Math.ceil(total / COMMENTS_PER_PAGE),
    total,
  })
}

// @route   POST /api/characters/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  const text = String(req.body.text || '').trim()
  if (!text) {
    return res.status(400).json({ message: 'Comment cannot be empty' })
  }

  const character = await Character.findById(req.params.id)
  if (!character) {
    return res.status(404).json({ message: 'Character not found' })
  }

  const comment = await Comment.create({
    character: character._id,
    author: req.user._id, // always the logged-in user
    text,
  })
  await comment.populate('author', AUTHOR_FIELDS)

  res.status(201).json({ comment })
}

// @route   DELETE /api/comments/:id
// @access  Private (comment author only)
export const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id)
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' })
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only delete your own comments' })
  }

  await comment.deleteOne()
  res.json({ message: 'Comment deleted' })
}
