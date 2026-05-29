import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './useAuth'
import ThemeToggle from '../../components/ThemeToggle'
import LanguageSelector from '../../components/LanguageSelector'

const RegisterPage = () => {
  const { register, isRegistering, registerError } = useAuth()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const getErrorMessage = (error) => {
    if (!error) return null
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') return data
      if (typeof data === 'object') {
        // Formatar erros típicos de APIs (ex: { username: ["Já existe"], email: ["Inválido"] })
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
      await register({ username, email, password })
    } catch (err) {
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
        <h2 className="text-center mb-4">Cadastro</h2>
        
        {registerError && (
          <div className="alert alert-danger" role="alert">
            <strong>Erro ao criar a conta:</strong> <br />
            {getErrorMessage(registerError)}
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
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            disabled={isRegistering}
          >
            {isRegistering ? '...' : 'Criar Conta'}
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <small>
            Já tem uma conta? <Link to="/login">Faça Login</Link>
          </small>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
