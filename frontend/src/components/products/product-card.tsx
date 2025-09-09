'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/components/providers/cart-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Mahsulotni savatchaga qo\'shish uchun tizimga kiring')
      return
    }

    try {
      setLoading(true)
      await addToCart(product.id, 1)
      toast.success('Mahsulot savatchaga qo\'shildi')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Rasm yo'q</span>
            </div>
          )}
          
          {product.category && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2"
            >
              {product.category}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {loading ? 'Qo\'shilmoqda...' : 'Savatchaga qo\'shish'}
        </Button>
      </CardFooter>
    </Card>
  )
}