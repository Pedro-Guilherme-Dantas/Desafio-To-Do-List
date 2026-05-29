import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import LanguageSelector from '../../components/LanguageSelector'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, isLoggingIn, loginError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const isSuccess = location.state?.registrationSuccess
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const getErrorMessage = (error) => {
    if (!error) return null

    // Handle standard unauthorized / incorrect credentials gracefully
    if (error.response?.status === 401) {
      return t('auth.login.invalidCredentials')
    }

    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') return data
      
      let errorObj = data
      if (data.details && typeof data.details === 'object' && Object.keys(data.details).length > 0) {
        errorObj = data.details
      }

      if (typeof errorObj === 'object') {
        const errors = []
        for (const [key, val] of Object.entries(errorObj)) {
          if (errorObj === data && (key === 'error' || key === 'message' || key === 'details')) continue
          
          if (Array.isArray(val)) {
            errors.push(`${key}: ${val.join(', ')}`)
          } else if (typeof val === 'object' && val !== null) {
            errors.push(`${key}: Formato inválido`)
          } else {
            errors.push(`${key}: ${val}`)
          }
        }
        if (errors.length > 0) return errors.join(' | ')
      }

      if (data.message && typeof data.message === 'string') {
        return data.message
          .replace(/ErrorDetail\(string='([^']+)'[^)]*\)/g, '$1')
          .replace(/[{}[\]']/g, '')
          .trim()
      }
    }
    return error.message || 'Erro desconhecido'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ username, password })
    } catch (err) {
      // Error is handled by useAuth/React Query, but we prevent default crash here
      console.error(err)
    }
  }

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="w-100 d-flex justify-content-end gap-2 p-3 position-absolute top-0 end-0">
        <LanguageSelector />
      </div>
      
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">{t('auth.login.title')}</h2>
        
        {isSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {t('auth.register.success')}
            <button type="button" className="btn-close" onClick={() => navigate('.', { replace: true })} aria-label="Close"></button>
          </div>
        )}

        {loginError && (
          <div className="alert alert-danger" role="alert">
            <strong>{t('auth.login.authFailed')}</strong> <br />
            {getErrorMessage(loginError)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{t('auth.login.username')}</label>
            <input 
              type="text"
              name="username"
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{t('auth.login.password')}</label>
            <input 
              type="password"
              name="password"
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={isLoggingIn}
          >
            {isLoggingIn ? t('auth.login.loading') : t('auth.login.button')}
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <small>
            {t('auth.login.noAccount')} <Link to="/register">{t('auth.login.registerLink')}</Link>
          </small>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
