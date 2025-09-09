# Ersag Dropshipping Platform

Bu loyiha O'zbekistondagi foydalanuvchilarga Ersag Global mahsulotlarini sotib olishda qulaylik yaratish uchun yaratilgan. Platform foydalanuvchi uchun interfeys, to'lov tizimi va SMS xabarnoma xizmatlarini beradi. Buyurtma ma'lumotlari avtomatik ravishda Ersag saytiga yuboriladi.

## Asosiy xususiyatlar

- 🛒 **Onlayn do'kon interfeysi** - kategoriya, mahsulotlar, savatcha
- 💳 **To'lov tizimi** - UZCARD/HUMO/Click/Payme integratsiya
- 🤖 **Avtomatlashtirilgan buyurtma** - backend orqali Ersag saytida
- 🔐 **Captcha Relay mexanizmi** - foydalanuvchiga captcha teleportatsiya
- 📱 **SMS xabarnoma** - buyurtma tasdiqlash, chek havolasi
- 👨‍💼 **Admin panel** - buyurtmalarni kuzatish, foydalanuvchilarni boshqarish
- ⚙️ **Sozlamalar qutisi** - Ersag hamkor ID, API kalitlar, SMS provider kalitlari

## Texnologiyalar

### Frontend
- **Next.js 14** (TypeScript, App Router)
- **TailwindCSS** + **shadcn/ui**
- **React Hook Form** + **Zod** validation
- **Zustand** state management
- **Axios** API client

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **BullMQ** + **Redis** (Queue & background jobs)
- **Playwright** (Web avtomatlashtirish)
- **JWT** authentication
- **Swagger** API documentation

### To'lov tizimlari
- **Payme** API
- **Click** API
- **UZCARD/HUMO** API

### SMS integratsiya
- **Eskiz.uz** API

## Loyihani ishga tushirish

### Talablar
- Node.js 18+
- PostgreSQL
- Redis
- Docker (ixtiyoriy)

### 1. Loyihani klonlash
```bash
git clone <repository-url>
cd ersag-dropshipping-platform
```

### 2. Dependencies o'rnatish
```bash
npm run install:all
```

### 3. Environment sozlamalari
```bash
# Backend uchun
cp backend/.env.example backend/.env
# .env faylini to'ldiring
```

### 4. Ma'lumotlar bazasini sozlash
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Loyihani ishga tushirish
```bash
# Development mode
npm run dev

# Yoki alohida
npm run dev:frontend  # Frontend (http://localhost:3000)
npm run dev:backend   # Backend (http://localhost:3001)
```

## API Documentation

Backend ishga tushgandan so'ng, API dokumentatsiyasini quyidagi manzilda ko'rishingiz mumkin:
- http://localhost:3001/api/docs

## Loyiha tuzilishi

```
ersag-dropshipping-platform/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User management
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order processing
│   │   ├── payments/       # Payment integration
│   │   ├── sms/            # SMS service
│   │   ├── ersag/          # Ersag automation
│   │   ├── captcha/        # Captcha relay
│   │   └── settings/       # Settings management
│   ├── prisma/             # Database schema
│   └── package.json
└── package.json            # Root package.json
```

## Asosiy funksiyalar

### Foydalanuvchi oqimi
1. Foydalanuvchi saytga kiradi, mahsulot tanlaydi va savatchaga qo'shadi
2. Buyurtma sahifasida ma'lumotlarni kiritadi
3. To'lovni amalga oshiradi
4. Backend avtomatlashtirish jarayoni boshlanadi
5. Agar captcha chiqsa → captcha relay mexanizmi ishga tushadi
6. Buyurtma yakunlanadi → SMS orqali tasdiqlash

### Captcha Relay mexanizmi
- Backend captcha chiqqanini aniqlaydi
- Captcha rasm/iframe'ni frontendga yuboradi
- Foydalanuvchi captcha javobini kiritadi
- Backend captcha javobini Ersag saytiga uzatadi

### Admin panel
- Buyurtmalar ro'yxati va boshqaruvi
- Foydalanuvchi ma'lumotlari
- Ersagdan kelgan ID va loginlar
- SMS va to'lov loglari
- Sozlamalar qutisi

## Xavfsizlik

- Barcha sezgir kalitlar sozlamalar qutisida saqlanadi
- JWT orqali foydalanuvchi autentifikatsiyasi
- HTTPS majburiy
- ReCaptcha spamdan himoya qilish

## Deploy

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Vercel'ga deploy qiling
```

### Backend (Docker + VPS)
```bash
cd backend
docker build -t ersag-backend .
docker run -p 3001:3001 ersag-backend
```

### Database (Railway/Render)
- PostgreSQL va Redis uchun cloud provider ishlatish tavsiya etiladi

## Yordam

Agar savollar bo'lsa, loyiha maintainer'iga murojaat qiling.

## Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.