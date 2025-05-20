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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const productId = params.id;

    // Fetch existing product and its features
    const existingProduct = await prisma.smartwatch.findUnique({
      where: {
        id: productId,
      },
      include: {
        features: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Determine features to create, update, and delete
    const existingFeatures = existingProduct.features;
    const updatedFeatures = validatedData.features;

    const featuresToCreate = updatedFeatures.filter(feature => !feature.id);

    const featuresToUpdate = updatedFeatures.filter((feature: { id?: string; name: string }) =>
      feature.id && existingFeatures.some((ef: { id: string; name: string }) => ef.id === feature.id)
    );

    const featureIdsToDelete = existingFeatures
      .filter((existingFeature: { id: string; name: string }) => !updatedFeatures.some(uf => uf.id === existingFeature.id))
      .map((feature: { id: string }) => feature.id);

    // Perform updates in a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Delete features
      if (featureIdsToDelete.length > 0) {
        await tx.feature.deleteMany({
          where: {
            id: { in: featureIdsToDelete },
          },
        });
      }

      // Create new features
      if (featuresToCreate.length > 0) {
        await tx.feature.createMany({
          data: featuresToCreate.map(feature => ({
            name: feature.name,
            smartwatchId: productId,
          })),
        });
      }

      // Update existing features
      for (const feature of featuresToUpdate) {
        await tx.feature.update({
          where: {
            id: feature.id as string, // We know ID exists here
          },
          data: {
            name: feature.name,
          },
        });
      }

      // Update product details
      return tx.smartwatch.update({
        where: {
          id: productId,
        },
        data: {
          name: validatedData.name,
          brand: validatedData.brand,
          price: validatedData.price,
          description: validatedData.description,
          imageUrl: validatedData.imageUrl,
          isPublished: validatedData.isPublished,
          stock: validatedData.stock,
          criticalStock: validatedData.criticalStock,
        },
        include: {
          features: true,
        },
      });
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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