import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Smartwatch } from '@/generated/prisma';

const prisma = new PrismaClient();

// Define a type for the Smartwatch payload including features
type SmartwatchWithFeatures = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  features: Array<{ id: string; name: string }>;
  stock: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const feature = searchParams.get('feature');

    // Construir o filtro base
    const where: any = {
      isPublished: true, // Apenas produtos publicados
    };

    // Adicionar filtros se fornecidos
    if (brand) {
      where.brand = brand;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    if (feature) {
      where.features = {
        some: {
          name: feature,
        },
      };
    }

    const smartwatches = await prisma.smartwatch.findMany({
      where,
      include: {
        features: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Incluir o campo stock na resposta
    const smartwatchesWithStock = smartwatches.map((sw: SmartwatchWithFeatures) => ({
      ...sw,
      stock: sw.stock // Use actual stock value
    }));

    return NextResponse.json(smartwatchesWithStock);
  } catch (error) {
    console.error('Error fetching smartwatches:', error);
    return NextResponse.json({ message: 'Failed to fetch smartwatches' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// TODO: Implementar lógica de filtragem com base nos query params 

export async function POST(request: Request) { /* ... */ }
export async function PUT(request: Request) { /* ... */ }
export async function DELETE(request: Request) { /* ... */ } 