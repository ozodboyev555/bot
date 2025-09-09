'use client'

import { useState } from 'react'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const [loading, setLoading] = useState(false)
  const { updateQuantity, removeFromCart } = useCart()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setLoading(true)
      await updateQuantity(item.productId, newQuantity)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    try {
      setLoading(true)
      await removeFromCart(item.productId)
      toast.success('Mahsulot savatchadan o\'chirildi')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <div className="relative h-16 w-16 flex-shrink-0">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover rounded"
          />
        ) : (
          <div className="h-full w-full bg-muted rounded flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Rasm yo'q</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.product.price)}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-16 h-8 text-center"
          disabled={loading}
        />

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={loading}
        >
          <Plus className="h-3 w-3" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleRemove}
          disabled={loading}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}