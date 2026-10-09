import { useCallback, useEffect, useState } from 'react'
import { api, formatPrice } from '../../api'
import { useAuth } from '../../context/AuthContext'
import ProductForm from './ProductForm'

const NEXT_ACTIONS = {
  placed: [{ status: 'confirmed', label: 'Confirm' }, { status: 'cancelled', label: 'Reject' }],
  confirmed: [{ status: 'shipped', label: 'Mark shipped' }],
  shipped: [{ status: 'delivered', label: 'Mark delivered' }],
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null) // null = closed, {} = new, product = edit
  const [error, setError] = useState('')

  const loadProducts = useCallback(
    () => api('/products/mine', { params: { limit: 100 } }).then((d) => setProducts(d.products)),
    []
  )
  const loadOrders = useCallback(() => api('/orders/seller').then((d) => setOrders(d.orders)), [])

  useEffect(() => {
    Promise.all([loadProducts(), loadOrders(), api('/categories').then((d) => setCategories(d.categories))])
      .catch((err) => setError(err.message))
  }, [loadProducts, loadOrders])

  const handleSaved = () => {
    setEditing(null)
    loadProducts().catch((err) => setError(err.message))
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    try {
      await api(`/products/${product._id}`, { method: 'DELETE' })
      await loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const changeStatus = async (orderId, status) => {
    try {
      await api(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } })
      await Promise.all([loadOrders(), loadProducts()])
    } catch (err) {
      setError(err.message)
    }
  }

  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.sellerTotal ?? o.total), 0)
  const lowStock = products.filter((p) => p.inventory < 10).length
  const pending = orders.filter((o) => o.status === 'placed').length

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Seller dashboard</h1>
          <p className="muted">{user.company || user.name}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          + Add product
        </button>
      </div>

      <div className="stats">
        <div className="card stat"><span>Products</span><strong>{products.length}</strong></div>
        <div className="card stat"><span>New orders</span><strong>{pending}</strong></div>
        <div className="card stat"><span>Low stock</span><strong>{lowStock}</strong></div>
        <div className="card stat"><span>Revenue</span><strong>{formatPrice(revenue)}</strong></div>
      </div>

      {error && <p className="alert">{error}</p>}

      {editing && (
        <ProductForm
          key={editing._id || 'new'}
          product={editing._id ? editing : null}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'products'} className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          My products
        </button>
        <button type="button" role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders {pending > 0 && <span className="badge">{pending}</span>}
        </button>
      </div>

      {tab === 'products' ? (
        products.length === 0 ? (
          <div className="empty">You haven&apos;t listed any products yet.</div>
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category?.name}</td>
                    <td>{formatPrice(p.price)} / {p.unit}</td>
                    <td className={p.inventory < 10 ? 'danger' : ''}>{p.inventory}</td>
                    <td className="row-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Edit</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : orders.length === 0 ? (
        <div className="empty">No orders yet.</div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order._id} className="card order">
              <div className="order-head">
                <div>
                  <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <p className="muted small">
                    {order.buyer?.name} · {order.shippingAddress.city} {order.shippingAddress.pincode} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
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
                <strong>{formatPrice(order.sellerTotal ?? order.total)}</strong>
                <div className="row-actions">
                  {(NEXT_ACTIONS[order.status] || []).map((a) => (
                    <button key={a.status} type="button" className="btn btn-ghost btn-sm" onClick={() => changeStatus(order._id, a.status)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
