import express from 'express'
import {
  getCharacters,
  getMyCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  uploadCharacterImage,
  removeCharacterImage,
} from '../controllers/characterController.js'
import { likeCharacter, unlikeCharacter } from '../controllers/likeController.js'
import { getComments, addComment } from '../controllers/commentController.js'
import { protect, optionalAuth } from '../middleware/authMiddleware.js'
import { uploadSingleImage } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.get('/', getCharacters)
router.post('/', protect, createCharacter)

// "/mine" must come before "/:id", otherwise "mine" would be treated as an id
router.get('/mine', protect, getMyCharacters)

router.get('/:id', optionalAuth, getCharacterById)
router.put('/:id', protect, updateCharacter)
router.delete('/:id', protect, deleteCharacter)

// Character image (multipart/form-data with a field named "image")
router.put('/:id/image', protect, uploadSingleImage, uploadCharacterImage)
router.delete('/:id/image', protect, removeCharacterImage)

// Likes
router.post('/:id/like', protect, likeCharacter)
router.delete('/:id/like', protect, unlikeCharacter)

// Comments (deleting a comment is in commentRoutes: DELETE /api/comments/:id)
router.get('/:id/comments', getComments)
router.post('/:id/comments', protect, addComment)

export default router
