import express from 'express'
import { updateProfile, uploadAvatar, removeAvatar } from '../controllers/userController.js'
import {
  getCreator,
  getCreatorCharacters,
  followCreator,
  unfollowCreator,
} from '../controllers/creatorController.js'
import { protect, optionalAuth } from '../middleware/authMiddleware.js'
import { uploadSingleImage } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Your own profile ("/me" routes must come before "/:username")
router.put('/me', protect, updateProfile)
router.put('/me/avatar', protect, uploadSingleImage, uploadAvatar)
router.delete('/me/avatar', protect, removeAvatar)

// Public creator pages
router.get('/:username', optionalAuth, getCreator)
router.get('/:username/characters', getCreatorCharacters)

// Following
router.post('/:username/follow', protect, followCreator)
router.delete('/:username/follow', protect, unfollowCreator)

export default router
