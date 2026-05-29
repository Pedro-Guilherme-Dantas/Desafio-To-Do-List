import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTaskMembers, fetchTaskComments, addTaskComment } from '../features/tasks/collaborationApi'
import ManageCategoriesModal from './ManageCategoriesModal'
import EditTaskModal from '../features/tasks/EditTaskModal'

const TaskCard = ({ task, onUpdate, onExpand }) => {
  const [expanded, setExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const queryClient = useQueryClient()

  // Only fetch comments and members if expanded
  const { data: comments = [] } = useQuery({
    queryKey: ['taskComments', task.id],
    queryFn: () => fetchTaskComments(task.id),
    enabled: expanded
  })

  const { data: members = [] } = useQuery({
    queryKey: ['taskMembers', task.id],
    queryFn: () => fetchTaskMembers(task.id),
    enabled: expanded
  })

  const addCommentMutation = useMutation({
    mutationFn: addTaskComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', task.id] })
      setNewComment('')
    }
  })

  const handleToggleComplete = (e) => {
    e.stopPropagation()
    onUpdate({ id: task.id, is_completed: !task.is_completed })
  }

  const handleExpand = () => {
    setExpanded(!expanded)
    if (onExpand && !expanded) {
      onExpand(task)
    }
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      addCommentMutation.mutate({ taskId: task.id, text: newComment })
    }
  }

  const priorityColors = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info'
  }

  return (
    <div className={`card mb-3 shadow-sm ${task.is_completed ? 'bg-light text-muted' : ''}`} onClick={handleExpand} style={{ cursor: 'pointer' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={task.is_completed}
              onChange={handleToggleComplete}
              onClick={(e) => e.stopPropagation()}
            />
            <label className={`form-check-label ${task.is_completed ? 'text-decoration-line-through' : 'fw-bold'}`}>
              {task.title}
            </label>
          </div>
          {task.priority && (
            <span className={`badge bg-${priorityColors[task.priority] || 'secondary'}`}>
              {task.priority}
            </span>
          )}
        </div>
        
        {task.category && (
          <div className="mb-2">
            <span className="badge" style={{ backgroundColor: task.category.color, color: '#fff' }}>
              {task.category.name}
            </span>
          </div>
        )}

        {expanded && (
          <div className="mt-3 pt-3 border-top" onClick={e => e.stopPropagation()}>
            <p className="card-text small">{task.description}</p>
            {task.due_date && (
              <p className="card-text small mb-3">
                <i className="bi bi-calendar-event me-1"></i>
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            
            <div className="mb-3 d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
              >
                <i className="bi bi-pencil me-1"></i> Edit Task
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => { e.stopPropagation(); setShowCategoryManager(true); }}
              >
                <i className="bi bi-tags me-1"></i> Manage Categories
              </button>
            </div>
            
            <div className="mb-3">
              <h6 className="small fw-bold">Members</h6>
              {members.length === 0 ? (
                <span className="text-muted small">No members</span>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {members.map(member => (
                    <span key={member.id} className="badge bg-secondary">
                      {member.user.username}
                    </span>
                  ))}
                </div>
              )}
              {/* Assign member UI could go here */}
            </div>

            <div>
              <h6 className="small fw-bold">Comments</h6>
              <div className="mb-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <span className="text-muted small">No comments</span>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="mb-2 small border-bottom pb-1">
                      <span className="fw-bold me-1">{c.user.username}:</span>
                      <span>{c.text}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddComment} className="mt-2">
                <div className="input-group input-group-sm">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Add comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="submit" disabled={addCommentMutation.isPending || !newComment.trim()}>
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ManageCategoriesModal 
        show={showCategoryManager} 
        onClose={(e) => { if (e) e.stopPropagation(); setShowCategoryManager(false); }} 
      />
      <EditTaskModal
        show={showEditModal}
        task={task}
        onClose={(e) => { if (e) e.stopPropagation(); setShowEditModal(false); }}
      />
    </div>
  )
}

export default TaskCard
