import React, { useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchTasks, updateTask } from './api'
import TaskColumn from '../../components/TaskColumn'
import CreateTaskModal from './CreateTaskModal'
import FriendsSidebar from '../friends/FriendsSidebar'
import TaskFilterBar from './TaskFilterBar'
import LanguageSelector from '../../components/LanguageSelector'
import { useAuth } from '../auth/useAuth'

const DashboardPage = () => {
  const { t } = useTranslation()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({})
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  // In a real implementation with infinite scroll per column, we'd use useInfiniteQuery per column.
  // Here we use a single query for simplicity as defined in previous steps, and apply filters locally,
  // or pass filters to the API if the API supports it.
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['tasks', filters],
    queryFn: ({ pageParam = 1 }) => fetchTasks({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  })

  // Flatten the pages into a single array of tasks
  const tasks = data ? data.pages.flatMap(page => page.results || page) : [];

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const handleUpdateTask = (data) => {
    updateMutation.mutate(data)
  }

  const categorizeTasks = (allTasks) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const today = []
    const next3Days = []
    const next5Days = []
    const nextWeeks = []
    const nextMonth = []
    const noDeadline = []
    
    // Apply local filters if API doesn't support them fully yet
    let filteredTasks = allTasks
    if (filters.status === 'completed') filteredTasks = filteredTasks.filter(t => t.is_completed)
    if (filters.status === 'pending') filteredTasks = filteredTasks.filter(t => !t.is_completed)
    
    filteredTasks.forEach(task => {
      if (!task.due_date) {
        noDeadline.push(task)
        return
      }
      
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      const diffTime = dueDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) today.push(task)
      else if (diffDays <= 3) next3Days.push(task)
      else if (diffDays <= 5) next5Days.push(task)
      else if (diffDays <= 14) nextWeeks.push(task)
      else if (diffDays <= 30) nextMonth.push(task)
      else noDeadline.push(task)
    })
    
    return { today, next3Days, next5Days, nextWeeks, nextMonth, noDeadline }
  }
  
  const categorized = categorizeTasks(tasks)

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('dashboard.title')}</h2>
        <div className="d-flex align-items-center gap-2">
          <LanguageSelector />
          <button className="btn btn-outline-secondary" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i>{t('dashboard.logout')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>{t('dashboard.newTask')}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-9">
          <TaskFilterBar filters={filters} onFilterChange={setFilters} />
          
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('dashboard.loading')}</span>
              </div>
            </div>
          ) : isError ? (
            <div className="alert alert-danger">{t('dashboard.error')}</div>
          ) : (
            <>
              <div className="row flex-nowrap overflow-auto pb-4" style={{ minHeight: '70vh' }}>
                <TaskColumn title={t('dashboard.columns.today')} tasks={categorized.today} onUpdateTask={handleUpdateTask} />
                <TaskColumn title={t('dashboard.columns.noDeadline')} tasks={categorized.noDeadline} onUpdateTask={handleUpdateTask} />
                <TaskColumn title={t('dashboard.columns.next3Days')} tasks={categorized.next3Days} onUpdateTask={handleUpdateTask} />
                <TaskColumn title={t('dashboard.columns.next5Days')} tasks={categorized.next5Days} onUpdateTask={handleUpdateTask} />
                <TaskColumn title={t('dashboard.columns.nextWeeks')} tasks={categorized.nextWeeks} onUpdateTask={handleUpdateTask} />
                <TaskColumn title={t('dashboard.columns.nextMonth')} tasks={categorized.nextMonth} onUpdateTask={handleUpdateTask} />
              </div>
              {hasNextPage && (
                <div className="text-center mt-3 mb-4">
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={() => fetchNextPage()} 
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? t('dashboard.loadingMore') : t('dashboard.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="col-lg-3">
          <FriendsSidebar />
        </div>
      </div>

      <CreateTaskModal show={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}

export default DashboardPage
