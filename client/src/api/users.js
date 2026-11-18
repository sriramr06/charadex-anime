import api from './axios'

// Profile calls. Each returns the updated user.

export const updateProfile = async (data) => {
  const res = await api.put('/users/me', data)
  return res.data.user
}

export const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await api.put('/users/me/avatar', formData)
  return res.data.user
}

export const removeAvatar = async () => {
  const res = await api.delete('/users/me/avatar')
  return res.data.user
}
