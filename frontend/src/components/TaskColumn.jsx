import React from 'react'
import { useTranslation } from 'react-i18next'
import TaskCard from './TaskCard'

const TaskColumn = ({ title, tasks, onUpdateTask, onExpandTask }) => {
  const { t } = useTranslation()
  return (
    <div className="col-12 col-md-6 col-xl-4 mb-4">
      <div className="card h-100 bg-light">
        <div className="card-header bg-white border-bottom-0 pt-3 pb-2">
          <h5 className="card-title mb-0 d-flex justify-content-between align-items-center">
            {title}
            <span className="badge bg-secondary rounded-pill">{tasks.length}</span>
          </h5>
        </div>
        <div className="card-body overflow-auto" style={{ maxHeight: '70vh' }}>
          {tasks.length === 0 ? (
            <div className="text-center text-muted p-4">
              <small>{t('dashboard.noTasks', 'No tasks')}</small>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onUpdate={onUpdateTask}
                onExpand={onExpandTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskColumn
