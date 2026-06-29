import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            background: 'var(--primary)',
            borderRadius: 14,
            marginBottom: 16,
            fontSize: 24,
          }}>🎯</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>
            Brand Funnel System
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 13 }}>
            CRM Pipeline
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ justifyContent: 'center', marginTop: 4, padding: '10px 16px' }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Connexion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
