import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/categories'), api('/products', { params: { limit: 8, sort: 'newest' } })])
      .then(([c, p]) => {
        setCategories(c.categories)
        setProducts(p.products)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Building materials, delivered</p>
          <h1>Everything your site needs, from sellers you can trust.</h1>
          <p className="lead">
            Compare prices on cement, TMT steel, tiles, plywood and paint from local suppliers — and order in a few clicks.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Browse materials</Link>
            <Link to="/register?role=seller" className="btn btn-ghost">Sell on Buildhub</Link>
          </div>
        </div>
        <ul className="hero-stats">
          <li><strong>{categories.length || '—'}</strong><span>categories</span></li>
          <li><strong>{categories.reduce((n, c) => n + c.productCount, 0) || '—'}</strong><span>products listed</span></li>
          <li><strong>Live</strong><span>stock tracking</span></li>
        </ul>
      </section>

      {error && <p className="alert">{error}</p>}

      <section className="section">
        <div className="section-head">
          <h2>Shop by category</h2>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c._id} to={`/products?category=${c.slug}`} className="card category-card">
              <h3>{c.name}</h3>
              <p className="muted small">{c.productCount} products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>New arrivals</h2>
          <Link to="/products">View all →</Link>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </>
  )
}
