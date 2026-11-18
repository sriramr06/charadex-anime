// Ask Cloudinary for a resized, optimized version of an image by adding
// transformation options to the URL, e.g. "c_fill,w_400,h_500".
// f_auto picks the best format for the browser; q_auto picks a good quality.
export const cloudinaryUrl = (url, transform) => {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform},f_auto,q_auto/`)
}
