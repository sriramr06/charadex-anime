import api from './axios'

// ----- Likes (each returns { liked, likeCount }) -----

export const likeCharacter = async (characterId) => {
  const res = await api.post(`/characters/${characterId}/like`)
  return res.data
}

export const unlikeCharacter = async (characterId) => {
  const res = await api.delete(`/characters/${characterId}/like`)
  return res.data
}

// ----- Comments -----

// Returns { comments, page, totalPages, total }
export const getComments = async (characterId, page = 1) => {
  const res = await api.get(`/characters/${characterId}/comments`, { params: { page } })
  return res.data
}

export const addComment = async (characterId, text) => {
  const res = await api.post(`/characters/${characterId}/comments`, { text })
  return res.data.comment
}

export const deleteComment = async (commentId) => {
  await api.delete(`/comments/${commentId}`)
}
