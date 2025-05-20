import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export async function GET() {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar usuários admin' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Verificar se o email já existe
    const existingUser = await prisma.adminUser.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email já cadastrado' }, { status: 400 });
    }

    // Hashear a senha
    const hashedPassword = await hash(validatedData.password, 10);

    // Criar o usuário admin
    const newUser = await prisma.adminUser.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
      },
      select: { // Não retornar a senha hasheada na resposta
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário admin' },
      { status: 500 }
    );
  }
} 