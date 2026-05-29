import api from '../../services/api'

export const searchUsers = async (query) => {
  const response = await api.get('/users/search/', { params: { q: query } })
  return response.data.results || response.data
}

export const fetchFriends = async () => {
  const response = await api.get('/friendships/')
  return response.data.results || response.data
}

export const sendFriendRequest = async (userId) => {
  const response = await api.post('/friendships/', { friend_id: userId })
  return response.data
}

export const respondFriendRequest = async ({ id, status }) => {
  // status: "ACCEPTED" or "REJECTED"
  const response = await api.patch(`/friendships/${id}/`, { status })
  return response.data
}
