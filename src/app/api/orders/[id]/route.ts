import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  trackingCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Buscar pedido atual
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            smartwatch: true,
          },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { message: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Validar transições de status
    if (validatedData.status === 'CANCELLED' && currentOrder.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Apenas pedidos pendentes podem ser cancelados' },
        { status: 400 }
      );
    }

    if (validatedData.status === 'SHIPPED' && !validatedData.trackingCode) {
      return NextResponse.json(
        { message: 'Código de rastreamento é obrigatório para pedidos enviados' },
        { status: 400 }
      );
    }

    // Atualizar pedido
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        paymentStatus: validatedData.paymentStatus,
        trackingCode: validatedData.trackingCode,
        notes: validatedData.notes,
      },
      include: {
        items: {
          include: {
            smartwatch: true,
          },
        },
      },
    });

    // Se o pedido foi cancelado, restaurar o estoque
    if (validatedData.status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      await prisma.$transaction(
        currentOrder.items.map((item: { smartwatchId: string; quantity: number }) =>
          prisma.smartwatch.update({
            where: { id: item.smartwatchId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar pedido' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            smartwatch: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
} 