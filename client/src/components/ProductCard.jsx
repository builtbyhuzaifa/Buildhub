import { Link } from 'react-router'
import { formatPrice } from '../api'
import { useCart } from '../context/CartContext'
import ProductImage from './ProductImage'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const outOfStock = product.inventory < 1

  return (
    <article className="card product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <ProductImage product={product} />
        <div className="product-card-body">
          {product.category && <span className="tag">{product.category.name}</span>}
          <h3>{product.name}</h3>
          <p className="price">
            {formatPrice(product.price)} <span className="muted">/ {product.unit}</span>
          </p>
          {product.seller && <p className="muted small">by {product.seller.company || product.seller.name}</p>}
        </div>
      </Link>
      <div className="product-card-footer">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={outOfStock}
          onClick={() => addItem(product)}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  )
}
