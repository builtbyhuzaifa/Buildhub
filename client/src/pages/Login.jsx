import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  { label: 'Buyer', email: 'buyer@buildhub.dev', password: 'buyer123' },
  { label: 'Seller', email: 'seller@buildhub.dev', password: 'seller123' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form.email, form.password)
      const fallback = user.role === 'buyer' ? '/products' : '/dashboard'
      navigate(location.state?.from || fallback, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth card">
      <h1>Welcome back</h1>
      <p className="muted">Log in to place orders or manage your store.</p>

      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="demo">
        <span className="muted small">Try a demo account:</span>
        {DEMO_ACCOUNTS.map((a) => (
          <button key={a.label} type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ email: a.email, password: a.password })}>
            {a.label}
          </button>
        ))}
      </div>

      <p className="muted small">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}
