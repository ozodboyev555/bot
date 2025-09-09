import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('order-processing') private orderQueue: Queue,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    // Get user's cart items
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0,
    );

    // Generate order number
    const orderNumber = `ERS-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        totalAmount,
        ...createOrderDto,
        orderItems: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Clear cart
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Add order to processing queue
    await this.orderQueue.add('process-order', {
      orderId: order.id,
      userId: order.userId,
    });

    return order;
  }

  async findAll(page = 1, limit = 10, status?: string, userId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          orderItems: {
            include: { product: true },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        smsLogs: true,
        paymentLogs: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { 
        status: status as any,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    return this.findAll(page, limit, undefined, userId);
  }

  async getOrderStats() {
    const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}