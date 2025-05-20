import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const prismaClient = new PrismaClient();

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

export async function GET() {
  try {
    const products = await prisma.smartwatch.findMany({
      include: {
        features: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.smartwatch.create({
      data: {
        name: validatedData.name,
        brand: validatedData.brand,
        price: validatedData.price,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        isPublished: validatedData.isPublished,
        stock: validatedData.stock,
        criticalStock: validatedData.criticalStock,
        features: {
          create: validatedData.features.map(feature => ({
            name: feature.name,
          })),
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
} 