import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { api, formatPrice } from '../api'

export default function Orders() {
  const location = useLocation()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  const load = () =>
    api('/orders/mine')
      .then((d) => setOrders(d.orders))
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await api(`/orders/${id}/status`, { method: 'PATCH', body: { status: 'cancelled' } })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>My orders</h1>
      {location.state?.placed && <p className="success">Order placed! The seller will confirm it shortly.</p>}
      {error && <p className="alert">{error}</p>}
      {!orders ? (
        <p className="muted">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="empty">You haven&apos;t placed any orders yet.</div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order._id} className="card order">
              <div className="order-head">
                <div>
                  <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <p className="muted small">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <span className={`status status-${order.status}`}>{order.status}</span>
              </div>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.product}>
                    {item.name} × {item.quantity}
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-foot">
                <strong>Total {formatPrice(order.total)}</strong>
                {['placed', 'confirmed'].includes(order.status) && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => cancel(order._id)}>
                    Cancel order
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
