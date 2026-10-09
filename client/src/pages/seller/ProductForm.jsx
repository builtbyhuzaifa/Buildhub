import { useState } from 'react'
import { api } from '../../api'

const EMPTY = { name: '', price: '', unit: 'piece', description: '', category: '', inventory: '', image: '' }

export default function ProductForm({ product, categories, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name,
          price: product.price,
          unit: product.unit,
          description: product.description,
          category: product.category?._id || '',
          inventory: product.inventory,
          image: (product.image || []).join('\n'),
        }
      : EMPTY
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const body = {
      ...form,
      price: Number(form.price),
      inventory: Number(form.inventory),
      image: form.image.split('\n').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (product) {
        await api(`/products/${product._id}`, { method: 'PATCH', body })
      } else {
        await api('/products', { method: 'POST', body })
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card product-form form" onSubmit={handleSubmit}>
      <h2>{product ? 'Edit product' : 'New product'}</h2>
      <div className="form-grid">
        <label className="field span-2">
          <span>Name</span>
          <input required minLength={2} value={form.name} onChange={update('name')} />
        </label>
        <label className="field">
          <span>Category</span>
          <select required value={form.category} onChange={update('category')}>
            <option value="">Choose…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Price (₹)</span>
          <input type="number" min="0" step="0.01" required value={form.price} onChange={update('price')} />
        </label>
        <label className="field">
          <span>Unit</span>
          <input required value={form.unit} onChange={update('unit')} placeholder="bag, kg, sq ft…" />
        </label>
        <label className="field">
          <span>Stock</span>
          <input type="number" min="0" step="1" required value={form.inventory} onChange={update('inventory')} />
        </label>
        <label className="field span-2">
          <span>Description</span>
          <textarea required minLength={10} rows={3} value={form.description} onChange={update('description')} />
        </label>
        <label className="field span-2">
          <span>Image URLs (one per line, optional)</span>
          <textarea rows={2} value={form.image} onChange={update('image')} />
        </label>
      </div>
      {error && <p className="alert">{error}</p>}
      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  )
}
