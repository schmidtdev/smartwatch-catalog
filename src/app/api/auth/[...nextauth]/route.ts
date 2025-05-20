import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null; // Retorna null se email ou senha não forem fornecidos
        }

        // Buscar o usuário admin pelo email
        const adminUser = await prisma.adminUser.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Verificar se o usuário existe e a senha está correta
        if (adminUser && await compare(credentials.password, adminUser.password)) {
          // Retorne um objeto de usuário. O conteúdo aqui se tornará o `user`
          // na sessão e no token JWT.
          return { id: adminUser.id, name: 'Admin', email: adminUser.email };
        } else {
          // Se as credenciais forem inválidas
          return null;
        }
      },
    }),
  ],
  // TODO: Adicionar secret e configurar pages (signIn, signOut, error)
  pages: {
    signIn: '/admin/login',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 