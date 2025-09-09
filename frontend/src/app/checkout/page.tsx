'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/components/providers/cart-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CaptchaModal } from '@/components/captcha/captcha-modal'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  customerPhone: z.string().min(9, 'Telefon raqam to\'liq kiritilishi kerak'),
  customerEmail: z.string().email('To\'g\'ri email kiriting').optional().or(z.literal('')),
  customerAddress: z.string().min(10, 'Manzil kamida 10 ta belgi bo\'lishi kerak'),
  customerRegion: z.string().min(1, 'Viloyat tanlanishi kerak'),
  customerDistrict: z.string().min(1, 'Tuman tanlanishi kerak'),
  customerNotes: z.string().optional(),
  paymentMethod: z.string().min(1, 'To\'lov usuli tanlanishi kerak'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const regions = [
  'Toshkent viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  'Farg\'ona viloyati',
  'Jizzax viloyati',
  'Xorazm viloyati',
  'Namangan viloyati',
  'Navoiy viloyati',
  'Qashqadaryo viloyati',
  'Qoraqalpog\'iston Respublikasi',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati',
]

const districts = [
  'Toshkent tumani',
  'Olmaliq tumani',
  'Angren tumani',
  'Bekobod tumani',
  'Bo\'ka tumani',
  'Bo\'stonliq tumani',
  'Chirchiq tumani',
  'O\'rtachirchiq tumani',
  'Parkent tumani',
  'Piskent tumani',
  'Quyi Chirchiq tumani',
  'Yangiyo\'l tumani',
  'Zangiota tumani',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      customerPhone: user?.phone || '',
      customerEmail: user?.email || '',
    },
  })

  const selectedRegion = watch('customerRegion')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (items.length === 0) {
      router.push('/products')
      return
    }
  }, [user, items, router])

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true)
      
      // Create order
      const orderResponse = await api.post('/orders', data)
      const order = orderResponse.data
      setOrderId(order.id)

      // Create payment
      const paymentResponse = await api.post('/payments/create', {
        orderId: order.id,
        paymentMethod: data.paymentMethod,
        amount: totalAmount,
      })

      if (paymentResponse.data.success) {
        // Check if captcha is required
        if (paymentResponse.data.requiresCaptcha) {
          setShowCaptcha(true)
          return
        }

        // Redirect to payment URL
        window.location.href = paymentResponse.data.paymentUrl
      } else {
        throw new Error(paymentResponse.data.message || 'To\'lov yaratilmadi')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false)
    toast.success('Buyurtma muvaffaqiyatli yaratildi!')
    clearCart()
    router.push('/orders')
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Buyurtma berish</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle>Buyurtma ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Ism *</Label>
                      <Input
                        id="customerName"
                        {...register('customerName')}
                        placeholder="Ismingiz"
                      />
                      {errors.customerName && (
                        <p className="text-sm text-destructive">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Telefon raqam *</Label>
                      <Input
                        id="customerPhone"
                        {...register('customerPhone')}
                        placeholder="+998901234567"
                      />
                      {errors.customerPhone && (
                        <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email (ixtiyoriy)</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      {...register('customerEmail')}
                      placeholder="email@example.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Manzil *</Label>
                    <Input
                      id="customerAddress"
                      {...register('customerAddress')}
                      placeholder="To'liq manzil"
                    />
                    {errors.customerAddress && (
                      <p className="text-sm text-destructive">{errors.customerAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerRegion">Viloyat *</Label>
                      <Select onValueChange={(value) => setValue('customerRegion', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Viloyat tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.customerRegion && (
                        <p className="text-sm text-destructive">{errors.customerRegion.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerDistrict">Tuman *</Label>
                      <Select onValueChange={(value) => setValue('customerDistrict', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tuman tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.customerDistrict && (
                        <p className="text-sm text-destructive">{errors.customerDistrict.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerNotes">Qo'shimcha izoh</Label>
                    <Input
                      id="customerNotes"
                      {...register('customerNotes')}
                      placeholder="Buyurtma haqida qo'shimcha ma'lumot"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">To'lov usuli *</Label>
                    <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="To'lov usulini tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payme">Payme</SelectItem>
                        <SelectItem value="click">Click</SelectItem>
                        <SelectItem value="uzcard">Uzcard</SelectItem>
                        <SelectItem value="humo">Humo</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Buyurtma yaratilmoqda...' : 'Buyurtma berish'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Buyurtma xulosasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Jami:</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Captcha Modal */}
      {orderId && (
        <CaptchaModal
          open={showCaptcha}
          onOpenChange={setShowCaptcha}
          orderId={orderId}
          onSuccess={handleCaptchaSuccess}
        />
      )}
    </div>
  )
}