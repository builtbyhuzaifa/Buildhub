import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'seller' ? 'seller' : 'buyer',
    company: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await register(form)
      navigate(user.role === 'seller' ? '/dashboard' : '/products', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth card">
      <h1>Create your account</h1>

      <div className="role-toggle" role="radiogroup" aria-label="Account type">
        {['buyer', 'seller'].map((role) => (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={form.role === role}
            className={form.role === role ? 'active' : ''}
            onClick={() => setForm({ ...form, role })}
          >
            {role === 'buyer' ? 'I want to buy' : 'I want to sell'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Full name</span>
          <input required value={form.name} onChange={update('name')} />
        </label>
        {form.role === 'seller' && (
          <label className="field">
            <span>Business name</span>
            <input required value={form.company} onChange={update('company')} />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={update('email')} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" required minLength={6} value={form.password} onChange={update('password')} />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="muted small">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
