import React from 'react'
import { useTranslation } from 'react-i18next'

const TaskFilterBar = ({ filters, onFilterChange }) => {
  const { t } = useTranslation()
  const handleChange = (e) => {
    const { name, value } = e.target
    onFilterChange({ ...filters, [name]: value })
  }

  return (
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-body py-2">
        <div className="row align-items-center">
          <div className="col-auto fw-bold text-muted">
            <i className="bi bi-funnel me-2"></i>{t('filters.all', 'Filters:')}
          </div>
          <div className="col-md-3">
            <select 
              className="form-select form-select-sm" 
              name="priority" 
              value={filters.priority || ''} 
              onChange={handleChange}
            >
              <option value="">{t('filters.priority', 'All Priorities')}</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select form-select-sm" 
              name="status" 
              value={filters.status || ''} 
              onChange={handleChange}
            >
              <option value="">{t('filters.status', 'All Statuses')}</option>
              <option value="completed">{t('filters.completed', 'Completed')}</option>
              <option value="pending">{t('filters.pending', 'Pending')}</option>
            </select>
          </div>
          <div className="col-md-3">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Search..." 
              name="search" 
              value={filters.search || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskFilterBar
