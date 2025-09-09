'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCart } from '@/components/providers/cart-provider'
import { CartItem } from './cart-item'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface CartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDialog({ open, onOpenChange }: CartDialogProps) {
  const { items, totalAmount, itemCount, clearCart, loading } = useCart()

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Savatcha ({itemCount})</span>
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Savatchangiz bo'sh</p>
            <Button asChild className="mt-4">
              <Link href="/products">Mahsulotlarni ko'rish</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Jami:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tozalash
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/checkout" onClick={() => onOpenChange(false)}>
                    Buyurtma berish
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}