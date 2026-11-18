import express from 'express'
import { register, login, getMe, checkEmail } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/check-email', checkEmail)
router.post('/login', login)
router.get('/me', protect, getMe)

export default router
