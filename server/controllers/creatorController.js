import User from '../models/User.js'
import Character from '../models/Character.js'
import Follow from '../models/Follow.js'
import getPagination from '../utils/pagination.js'

// Public creator pages and following.
// Creators are looked up by username, e.g. /api/users/inkfox

// Find the creator from the URL or send a 404. Returns null if not found.
const findCreator = async (req, res) => {
  const creator = await User.findOne({ username: req.params.username.toLowerCase() })
  if (!creator) {
    res.status(404).json({ message: 'Creator not found' })
    return null
  }
  return creator
}

// @route   GET /api/users/:username
// @access  Public (optionalAuth: logged-in users also get followedByMe)
export const getCreator = async (req, res) => {
  const creator = await findCreator(req, res)
  if (!creator) return

  const [followerCount, followingCount, characterCount, myFollow] = await Promise.all([
    Follow.countDocuments({ following: creator._id }),
    Follow.countDocuments({ follower: creator._id }),
    Character.countDocuments({ creator: creator._id }),
    req.user ? Follow.exists({ follower: req.user._id, following: creator._id }) : null,
  ])

  res.json({
    // Public fields only (no email)
    creator: {
      _id: creator._id,
      username: creator.username,
      displayName: creator.displayName,
      bio: creator.bio,
      avatar: creator.avatar,
      createdAt: creator.createdAt,
    },
    followerCount,
    followingCount,
    characterCount,
    followedByMe: Boolean(myFollow),
  })
}

// @route   GET /api/users/:username/characters?page=&limit=
// @access  Public
export const getCreatorCharacters = async (req, res) => {
  const creator = await findCreator(req, res)
  if (!creator) return

  const { page, limit, skip } = getPagination(req.query)
  const filter = { creator: creator._id }

  const [characters, total] = await Promise.all([
    Character.find(filter)
      .select('name description image createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Character.countDocuments(filter),
  ])

  res.json({ characters, page, totalPages: Math.ceil(total / limit), total })
}

// @route   POST /api/users/:username/follow
// @access  Private
export const followCreator = async (req, res) => {
  const creator = await findCreator(req, res)
  if (!creator) return

  if (creator._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot follow yourself' })
  }

  try {
    await Follow.create({ follower: req.user._id, following: creator._id })
  } catch (error) {
    // 11000 = duplicate key: already following, which is fine
    if (error.code !== 11000) throw error
  }

  const followerCount = await Follow.countDocuments({ following: creator._id })
  res.json({ following: true, followerCount })
}

// @route   DELETE /api/users/:username/follow
// @access  Private
export const unfollowCreator = async (req, res) => {
  const creator = await findCreator(req, res)
  if (!creator) return

  await Follow.findOneAndDelete({ follower: req.user._id, following: creator._id })

  const followerCount = await Follow.countDocuments({ following: creator._id })
  res.json({ following: false, followerCount })
}
