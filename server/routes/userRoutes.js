import express from 'express'
import { updateProfile, uploadAvatar, removeAvatar } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { uploadSingleImage } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Every route here needs a logged-in user
router.use(protect)

router.put('/me', updateProfile)
router.put('/me/avatar', uploadSingleImage, uploadAvatar)
router.delete('/me/avatar', removeAvatar)

export default router
