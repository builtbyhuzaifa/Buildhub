import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { api, formatPrice } from '../api'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/ProductImage'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    api(`/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch((err) => setError(err.message))
  }, [id])

  if (error) return <p className="alert">{error}</p>
  if (!product) return <p className="muted">Loading…</p>

  const inStock = product.inventory > 0

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
  }

  return (
    <>
      <Link to="/products" className="back-link">← Back to products</Link>
      <div className="detail">
        <ProductImage product={product} large />
        <div className="detail-info">
          {product.category && <span className="tag">{product.category.name}</span>}
          <h1>{product.name}</h1>
          <p className="price price-lg">
            {formatPrice(product.price)} <span className="muted">/ {product.unit}</span>
          </p>
          <p>{product.description}</p>

          <dl className="meta">
            <div><dt>Seller</dt><dd>{product.seller?.company || product.seller?.name}</dd></div>
            <div><dt>Availability</dt><dd className={inStock ? 'ok' : 'danger'}>{inStock ? `${product.inventory} in stock` : 'Out of stock'}</dd></div>
          </dl>

          {inStock && (
            <div className="buy-row">
              <label className="field qty">
                <span>Quantity</span>
                <input
                  type="number"
                  min="1"
                  max={product.inventory}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.inventory)))}
                />
              </label>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>
                Add to cart · {formatPrice(product.price * quantity)}
              </button>
            </div>
          )}
          {added && (
            <p className="success">
              Added to cart. <Link to="/cart">Go to cart →</Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
