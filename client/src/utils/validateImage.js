// Same rules as the server: JPG, PNG, or WEBP up to 2 MB.
// Returns an error message, or '' if the file is fine.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

export const validateImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WEBP image.'
  }
  if (file.size > MAX_SIZE) {
    return 'Image must be 2 MB or smaller.'
  }
  return ''
}
