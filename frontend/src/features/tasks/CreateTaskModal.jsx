import React, { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createTask, fetchCategories } from './api'
import ManageCategoriesModal from '../../components/ManageCategoriesModal'

const CreateTaskModal = ({ onClose, show }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  
  const queryClient = useQueryClient()
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })
  
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onClose()
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setDueDate('')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      title,
      description,
      priority,
      category_id: category ? parseInt(category, 10) : null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null
    })
  }

  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Task</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                ></textarea>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">Category</label>
                    <button 
                      type="button" 
                      className="btn btn-link btn-sm p-0 text-decoration-none" 
                      onClick={() => setShowCategoryManager(true)}
                    >
                      <i className="bi bi-tags me-1"></i>Manage
                    </button>
                  </div>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">No Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ManageCategoriesModal 
        show={showCategoryManager} 
        onClose={() => setShowCategoryManager(false)} 
      />
    </div>
  )
}

export default CreateTaskModal
