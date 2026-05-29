import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchUsers, sendFriendRequest } from './api'
import { Link } from 'react-router-dom'

const UserSearchPage = () => {
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const { data: results = [], isLoading, refetch } = useQuery({
    queryKey: ['userSearch', query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 2
  })

  const addFriendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      alert('Friend request sent!')
    }
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.length > 2) {
      refetch()
    }
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </Link>
      </div>
      
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h4 className="card-title mb-4">Find Friends</h4>
          
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search users by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </form>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <ul className="list-group">
              {results.map(user => (
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
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => addFriendMutation.mutate(user.id)}
                    disabled={addFriendMutation.isPending}
                  >
                    Add Friend
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length > 2 ? (
            <div className="text-center text-muted py-4">
              No users found matching "{query}"
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              Type at least 3 characters to search.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserSearchPage
