import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFriends } from './api'
import { Link } from 'react-router-dom'

const FriendsSidebar = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends
  })

  return (
    <div className="card h-100 bg-light border-0">
      <div className="card-header bg-white border-bottom-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Friends</h5>
        <Link to="/friends/search" className="btn btn-sm btn-outline-primary">
          <i className="bi bi-search"></i>
        </Link>
      </div>
      <div className="card-body overflow-auto">
        {isLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center text-muted p-3">
            <small>No friends yet.</small>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {friends.map(friendship => (
              <li key={friendship.id} className="list-group-item bg-transparent px-0 d-flex align-items-center">
                <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                  {friendship.friend?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold small">{friendship.friend?.username}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{friendship.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FriendsSidebar
