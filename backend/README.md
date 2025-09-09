# Ersag Dropshipping Platform - Backend

NestJS asosida qurilgan backend API. Ersag Global sayti bilan integratsiya, to'lov tizimlari, SMS xizmatlari va admin panel funksiyalarini ta'minlaydi.

## Texnologiyalar

- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **PostgreSQL** - Ma'lumotlar bazasi
- **Prisma** - ORM
- **BullMQ** + **Redis** - Queue management
- **Playwright** - Web automation
- **JWT** - Authentication
- **Swagger** - API documentation

## API Endpoints

### Authentication
- `POST /auth/register` - Ro'yxatdan o'tish
- `POST /auth/login` - Tizimga kirish
- `GET /auth/profile` - Profil ma'lumotlari
- `POST /auth/refresh` - Token yangilash

### Products
- `GET /products` - Mahsulotlar ro'yxati
- `GET /products/:id` - Mahsulot ma'lumotlari
- `GET /products/categories` - Kategoriyalar
- `POST /products` - Yangi mahsulot (Admin)
- `PATCH /products/:id` - Mahsulot yangilash (Admin)
- `DELETE /products/:id` - Mahsulot o'chirish (Admin)

### Orders
- `POST /orders` - Yangi buyurtma
- `GET /orders` - Buyurtmalar ro'yxati
- `GET /orders/my-orders` - Mening buyurtmalarim
- `GET /orders/:id` - Buyurtma ma'lumotlari
- `PATCH /orders/:id/status` - Buyurtma holatini yangilash (Admin)

### Cart
- `POST /cart/add` - Savatchaga qo'shish
- `GET /cart` - Savatcha ma'lumotlari
- `PATCH /cart/:productId` - Mahsulot miqdorini yangilash
- `DELETE /cart/:productId` - Mahsulotni o'chirish
- `DELETE /cart` - Savatchani tozalash

### Payments
- `POST /payments/create` - To'lov yaratish
- `POST /payments/verify` - To'lovni tasdiqlash
- `GET /payments/logs` - To'lov loglari

### SMS
- `POST /sms/send` - SMS yuborish
- `POST /sms/order-confirmation/:orderId` - Buyurtma tasdiqlash SMS
- `GET /sms/logs` - SMS loglari

### Captcha
- `GET /captcha/:orderId` - Captcha ma'lumotlari
- `POST /captcha/:orderId/solve` - Captcha yechish

### Settings
- `GET /settings` - Barcha sozlamalar (Admin)
- `GET /settings/public` - Ommaviy sozlamalar
- `GET /settings/secret` - Maxfiy sozlamalar (Admin)
- `PATCH /settings/:key` - Sozlama yangilash (Admin)

### Users
- `GET /users` - Foydalanuvchilar ro'yxati (Admin)
- `GET /users/profile` - Mening profilim
- `PATCH /users/profile` - Profil yangilash
- `PATCH /users/:id` - Foydalanuvchi yangilash (Admin)
- `DELETE /users/:id/deactivate` - Foydalanuvchini deaktivlashtirish (Admin)
- `POST /users/:id/activate` - Foydalanuvchini aktivlashtirish (Admin)

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ersag_dropshipping?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Ersag API
ERSAG_BASE_URL="https://ersag.uz"
ERSAG_REFERRAL_ID="your-referral-id"

# Payment APIs
PAYME_MERCHANT_ID="your-payme-merchant-id"
PAYME_SECRET_KEY="your-payme-secret-key"
CLICK_MERCHANT_ID="your-click-merchant-id"
CLICK_SECRET_KEY="your-click-secret-key"
UZCARD_MERCHANT_ID="your-uzcard-merchant-id"
UZCARD_SECRET_KEY="your-uzcard-secret-key"

# SMS API
ESKIZ_EMAIL="your-eskiz-email"
ESKIZ_PASSWORD="your-eskiz-password"

# App
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Ishga tushirish

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Database migrations
```bash
npx prisma generate
npx prisma db push
```

## Queue Jobs

### Order Processing
- `process-order` - Buyurtmani Ersag saytida qayta ishlash
- `solve-captcha` - Captcha yechish

## Web Automation

Playwright yordamida Ersag saytida avtomatik operatsiyalar:
- Foydalanuvchi ro'yxatdan o'tkazish
- Mahsulotlarni savatchaga qo'shish
- Buyurtma berish
- Captcha yechish

## Xavfsizlik

- JWT token authentication
- Password hashing (bcrypt)
- Input validation (class-validator)
- CORS configuration
- Rate limiting
- Helmet security headers

## Monitoring

- BullMQ dashboard (Redis)
- Prisma query logging
- Error logging
- Performance monitoring

## API Documentation

Swagger UI: http://localhost:3001/api/docs