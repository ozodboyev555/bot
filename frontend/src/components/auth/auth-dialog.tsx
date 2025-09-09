'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLogin ? 'Tizimga kirish' : 'Ro\'yxatdan o\'tish'}
          </DialogTitle>
        </DialogHeader>

        {isLogin ? (
          <LoginForm onSuccess={() => onOpenChange(false)} />
        ) : (
          <RegisterForm onSuccess={() => onOpenChange(false)} />
        )}

        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Hisobingiz yo'qmi?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-primary hover:underline"
              >
                Ro'yxatdan o'ting
              </button>
            </>
          ) : (
            <>
              Allaqachon hisobingiz bormi?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-primary hover:underline"
              >
                Tizimga kiring
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}