export interface User {
  id: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  ersagId?: string
  ersagLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  category?: string
  ersagId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
  product: Product
}

export interface Order {
  id: string
  userId?: string
  orderNumber: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
  totalAmount: number
  paymentMethod: string
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  customerRegion?: string
  customerDistrict?: string
  customerNotes?: string
  ersagOrderId?: string
  ersagReceiptUrl?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  orderItems: OrderItem[]
  user?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  product: Product
}

export interface CaptchaData {
  orderId: string
  imageUrl?: string
  iframeUrl?: string
  expiresAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}