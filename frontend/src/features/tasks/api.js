import api from '../../services/api'

export const fetchTasks = async (params) => {
  const response = await api.get('/tasks/', { params })
  return response.data
}

export const createTask = async (taskData) => {
  const response = await api.post('/tasks/', taskData)
  return response.data
}

export const updateTask = async ({ id, ...data }) => {
  const response = await api.patch(`/tasks/${id}/`, data)
  return response.data
}

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}/`)
  return response.data
}

export const fetchCategories = async () => {
  const response = await api.get('/categories/')
  return response.data.results || response.data
}

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories/', categoryData)
  return response.data
}
