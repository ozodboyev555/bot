import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Ersag Global
                <span className="text-primary block">Mahsulotlari</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                O'zbekistondagi eng qulay va xavfsiz onlayn do'kon. 
                Ersag Global mahsulotlarini uydan chiqmasdan sotib oling.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Mahsulotlarni ko'rish
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/about">Biz haqimizda</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
              <div className="h-full w-full rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <ShoppingBag className="h-32 w-32 text-primary/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Tez yetkazib berish</h3>
            <p className="text-muted-foreground">
              Buyurtmangizni 24 soat ichida yetkazib beramiz
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Xavfsiz to'lov</h3>
            <p className="text-muted-foreground">
              Barcha to'lov tizimlari orqali xavfsiz to'lang
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">24/7 Yordam</h3>
            <p className="text-muted-foreground">
              Har doim sizga yordam berishga tayyormiz
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}