import Character from '../models/Character.js'
import Like from '../models/Like.js'
import Comment from '../models/Comment.js'
import escapeRegex from '../utils/escapeRegex.js'
import getPagination from '../utils/pagination.js'
import { normalizeTag, normalizeTags } from '../utils/tags.js'
import { uploadImage, deleteImage } from '../config/cloudinary.js'

// Public creator fields to include when populating
const CREATOR_FIELDS = 'username displayName avatar'

// Fields shown on character cards (Explore, My Characters, creator pages)
const CARD_FIELDS = 'name description image tags creator createdAt'

// Only these fields can be set by the client.
// (creator comes from the logged-in user; image is handled by the upload feature)
const EDITABLE_FIELDS = ['name', 'description', 'personality', 'abilities', 'backstory', 'tags']

// Explore sort options (_id breaks ties so pages never overlap)
const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name: { name: 1, _id: 1 },
}

const pickEditableFields = (body) => {
  const data = {}
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field]
    }
  })

  // Tags must be a list; clean them before the schema checks the rules
  if (Array.isArray(data.tags)) {
    data.tags = normalizeTags(data.tags)
  }

  return data
}

// Returns an error message for request data the schema can't explain well
const checkRequestData = (data) => {
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    return 'Tags must be a list'
  }
  return ''
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

// @route   GET /api/characters?search=&tag=&sort=&page=&limit=
// @access  Public
export const getCharacters = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query)

  const filter = {}
  const search = String(req.query.search || '').trim()
  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' }
  }

  // Exact tag match, using the same cleaning as when tags are saved
  const tag = normalizeTag(req.query.tag || '')
  if (tag) {
    filter.tags = tag
  }

  // Unknown sort values fall back to newest
  const sort = SORTS[req.query.sort] || SORTS.newest

  let query = Character.find(filter)
    .select(CARD_FIELDS)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('creator', CREATOR_FIELDS)

  // Sort names A–Z without caring about upper/lower case
  if (sort === SORTS.name) {
    query = query.collation({ locale: 'en', strength: 2 })
  }

  const [characters, total] = await Promise.all([query, Character.countDocuments(filter)])

  res.json({
    characters,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  })
}

// @route   GET /api/characters/tags
// @access  Public
// The 20 most-used tags, for the filter chips on Explore
export const getPopularTags = async (req, res) => {
  // Aggregation pipeline: one row per tag -> count rows per tag -> top 20
  const rows = await Character.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 20 },
  ])

  res.json({ tags: rows.map((row) => ({ tag: row._id, count: row.count })) })
}

// @route   GET /api/characters/mine
// @access  Private
export const getMyCharacters = async (req, res) => {
  const characters = await Character.find({ creator: req.user._id })
    .select('name description image tags createdAt updatedAt')
    .sort({ createdAt: -1 })

  res.json({ characters })
}

// @route   GET /api/characters/:id
// @access  Public (optionalAuth: logged-in users also get likedByMe)
export const getCharacterById = async (req, res) => {
  const character = await Character.findById(req.params.id).populate('creator', CREATOR_FIELDS)

  if (!character) {
    return res.status(404).json({ message: 'Character not found' })
  }

  const [likeCount, myLike] = await Promise.all([
    Like.countDocuments({ character: character._id }),
    req.user ? Like.exists({ character: character._id, user: req.user._id }) : null,
  ])

  res.json({ character, likeCount, likedByMe: Boolean(myLike) })
}

// @route   POST /api/characters
// @access  Private
export const createCharacter = async (req, res) => {
  const data = pickEditableFields(req.body)

  if (!data.name || !String(data.name).trim()) {
    return res.status(400).json({ message: 'Character name is required' })
  }

  const dataError = checkRequestData(data)
  if (dataError) {
    return res.status(400).json({ message: dataError })
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

  const dataError = checkRequestData(data)
  if (dataError) {
    return res.status(400).json({ message: dataError })
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

  // Remove the image from Cloudinary too (failures are only logged)
  await deleteImage(character.image?.publicId)

  // Remove its likes and comments so nothing is left behind
  await Promise.all([
    Like.deleteMany({ character: character._id }),
    Comment.deleteMany({ character: character._id }),
  ])

  res.json({ message: 'Character deleted' })
}

// @route   PUT /api/characters/:id/image   (form field: "image")
// @access  Private (owner only)
export const uploadCharacterImage = async (req, res) => {
  const character = await findOwnedCharacter(req, res)
  if (!character) return

  if (!req.file) {
    return res.status(400).json({ message: 'Please choose an image to upload' })
  }

  const oldPublicId = character.image?.publicId

  // 1. Upload the new image, 2. save it, 3. delete the old one
  let newImage
  try {
    newImage = await uploadImage(req.file.buffer, 'characters')
  } catch (error) {
    // Cloudinary answers 400 when the file is not a real image
    if (error.http_code === 400) {
      return res.status(400).json({ message: 'That file is not a valid image' })
    }
    throw error
  }

  character.image = newImage
  await character.save()

  if (oldPublicId) {
    await deleteImage(oldPublicId)
  }

  res.json({ character })
}

// @route   DELETE /api/characters/:id/image
// @access  Private (owner only)
export const removeCharacterImage = async (req, res) => {
  const character = await findOwnedCharacter(req, res)
  if (!character) return

  const oldPublicId = character.image?.publicId
  if (!oldPublicId) {
    return res.status(400).json({ message: 'This character has no image' })
  }

  character.image = undefined
  await character.save()
  await deleteImage(oldPublicId)

  res.json({ character })
}
