import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import LanguageSelector from '../../components/LanguageSelector'

const RegisterPage = () => {
  const { t } = useTranslation()
  const { register, isRegistering, registerError } = useAuth()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const getErrorMessage = (error) => {
    if (!error) return null
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') return data
      
      // Check if there is a 'details' object containing the actual field errors
      let errorObj = data
      if (data.details && typeof data.details === 'object' && Object.keys(data.details).length > 0) {
        errorObj = data.details
      }

      if (typeof errorObj === 'object') {
        const errors = []
        for (const [key, val] of Object.entries(errorObj)) {
          // Ignore wrapper keys if iterating over the root object
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

      // Fallback for weird backend python strings
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
    if (password !== confirmPassword) {
      setValidationError(t('auth.register.passwordMismatch'))
      return
    }
    setValidationError('')
    
    try {
      await register({ username, email, password })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="w-100 d-flex justify-content-end gap-2 p-3 position-absolute top-0 end-0">
        <LanguageSelector />
      </div>
      
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">{t('auth.register.title')}</h2>
        
        {validationError && (
          <div className="alert alert-warning" role="alert">
            {validationError}
          </div>
        )}

        {registerError && (
          <div className="alert alert-danger" role="alert">
            <strong>{t('auth.register.error')}</strong> <br />
            {getErrorMessage(registerError)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{t('auth.register.username')}</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{t('auth.register.email')}</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{t('auth.register.password')}</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">{t('auth.register.confirmPassword')}</label>
            <input 
              type="password" 
              className="form-control" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={isRegistering}
          >
            {isRegistering ? t('auth.register.loading') : t('auth.register.button')}
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <small>
            {t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.loginLink')}</Link>
          </small>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
