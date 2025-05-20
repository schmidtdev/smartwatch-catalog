import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  price: z.number().positive('Preço deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  imageUrl: z.string().url('URL de imagem inválida'),
  isPublished: z.boolean(),
  features: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Nome da feature é obrigatório'),
  })).default([]),
  stock: z.number().int().min(0, 'Estoque deve ser um número inteiro não negativo').default(0),
  criticalStock: z.number().int().min(0, 'Estoque crítico deve ser um número inteiro não negativo').nullable().optional(),
});

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);
    const productId = params.id;

    // Fetch existing product and its features
    const existingProduct = await prisma.smartwatch.findUnique({
      where: { id: productId },
      include: { features: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct = await prisma.smartwatch.update({
      where: { id: productId },
      data: {
        name: validatedData.name,
        brand: validatedData.brand,
        description: validatedData.description,
        price: validatedData.price,
        imageUrl: validatedData.imageUrl,
        stock: validatedData.stock,
        isPublished: validatedData.isPublished,
        features: {
          deleteMany: {},
          create: validatedData.features.map((feature) => ({
            name: feature.name,
          })),
        },
      },
      include: {
        features: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const productId = params.id;

    // Delete features associated with this product
    await prisma.feature.deleteMany({
      where: {
        smartwatchId: productId,
      },
    });

    // Then delete the product
    await prisma.smartwatch.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
  }
} 