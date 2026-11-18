import userResponse from '../utils/userResponse.js'
import { uploadImage, deleteImage } from '../config/cloudinary.js'

// All routes here act on the logged-in user (req.user, set by protect).
// Users can only ever change their own profile.

// @route   PUT /api/users/me
// @access  Private
export const updateProfile = async (req, res) => {
  const { displayName, bio } = req.body
  const user = req.user

  // Only these two fields can be changed here
  if (displayName !== undefined) {
    // An empty display name falls back to the username in the app
    user.displayName = String(displayName).trim() || undefined
  }
  if (bio !== undefined) {
    user.bio = String(bio).trim() || undefined
  }

  await user.save() // runs schema validation (lengths)

  res.json({ user: userResponse(user) })
}

// @route   PUT /api/users/me/avatar   (form field: "image")
// @access  Private
export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please choose an image to upload' })
  }

  const user = req.user
  const oldPublicId = user.avatar?.publicId

  // 1. Upload the new avatar, 2. save it, 3. delete the old one
  let newAvatar
  try {
    newAvatar = await uploadImage(req.file.buffer, 'avatars')
  } catch (error) {
    if (error.http_code === 400) {
      return res.status(400).json({ message: 'That file is not a valid image' })
    }
    throw error
  }

  user.avatar = newAvatar
  await user.save()

  if (oldPublicId) {
    await deleteImage(oldPublicId)
  }

  res.json({ user: userResponse(user) })
}

// @route   DELETE /api/users/me/avatar
// @access  Private
export const removeAvatar = async (req, res) => {
  const user = req.user
  const oldPublicId = user.avatar?.publicId

  if (!oldPublicId) {
    return res.status(400).json({ message: 'You have no avatar to remove' })
  }

  user.avatar = undefined
  await user.save()
  await deleteImage(oldPublicId)

  res.json({ user: userResponse(user) })
}
