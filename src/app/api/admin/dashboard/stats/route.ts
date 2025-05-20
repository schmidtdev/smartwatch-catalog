import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate') as string + 'T00:00:00-03:00')
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate') as string + 'T23:59:59.999-03:00')
      : new Date();
    const statusParam = searchParams.get('status') || 'CONFIRMED,PREPARING,SHIPPED,DELIVERED';
    const statuses = statusParam.split(',') as OrderStatus[];

    // Ajustar as datas para incluir o dia inteiro
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Construir o filtro de status
    const statusFilter = { status: { in: statuses } };

    // Estatísticas básicas
    const [totalProducts, totalOrders, totalCustomers, totalRevenue] = await Promise.all([
      prisma.smartwatch.count(),
      prisma.order.count({
        where: {
          createdAt: { 
            gte: startDate,
            lte: endDate
          },
          ...statusFilter
        }
      }),
      prisma.order.findMany({
        where: {
          createdAt: { 
            gte: startDate,
            lte: endDate
          },
          ...statusFilter
        },
        select: { email: true }
      }).then(orders => new Set(orders.map(o => o.email)).size),
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: {
          createdAt: { 
            gte: startDate,
            lte: endDate
          },
          ...statusFilter
        }
      }).then(result => result._sum?.grandTotal || 0)
    ]);

    // Vendas mensais (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const monthlySales = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { grandTotal: true },
      where: {
        createdAt: { 
          gte: sixMonthsAgo,
          lte: endDate
        },
        ...statusFilter
      },
      orderBy: { createdAt: 'asc' }
    });

    // Produtos mais vendidos no período
    const topProducts = await prisma.orderItem.groupBy({
      by: ['smartwatchId'],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          ...statusFilter
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product) => {
        const details = await prisma.smartwatch.findUnique({
          where: { id: product.smartwatchId },
          select: { name: true, brand: true, price: true }
        });
        return {
          ...product,
          ...details,
          totalRevenue: (details?.price || 0) * (product._sum?.quantity || 0)
        };
      })
    );

    // Status dos pedidos no período
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: { 
          gte: startDate,
          lte: endDate
        },
        status: { in: statuses }
      }
    });

    // Métodos de pagamento no período
    const paymentMethodCounts = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: true,
      where: {
        createdAt: { 
          gte: startDate,
          lte: endDate
        },
        ...statusFilter
      }
    });

    // Produtos com estoque baixo
    const lowStockProducts = await prisma.smartwatch.findMany({
      where: {
        criticalStock: { not: null },
        stock: { lte: prisma.smartwatch.fields.criticalStock }
      },
      select: {
        id: true,
        name: true,
        brand: true,
        stock: true,
        criticalStock: true
      }
    });

    // Vendas por dia da semana no período
    const salesByDayOfWeek = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { grandTotal: true },
      where: {
        createdAt: { 
          gte: startDate,
          lte: endDate
        },
        ...statusFilter
      }
    });

    const salesByDay = salesByDayOfWeek.reduce((acc, sale) => {
      const day = new Date(sale.createdAt).getDay();
      acc[day] = (acc[day] || 0) + (sale._sum?.grandTotal || 0);
      return acc;
    }, {} as Record<number, number>);

    // Ticket médio (apenas pedidos no período)
    const paidOrders = await prisma.order.count({
      where: {
        createdAt: { 
          gte: startDate,
          lte: endDate
        },
        ...statusFilter
      }
    });
    const averageTicket = paidOrders > 0 ? totalRevenue / paidOrders : 0;

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      averageTicket,
      monthlySales: monthlySales.map(sale => ({
        date: sale.createdAt,
        amount: sale._sum?.grandTotal || 0
      })),
      topProducts: topProductsWithDetails,
      orderStatus: orderStatusCounts,
      paymentMethods: paymentMethodCounts,
      lowStockProducts,
      salesByDay: Object.entries(salesByDay).map(([day, amount]) => ({
        day: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][parseInt(day)],
        amount
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar estatísticas do dashboard' },
      { status: 500 }
    );
  }
} 