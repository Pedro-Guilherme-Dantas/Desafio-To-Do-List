import api from '../../services/api'

export const fetchTaskMembers = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/participations/`)
  return response.data.results || response.data
}

export const addTaskMember = async ({ taskId, userId, role = 'VIEWER' }) => {
  const response = await api.post(`/tasks/${taskId}/participations/`, { user_id: userId, role })
  return response.data
}

export const removeTaskMember = async ({ taskId, memberId }) => {
  const response = await api.delete(`/tasks/${taskId}/participations/${memberId}/`)
  return response.data
}

export const fetchTaskComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments/`)
  return response.data.results || response.data
}

export const addTaskComment = async ({ taskId, text }) => {
  const response = await api.post(`/tasks/${taskId}/comments/`, { text })
  return response.data
}
