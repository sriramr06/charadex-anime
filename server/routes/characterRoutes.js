import express from 'express'
import {
  getCharacters,
  getMyCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../controllers/characterController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getCharacters)
router.post('/', protect, createCharacter)

// "/mine" must come before "/:id", otherwise "mine" would be treated as an id
router.get('/mine', protect, getMyCharacters)

router.get('/:id', getCharacterById)
router.put('/:id', protect, updateCharacter)
router.delete('/:id', protect, deleteCharacter)

export default router
