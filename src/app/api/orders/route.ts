import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { Smartwatch } from '@/generated/prisma';

const orderSchema = z.object({
  customerName: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_SLIP']),
  notes: z.string().optional(),
  items: z.array(z.object({
    smartwatchId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  totalAmount: z.number().positive(),
  shippingCost: z.number().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar dados do pedido
    const validatedData = orderSchema.parse(body);

    // Buscar produtos e validar disponibilidade e estoque
    const productIds = validatedData.items.map((item) => item.smartwatchId);
    const products = await prisma.smartwatch.findMany({
      where: {
        id: { in: productIds },
        isPublished: true,
      },
    });

    // Verificar se todos os produtos existem, estão publicados e têm estoque suficiente
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: 'Um ou mais produtos não estão disponíveis ou publicados' },
        { status: 400 }
      );
    }

    for (const item of validatedData.items) {
      const product = products.find((p: Smartwatch) => p.id === item.smartwatchId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Estoque insuficiente para o produto: ${product?.name || item.smartwatchId}` },
          { status: 400 }
        );
      }
    }

    // Calcular total do pedido e preparar itens
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p: Smartwatch) => p.id === item.smartwatchId);
      if (!product) throw new Error('Produto não encontrado durante o cálculo');
      return {
        smartwatchId: item.smartwatchId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calcular grandTotal (total do pedido + frete)
    const grandTotal = totalAmount + validatedData.shippingCost;

    // Criar pedido e atualizar estoque em uma transação
    const order = await prisma.$transaction(async (tx) => {
      // Decrementar estoque
      for (const item of validatedData.items) {
        await tx.smartwatch.update({
          where: { id: item.smartwatchId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Criar pedido no banco de dados
      return tx.order.create({
        data: {
          customerName: validatedData.customerName,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          paymentMethod: validatedData.paymentMethod,
          notes: validatedData.notes,
          totalAmount,
          shippingCost: validatedData.shippingCost,
          grandTotal,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              smartwatch: true,
            },
          },
        },
      });
    });

    // TODO: Integrar com gateway de pagamento
    // TODO: Enviar email de confirmação

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Erro ao processar pedido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            smartwatch: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
} 