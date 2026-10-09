import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { api, formatPrice } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { user } = useAuth()
  const { items, total, updateQuantity, removeItem, clear } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState({ line1: '', city: '', pincode: '', phone: '' })
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <p className="muted">Add some materials to get started.</p>
        <Link to="/products" className="btn btn-primary">Browse products</Link>
      </div>
    )
  }

  const update = (key) => (e) => setAddress({ ...address, [key]: e.target.value })

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    setError('')
    setPlacing(true)
    try {
      await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
          shippingAddress: address,
        },
      })
      clear()
      navigate('/orders', { state: { placed: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="cart-layout">
      <section>
        <h1>Cart</h1>
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item._id} className="card cart-item">
              <div>
                <Link to={`/products/${item._id}`}><strong>{item.name}</strong></Link>
                <p className="muted small">{formatPrice(item.price)} / {item.unit}</p>
              </div>
              <input
                type="number"
                min="1"
                max={item.inventory}
                value={item.quantity}
                aria-label={`Quantity for ${item.name}`}
                onChange={(e) => updateQuantity(item._id, Number(e.target.value) || 1)}
              />
              <strong>{formatPrice(item.price * item.quantity)}</strong>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="card checkout">
        <h2>Checkout</h2>
        <p className="total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </p>
        <form onSubmit={placeOrder} className="form">
          <label className="field">
            <span>Delivery address</span>
            <input required value={address.line1} onChange={update('line1')} placeholder="House / site, street" />
          </label>
          <div className="field-row">
            <label className="field">
              <span>City</span>
              <input required value={address.city} onChange={update('city')} />
            </label>
            <label className="field">
              <span>Pincode</span>
              <input required pattern="[0-9]{6}" title="6-digit pincode" value={address.pincode} onChange={update('pincode')} />
            </label>
          </div>
          <label className="field">
            <span>Phone</span>
            <input required type="tel" pattern="[0-9]{10}" title="10-digit mobile number" value={address.phone} onChange={update('phone')} />
          </label>
          {error && <p className="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={placing}>
            {user ? (placing ? 'Placing order…' : 'Place order') : 'Log in to place order'}
          </button>
          <p className="muted small">Payment on delivery.</p>
        </form>
      </aside>
    </div>
  )
}
