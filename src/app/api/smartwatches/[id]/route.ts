import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const smartwatch = await prisma.smartwatch.findUnique({
      where: { id: params.id },
      include: {
        features: true, // Incluir features se necessário para o frontend
      },
    });

    if (!smartwatch) {
      return NextResponse.json(
        { message: 'Smartwatch não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(smartwatch);
  } catch (error) {
    console.error('Error fetching smartwatch:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar smartwatch' },
      { status: 500 }
    );
  }
} 