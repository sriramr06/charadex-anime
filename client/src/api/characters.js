import api from './axios'

// Create / update / delete calls for characters.
// (Reading data uses the useApi hook in the pages.)

export const createCharacter = async (data) => {
  const res = await api.post('/characters', data)
  return res.data.character
}

export const updateCharacter = async (id, data) => {
  const res = await api.put(`/characters/${id}`, data)
  return res.data.character
}

export const deleteCharacter = async (id) => {
  await api.delete(`/characters/${id}`)
}

// Images are sent as form data with the file in a field named "image"
export const uploadCharacterImage = async (id, file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await api.put(`/characters/${id}/image`, formData)
  return res.data.character
}

export const removeCharacterImage = async (id) => {
  const res = await api.delete(`/characters/${id}/image`)
  return res.data.character
}
