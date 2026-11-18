import multer from 'multer'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

// Keep the file in memory (as a Buffer) so we can send it straight to Cloudinary.
// Nothing is written to the server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      const error = new Error('Only JPG, PNG, or WEBP images are allowed')
      error.statusCode = 400
      cb(error)
    }
  },
})

// Accept one file from the form field named "image"
export const uploadSingleImage = upload.single('image')
