'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { CartItem } from '@/types'
import api from '@/lib/api'
import { useAuth } from './auth-provider'

interface CartContextType {
  items: CartItem[]
  totalAmount: number
  itemCount: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const totalAmount = items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  const itemCount = items.length

  const refreshCart = async () => {
    if (!user) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      const response = await api.get('/cart')
      setItems(response.data.items || [])
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [user])

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart')
    }

    try {
      await api.post('/cart/add', { productId, quantity })
      await refreshCart()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart')
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) {
      throw new Error('Please login to update cart')
    }

    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      await api.patch(`/cart/${productId}`, { quantity })
      await refreshCart()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item')
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) {
      throw new Error('Please login to remove items from cart')
    }

    try {
      await api.delete(`/cart/${productId}`)
      await refreshCart()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart')
    }
  }

  const clearCart = async () => {
    if (!user) {
      throw new Error('Please login to clear cart')
    }

    try {
      await api.delete('/cart')
      await refreshCart()
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart')
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      totalAmount,
      itemCount,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}