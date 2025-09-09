# Ersag Dropshipping Platform - Frontend

Next.js 14 asosida qurilgan frontend ilovasi. Modern UI/UX, responsive dizayn va real-time funksiyalar bilan.

## Texnologiyalar

- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management
- **Axios** - API client
- **React Hot Toast** - Notifications

## Sahifalar

### Umumiy sahifalar
- `/` - Bosh sahifa
- `/products` - Mahsulotlar ro'yxati
- `/products/:id` - Mahsulot tafsilotlari
- `/checkout` - Buyurtma berish
- `/orders` - Mening buyurtmalarim
- `/profile` - Profil sozlamalari

### Admin sahifalar
- `/admin` - Admin panel
  - Dashboard - Statistika
  - Orders - Buyurtmalar boshqaruvi
  - Users - Foydalanuvchilar boshqaruvi
  - Settings - Sozlamalar

### Auth sahifalar
- `/auth/login` - Tizimga kirish
- `/auth/register` - Ro'yxatdan o'tish

## Komponentlar

### Layout
- `Header` - Sayt sarlavhasi va navigatsiya
- `Footer` - Sayt pastki qismi

### Auth
- `AuthDialog` - Kirish/ro'yxatdan o'tish modal
- `LoginForm` - Kirish formasi
- `RegisterForm` - Ro'yxatdan o'tish formasi

### Products
- `ProductCard` - Mahsulot kartasi
- `FeaturedProducts` - Tavsiya etilgan mahsulotlar
- `Categories` - Kategoriyalar ro'yxati

### Cart
- `CartDialog` - Savatcha modal
- `CartItem` - Savatcha elementi

### Captcha
- `CaptchaModal` - Captcha yechish modal

### Admin
- `StatsCards` - Statistika kartalari
- `OrdersTable` - Buyurtmalar jadvali
- `UsersTable` - Foydalanuvchilar jadvali
- `SettingsPanel` - Sozlamalar paneli

## State Management

### AuthProvider
Foydalanuvchi autentifikatsiyasi va profil ma'lumotlari:
```typescript
const { user, loading, login, register, logout, updateProfile } = useAuth()
```

### CartProvider
Savatcha boshqaruvi:
```typescript
const { items, totalAmount, itemCount, addToCart, updateQuantity, removeFromCart, clearCart } = useCart()
```

## API Integration

Axios asosida API client:
```typescript
import api from '@/lib/api'

// GET request
const response = await api.get('/products')

// POST request
const response = await api.post('/orders', orderData)
```

## Styling

TailwindCSS + shadcn/ui komponentlari:
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```

## Form Validation

React Hook Form + Zod:
```typescript
const schema = z.object({
  name: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  email: z.string().email('To\'g\'ri email kiriting'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

## Responsive Design

Mobile-first approach:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Ishga tushirish

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

## Build va Deploy

### Vercel (Tavsiya etiladi)
```bash
# Vercel CLI
vercel

# Yoki GitHub integration
# Vercel dashboard orqali
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Performance

- **Image Optimization** - Next.js Image komponenti
- **Code Splitting** - Automatic code splitting
- **Lazy Loading** - Dynamic imports
- **Caching** - API response caching
- **Bundle Analysis** - `npm run analyze`

## SEO

- **Metadata API** - Dynamic meta tags
- **Sitemap** - Automatic sitemap generation
- **Robots.txt** - Search engine directives
- **Open Graph** - Social media sharing

## Accessibility

- **ARIA labels** - Screen reader support
- **Keyboard navigation** - Full keyboard support
- **Color contrast** - WCAG compliance
- **Focus management** - Proper focus handling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Tailwind CSS IntelliSense** - CSS autocomplete