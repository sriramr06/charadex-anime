import Character from '../models/Character.js'
import escapeRegex from '../utils/escapeRegex.js'

// Public creator fields to include when populating
const CREATOR_FIELDS = 'username displayName avatar'

// Only these fields can be set by the client.
// (creator comes from the logged-in user; image is handled by the upload feature)
const EDITABLE_FIELDS = ['name', 'description', 'personality', 'abilities', 'backstory']

const pickEditableFields = (body) => {
  const data = {}
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field]
    }
  })
  return data
}

// Read ?page= and ?limit= safely (defaults: page 1, 12 per page, max 50)
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit) || 12, 1), 50)
  return { page, limit, skip: (page - 1) * limit }
}

// Load a character and make sure the logged-in user owns it.
// Sends the error response itself and returns null if not allowed.
const findOwnedCharacter = async (req, res) => {
  const character = await Character.findById(req.params.id)

  if (!character) {
    res.status(404).json({ message: 'Character not found' })
    return null
  }

  if (character.creator.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: 'You can only change your own characters' })
    return null
  }

  return character
}

// @route   GET /api/characters?search=&page=&limit=
// @access  Public
export const getCharacters = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)

  const filter = {}
  const search = (req.query.search || '').trim()
  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' }
  }

  const [characters, total] = await Promise.all([
    Character.find(filter)
      .select('name description image creator createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', CREATOR_FIELDS),
    Character.countDocuments(filter),
  ])

  res.json({
    characters,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  })
}

// @route   GET /api/characters/mine
// @access  Private
export const getMyCharacters = async (req, res) => {
  const characters = await Character.find({ creator: req.user._id })
    .select('name description image createdAt updatedAt')
    .sort({ createdAt: -1 })

  res.json({ characters })
}

// @route   GET /api/characters/:id
// @access  Public
export const getCharacterById = async (req, res) => {
  const character = await Character.findById(req.params.id).populate('creator', CREATOR_FIELDS)

  if (!character) {
    return res.status(404).json({ message: 'Character not found' })
  }

  res.json({ character })
}

// @route   POST /api/characters
// @access  Private
export const createCharacter = async (req, res) => {
  const data = pickEditableFields(req.body)

  if (!data.name || !String(data.name).trim()) {
    return res.status(400).json({ message: 'Character name is required' })
  }

  const character = await Character.create({
    ...data,
    creator: req.user._id, // always the logged-in user, never from the request body
  })

  res.status(201).json({ character })
}

// @route   PUT /api/characters/:id
// @access  Private (owner only)
export const updateCharacter = async (req, res) => {
  const character = await findOwnedCharacter(req, res)
  if (!character) return

  const data = pickEditableFields(req.body)

  if (data.name !== undefined && !String(data.name).trim()) {
    return res.status(400).json({ message: 'Character name is required' })
  }

  // Copy the new values onto the document, then save (this runs schema validation)
  Object.assign(character, data)
  await character.save()

  res.json({ character })
}

// @route   DELETE /api/characters/:id
// @access  Private (owner only)
export const deleteCharacter = async (req, res) => {
  const character = await findOwnedCharacter(req, res)
  if (!character) return

  await character.deleteOne()

  // TODO (later features): delete this character's image from Cloudinary,
  // and its likes and comments, so nothing is left behind.

  res.json({ message: 'Character deleted' })
}
