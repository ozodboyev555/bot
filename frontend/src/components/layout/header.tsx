'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { CartDialog } from '@/components/cart/cart-dialog'
import { AuthDialog } from '@/components/auth/auth-dialog'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const { user, logout } = useAuth()
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary"></div>
          <span className="text-xl font-bold">Ersag</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Bosh sahifa
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary">
            Mahsulotlar
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-primary">
            Kategoriyalar
          </Link>
          {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
            <Link href="/admin" className="text-sm font-medium hover:text-primary">
              Admin
            </Link>
          ) : null}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link href="/profile">
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                Chiqish
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsAuthOpen(true)}>
              Kirish
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Bosh sahifa
              </Link>
              <Link href="/products" className="text-sm font-medium hover:text-primary">
                Mahsulotlar
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary">
                Kategoriyalar
              </Link>
              {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                <Link href="/admin" className="text-sm font-medium hover:text-primary">
                  Admin
                </Link>
              ) : null}
            </nav>

            <div className="flex items-center space-x-4 pt-4 border-t">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsCartOpen(true)
                  setIsMenuOpen(false)
                }}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout}>
                    Chiqish
                  </Button>
                </div>
              ) : (
                <Button onClick={() => {
                  setIsAuthOpen(true)
                  setIsMenuOpen(false)
                }}>
                  Kirish
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CartDialog open={isCartOpen} onOpenChange={setIsCartOpen} />
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </header>
  )
}