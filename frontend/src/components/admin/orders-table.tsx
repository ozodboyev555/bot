'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [page, status])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status && { status }),
      })

      const response = await api.get(`/orders?${params}`)
      const data = response.data
      
      setOrders(data.orders || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      toast.success('Buyurtma holati yangilandi')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      PROCESSING: 'default',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
      FAILED: 'destructive',
    } as const

    const labels = {
      PENDING: 'Kutilmoqda',
      PROCESSING: 'Qayta ishlanmoqda',
      COMPLETED: 'Yakunlangan',
      CANCELLED: 'Bekor qilingan',
      FAILED: 'Xatolik',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      COMPLETED: 'default',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    } as const

    const labels = {
      PENDING: 'Kutilmoqda',
      COMPLETED: 'To\'langan',
      FAILED: 'Xatolik',
      REFUNDED: 'Qaytarilgan',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Holat bo'yicha filtrlash" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Barcha holatlar</SelectItem>
            <SelectItem value="PENDING">Kutilmoqda</SelectItem>
            <SelectItem value="PROCESSING">Qayta ishlanmoqda</SelectItem>
            <SelectItem value="COMPLETED">Yakunlangan</SelectItem>
            <SelectItem value="CANCELLED">Bekor qilingan</SelectItem>
            <SelectItem value="FAILED">Xatolik</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchOrders} variant="outline">
          Yangilash
        </Button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.customerPhone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatPrice(order.totalAmount)}</div>
                    <div className="flex space-x-2 mt-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Manzil:</span> {order.customerAddress}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Viloyat:</span> {order.customerRegion}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Tuman:</span> {order.customerDistrict}
                  </p>
                  {order.customerNotes && (
                    <p className="text-sm">
                      <span className="font-medium">Izoh:</span> {order.customerNotes}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="font-medium">Mahsulotlar:</h4>
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                        <SelectItem value="PROCESSING">Qayta ishlanmoqda</SelectItem>
                        <SelectItem value="COMPLETED">Yakunlangan</SelectItem>
                        <SelectItem value="CANCELLED">Bekor qilingan</SelectItem>
                        <SelectItem value="FAILED">Xatolik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {order.ersagReceiptUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={order.ersagReceiptUrl} target="_blank" rel="noopener noreferrer">
                        Chekni ko'rish
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Oldingi
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Keyingi
          </Button>
        </div>
      )}
    </div>
  )
}