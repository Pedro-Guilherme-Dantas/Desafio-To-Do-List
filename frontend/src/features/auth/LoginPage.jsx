import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import ThemeToggle from '../../components/ThemeToggle'
import LanguageSelector from '../../components/LanguageSelector'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, isLoggingIn, loginError } = useAuth()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const getErrorMessage = (error) => {
    if (!error) return null
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') return data
      if (typeof data === 'object') {
        // Formatar erros de API de login (ex: credenciais inválidas)
        return Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ')
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
        <ThemeToggle />
      </div>
      
      <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">{t('auth.login.title', 'Login')}</h2>
        
        {loginError && (
          <div className="alert alert-danger" role="alert">
            <strong>Falha na autenticação:</strong> <br />
            {getErrorMessage(loginError)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
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
            {isLoggingIn ? '...' : t('auth.login.title', 'Login')}
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <small>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </small>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
