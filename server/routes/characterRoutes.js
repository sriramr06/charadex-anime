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
import { protect } from '../middleware/authMiddleware.js'
import { uploadSingleImage } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.get('/', getCharacters)
router.post('/', protect, createCharacter)

// "/mine" must come before "/:id", otherwise "mine" would be treated as an id
router.get('/mine', protect, getMyCharacters)

router.get('/:id', getCharacterById)
router.put('/:id', protect, updateCharacter)
router.delete('/:id', protect, deleteCharacter)

// Character image (multipart/form-data with a field named "image")
router.put('/:id/image', protect, uploadSingleImage, uploadCharacterImage)
router.delete('/:id/image', protect, removeCharacterImage)

export default router
