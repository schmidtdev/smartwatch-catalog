import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Prevent deleting the currently logged-in user (optional but recommended)
    // You would need to get the current user's ID from the session here.
    // For now, we'll just implement the deletion logic.

    await prisma.adminUser.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ message: 'Usuário admin excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir usuário admin' },
      { status: 500 }
    );
  }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const body = await request.json();
      const validatedData = updateUserSchema.parse(body);

      const userId = params.id;

      const existingUser = await prisma.adminUser.findUnique({
          where: { id: userId }
      });

      if (!existingUser) {
          return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
      }

      // Verificar se o email já existe para outro usuário (se o email estiver sendo atualizado)
      if (validatedData.email && validatedData.email !== existingUser.email) {
          const emailExists = await prisma.adminUser.findUnique({
              where: { email: validatedData.email }
          });
          if (emailExists) {
              return NextResponse.json({ message: 'Email já cadastrado' }, { status: 400 });
          }
      }

      let hashedPassword = existingUser.password; // Manter a senha existente por padrão
      if (validatedData.password) {
          // Hashear a nova senha se fornecida
          hashedPassword = await hash(validatedData.password, 10);
      }

      const updatedUser = await prisma.adminUser.update({
        where: { id: userId },
        data: {
          email: validatedData.email || existingUser.email, // Usar o novo email se fornecido, caso contrário, manter o existente
          password: hashedPassword,
        },
        select: { // Não retornar a senha hasheada na resposta
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return NextResponse.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Dados inválidos', errors: error.errors },
          { status: 400 }
        );
      }
      console.error('Error updating admin user:', error);
      return NextResponse.json(
        { message: 'Erro ao atualizar usuário admin' },
        { status: 500 }
      );
    }
  } 