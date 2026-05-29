import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { searchUsers, sendFriendRequest, fetchFriends, fetchFriendRequests, respondFriendRequest } from './api'
import { Link } from 'react-router-dom'

const UserSearchPage = () => {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const queryClient = useQueryClient()

  const { data: results = [], isLoading, isError, error } = useQuery({
    queryKey: ['userSearch', activeQuery],
    queryFn: () => searchUsers(activeQuery)
  })

  const { data: friendships = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends
  })

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: fetchFriendRequests
  })

  const allRelationships = [...friendships, ...friendRequests]

  // Extract current user ID from JWT token
  const currentUserId = React.useMemo(() => {
    try {
      const token = localStorage.getItem('access')
      if (!token) return null
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      return payload.user_id || payload.id || payload.sub
    } catch (e) {
      return null
    }
  }, [])

  const filteredResults = results.filter(u => u.id !== currentUserId)

  const [sentRequests, setSentRequests] = useState(new Set())

  const respondMutation = useMutation({
    mutationFn: respondFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
    }
  })

  const addFriendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
      setSentRequests(prev => new Set(prev).add(userId))
    },
    onError: (error, userId) => {
      const errData = error?.response?.data
      const errMessage = errData?.message || errData?.details?.[0] || ''
      if (error?.response?.status === 400 && errMessage.includes('already sent')) {
        // The backend knows we sent it, but it's not returning in the GET list.
        // We mark it as pending locally so the UI updates.
        setSentRequests(prev => new Set(prev).add(userId))
      } else {
        const errDetail = errData?.detail || errData || error?.response?.statusText || error?.message
        alert(`Error sending request: ${typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail}`)
      }
    }
  })

  const handleRespond = (id, status) => {
    respondMutation.mutate({ id, status })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setActiveQuery(searchInput)
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>{t('dashboard.title')}
        </Link>
      </div>
      
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h4 className="card-title mb-4">{t('friends.searchTitle')}</h4>
          
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder={t('friends.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">{t('friends.searchButton')}</button>
            </div>
          </form>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('friends.loading')}</span>
              </div>
            </div>
          ) : isError ? (
            <div className="alert alert-danger text-center">
              Error: {error?.response?.data?.detail || error?.response?.statusText || error?.message || 'Failed to load users'}
              <br/>
              <small>Status Code: {error?.response?.status}</small>
            </div>
          ) : filteredResults.length > 0 ? (
            <ul className="list-group">
              {filteredResults.map(user => {
                const relationship = allRelationships.find(f => f.friend?.id === user.id)
                const isSent = sentRequests.has(user.id)
                
                return (
                  <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold">{user.username}</div>
                        <div className="text-muted small">{user.email}</div>
                      </div>
                    </div>
                    
                    <div>
                      {relationship?.status === 'ACCEPTED' ? (
                        <span className="badge bg-secondary">Friends</span>
                      ) : relationship?.status === 'PENDING' ? (
                        <div className="d-flex gap-2">
                          {relationship.is_initiator || isSent ? (
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleRespond(relationship.id, 'REJECTED')}
                            >
                              {t('friends.status.cancel', 'Cancel')}
                            </button>
                          ) : (
                            <>
                              <button 
                                className="btn btn-sm btn-success" 
                                onClick={() => handleRespond(relationship.id, 'ACCEPTED')}
                              >
                                {t('friends.status.accept', 'Accept')}
                              </button>
                              <button 
                                className="btn btn-sm btn-danger" 
                                onClick={() => handleRespond(relationship.id, 'REJECTED')}
                              >
                                {t('friends.status.reject', 'Reject')}
                              </button>
                            </>
                          )}
                        </div>
                      ) : isSent ? (
                        <button className="btn btn-sm btn-secondary" disabled>
                          {t('friends.status.PENDING', 'Pending')}
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => addFriendMutation.mutate(user.id)}
                          disabled={addFriendMutation.isPending}
                        >
                          {t('friends.addFriend')}
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : activeQuery ? (
            <div className="text-center text-muted py-4">
              {t('friends.noUsersFound')} "{activeQuery}"
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              {t('friends.noUsersFound')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserSearchPage
