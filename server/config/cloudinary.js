import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Top-level Cloudinary folder (lets tests use a separate folder)
const ROOT_FOLDER = process.env.CLOUDINARY_FOLDER || 'charadex'

// Upload an image from memory (a Buffer) to Cloudinary.
// Returns { url, publicId } to save in MongoDB.
export const uploadImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${ROOT_FOLDER}/${folder}`,
        resource_type: 'image',
        // Shrink very large images (keeps the aspect ratio, never enlarges)
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

// Delete an image from Cloudinary.
// Never throws: a failed cleanup is logged on the server but must not
// break the user's request or expose Cloudinary details.
export const deleteImage = async (publicId) => {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error(`Cloudinary delete failed for ${publicId}: ${error.message}`)
  }
}
