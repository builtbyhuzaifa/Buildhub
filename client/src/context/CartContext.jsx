import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'buildhub_cart'

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  const value = useMemo(() => {
    const addItem = (product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((i) => i._id === product._id)
        if (existing) {
          return current.map((i) =>
            i._id === product._id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.inventory) }
              : i
          )
        }
        return [
          ...current,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            inventory: product.inventory,
            quantity: Math.min(quantity, product.inventory),
          },
        ]
      })
    }

    const updateQuantity = (id, quantity) =>
      setItems((current) =>
        current.map((i) =>
          i._id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.inventory)) } : i
        )
      )

    const removeItem = (id) => setItems((current) => current.filter((i) => i._id !== id))
    const clear = () => setItems([])

    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    return { items, count, total, addItem, updateQuantity, removeItem, clear }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)
