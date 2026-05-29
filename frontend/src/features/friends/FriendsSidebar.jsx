import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchFriends, fetchFriendRequests, respondFriendRequest } from './api'
import { Link } from 'react-router-dom'

const FriendsSidebar = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends
  })

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: fetchFriendRequests
  })

  const isLoading = loadingFriends || loadingRequests
  const allRelationships = [...friends, ...requests]

  const respondMutation = useMutation({
    mutationFn: respondFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
    }
  })

  const handleRespond = (id, status) => {
    respondMutation.mutate({ id, status })
  }

  return (
    <div className="card h-100 bg-light border-0">
      <div className="card-header bg-white border-bottom-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">{t('friends.title')}</h5>
        <Link to="/friends/search" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2">
          <i className="bi bi-search"></i>
          <span>{t('friends.searchTitle')}</span>
        </Link>
      </div>
      <div className="card-body overflow-auto">
        {isLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">{t('friends.loading')}</span>
            </div>
          </div>
        ) : allRelationships.length === 0 ? (
          <div className="text-center text-muted p-3">
            <small>{t('friends.noFriends')}</small>
          </div>
        ) : (
          <div>
            <ul className="list-group list-group-flush">
              {allRelationships.map(friendship => (
              <li key={friendship.id} className="list-group-item bg-transparent px-0 d-flex align-items-center">
                <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                  {friendship.friend?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold small">{friendship.friend?.username}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t(`friends.status.${friendship.status}`, friendship.status)}</div>
                </div>
                {friendship.status === 'PENDING' && (
                  <div className="d-flex gap-1 ms-2">
                    <button 
                      className="btn btn-success d-flex align-items-center justify-content-center rounded-circle p-0" 
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleRespond(friendship.friend?.id || friendship.id, 'ACCEPTED')}
                      title="Accept"
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                    <button 
                      className="btn btn-outline-danger d-flex align-items-center justify-content-center rounded-circle p-0" 
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleRespond(friendship.friend?.id || friendship.id, 'REJECTED')}
                      title="Reject"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}
              </li>
            ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsSidebar
