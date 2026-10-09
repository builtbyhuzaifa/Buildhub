import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p className="muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  )
}
