import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [result, setResult] = useState({ products: [], pagination: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const filters = Object.fromEntries(searchParams.entries())
  const queryKey = searchParams.toString()

  useEffect(() => {
    api('/categories').then((d) => setCategories(d.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    api('/products', { params: { limit: 12, ...Object.fromEntries(new URLSearchParams(queryKey)) } })
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [queryKey])

  // Changing any filter sends the user back to page 1.
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilter('search', search.trim())
  }

  const { products, pagination } = result
  const page = pagination?.page || 1

  return (
    <div className="shop-layout">
      <aside className="filters card">
        <h2 className="filters-title">Filters</h2>

        <label className="field">
          <span>Category</span>
          <select value={filters.category || ''} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>Min ₹</span>
            <input
              key={`min-${filters.minPrice || ''}`}
              type="number"
              min="0"
              defaultValue={filters.minPrice || ''}
              onBlur={(e) => setFilter('minPrice', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Max ₹</span>
            <input
              key={`max-${filters.maxPrice || ''}`}
              type="number"
              min="0"
              defaultValue={filters.maxPrice || ''}
              onBlur={(e) => setFilter('maxPrice', e.target.value)}
            />
          </label>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => setFilter('inStock', e.target.checked ? 'true' : '')}
          />
          In stock only
        </label>

        <button type="button" className="btn btn-ghost btn-block" onClick={() => { setSearch(''); setSearchParams({}) }}>
          Clear filters
        </button>
      </aside>

      <section>
        <div className="shop-toolbar">
          <form onSubmit={handleSearch} className="search">
            <input
              type="search"
              placeholder="Search cement, tiles, plywood…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <select value={filters.sort || 'newest'} onChange={(e) => setFilter('sort', e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {pagination && (
          <p className="muted small">{pagination.totalProducts} products found</p>
        )}
        {error && <p className="alert">{error}</p>}

        {loading ? (
          <p className="muted">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="empty">No products match these filters.</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <nav className="pagination" aria-label="Pages">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setFilter('page', String(page - 1))}>
              ← Previous
            </button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= pagination.totalPages} onClick={() => setFilter('page', String(page + 1))}>
              Next →
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
