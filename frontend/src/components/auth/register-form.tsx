'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

const registerSchema = z.object({
  email: z.string().email('To\'g\'ri email kiriting').optional().or(z.literal('')),
  phone: z.string().min(1, 'Telefon raqam kiritilishi shart'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
  firstName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta belgi bo\'lishi kerak'),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true)
      await registerUser(data)
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ism</Label>
          <Input
            id="firstName"
            placeholder="Ismingiz"
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Familiya</Label>
          <Input
            id="lastName"
            placeholder="Familiyangiz"
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon raqam</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+998901234567"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (ixtiyoriy)</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Parol</Label>
        <Input
          id="password"
          type="password"
          placeholder="Parolingizni kiriting"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Ro\'yxatdan o\'tmoqda...' : 'Ro\'yxatdan o\'tish'}
      </Button>
    </form>
  )
}