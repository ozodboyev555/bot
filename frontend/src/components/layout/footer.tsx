import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary"></div>
              <span className="text-xl font-bold">Ersag</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ersag Global mahsulotlarini sotib olish platformasi. 
              Qulay va xavfsiz xarid qiling.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Tezkor havolalar</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                Bosh sahifa
              </Link>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-primary">
                Mahsulotlar
              </Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary">
                Kategoriyalar
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                Biz haqimizda
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Yordam</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Aloqa
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                Savollar
              </Link>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary">
                Yetkazib berish
              </Link>
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-primary">
                Qaytarish
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Aloqa</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>+998 90 123 45 67</p>
              <p>info@ersag.uz</p>
              <p>Toshkent, O'zbekiston</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Ersag Dropshipping Platform. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Maxfiylik
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Shartlar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}