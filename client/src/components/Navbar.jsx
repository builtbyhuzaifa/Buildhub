import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">B</span>
          Buildhub
        </Link>

        <nav className="nav-links">
          <NavLink to="/products">Shop</NavLink>
          {user && <NavLink to="/orders">My orders</NavLink>}
          {user && user.role !== 'buyer' && <NavLink to="/dashboard">Dashboard</NavLink>}
          <NavLink to="/cart" className="cart-link">
            Cart{count > 0 && <span className="badge">{count}</span>}
          </NavLink>
          {user ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
