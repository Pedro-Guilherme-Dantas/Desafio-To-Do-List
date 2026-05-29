import api from '../../services/api'

export const searchUsers = async (query) => {
  const params = query ? { search: query, limit: 20 } : { limit: 20, ordering: 'username' }
  const response = await api.get('/users/', { params })
  
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data.results)) return response.data.results;
  if (Array.isArray(response.data.users)) return response.data.users;
  if (Array.isArray(response.data.data)) return response.data.data;
  
  return response.data;
}

export const fetchFriends = async () => {
  const response = await api.get('/users/friendships/')
  return response.data.results || response.data
}

export const fetchFriendRequests = async () => {
  const response = await api.get('/users/friendships/requests/')
  return response.data.results || response.data
}

export const sendFriendRequest = async (userId) => {
  const response = await api.post('/users/friendships/', { to_user_id: userId })
  return response.data
}

export const respondFriendRequest = async ({ id, status }) => {
  if (status === 'ACCEPTED') {
    const response = await api.post(`/users/friendships/${id}/accept/`)
    return response.data
  } else {
    const response = await api.delete(`/users/friendships/${id}/`)
    return response.data
  }
}
