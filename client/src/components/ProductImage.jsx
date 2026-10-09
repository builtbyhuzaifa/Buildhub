// Shows the product's first image, or a coloured placeholder with its
// initials when the seller hasn't uploaded one.
const PALETTE = ['#c2410c', '#0f766e', '#1d4ed8', '#7c3aed', '#b45309', '#be123c', '#15803d']

function colorFor(text = '') {
  let hash = 0
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export default function ProductImage({ product, large = false }) {
  const src = product.image?.[0]
  const className = `product-image${large ? ' product-image-lg' : ''}`

  if (src) {
    return <img className={className} src={src} alt={product.name} loading="lazy" />
  }

  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`${className} product-image-placeholder`}
      style={{ background: colorFor(product.category?.name || product.name) }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
