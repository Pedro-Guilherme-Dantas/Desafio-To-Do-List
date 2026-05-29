import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { updateTask, fetchCategories } from './api'
import ManageCategoriesModal from '../../components/ManageCategoriesModal'

const EditTaskModal = ({ task, onClose, show }) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '')
  const [category, setCategory] = useState(task?.category?.id || '')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  
  const queryClient = useQueryClient()
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: show
  })

  // Keep state in sync if the `task` prop changes (e.g. reopened with same component instance)
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'MEDIUM')
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      setCategory(task.category?.id || '')
    }
  }, [task])

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onClose()
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      id: task.id,
      title,
      description,
      priority,
      category_id: category ? parseInt(category, 10) : null,
      due_date: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null
    })
  }

  if (!show || !task) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">{t('modal.editTask')}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">{t('modal.title')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">{t('modal.description')}</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                ></textarea>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">{t('modal.priority')}</label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">{t('modal.category')}</label>
                    <button 
                      type="button" 
                      className="btn btn-link btn-sm p-0 text-decoration-none" 
                      onClick={() => setShowCategoryManager(true)}
                    >
                      <i className="bi bi-tags me-1"></i>{t('task.manageCategories', 'Manage')}
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
                  <label className="form-label">{t('modal.dueDate')}</label>
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
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('modal.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? '...' : t('modal.save')}
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

export default EditTaskModal
