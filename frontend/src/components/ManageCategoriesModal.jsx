import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchCategories, createCategory } from '../features/tasks/api'

const ManageCategoriesModal = ({ show, onClose }) => {
  const { t } = useTranslation()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#0d6efd')

  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: show
  })

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setNewCategoryName('')
      setNewCategoryColor('#0d6efd')
    }
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    mutation.mutate({
      name: newCategoryName.trim(),
      color: newCategoryColor
    })
  }

  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h6 className="modal-title">{t('categories.title')}</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <label className="form-label small fw-bold">{t('categories.title')}</label>
              {isLoading ? (
                <div className="text-center py-2"><small>{t('dashboard.loading')}</small></div>
              ) : categories.length === 0 ? (
                <div className="text-muted small">...</div>
              ) : (
                <div className="d-flex flex-wrap gap-2 max-h-150 overflow-auto">
                  {categories.map(c => (
                    <span key={c.id} className="badge" style={{ backgroundColor: c.color, color: '#fff' }}>
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr />

            <form onSubmit={handleCreate}>
              <label className="form-label small fw-bold">{t('categories.add')}</label>
              <div className="mb-2">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder={t('categories.name')} 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-2">
                <input 
                  type="color" 
                  className="form-control form-control-color p-1" 
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  title="Choose your color"
                  style={{ width: '40px', height: '30px' }}
                />
                <small className="text-muted">{t('categories.color')}</small>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm w-100" 
                disabled={mutation.isPending || !newCategoryName.trim()}
              >
                {mutation.isPending ? '...' : t('categories.add')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageCategoriesModal
