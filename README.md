# Catálogo de Smartwatches

Este é um projeto de catálogo de smartwatches desenvolvido com Next.js, Prisma e NextAuth. O sistema permite gerenciar um catálogo de smartwatches, realizar pedidos e gerenciar o estoque.

## 🚀 Tecnologias Utilizadas

- [Next.js 15](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM para banco de dados
- [SQLite](https://www.sqlite.org/) - Banco de dados
- [NextAuth.js](https://next-auth.js.org/) - Autenticação
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [React Hook Form](https://react-hook-form.com/) - Gerenciamento de formulários
- [Zod](https://zod.dev/) - Validação de dados
- [Zustand](https://zustand-demo.pmnd.rs/) - Gerenciamento de estado

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Git

## 🔧 Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/schmidtdev/smartwatch-catalog.git
cd smartwatch-catalog
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu_secret_aqui" # Gere um secret seguro usando o comando abaixo
```

Para gerar um secret seguro para o NextAuth, execute no terminal:
```bash
openssl rand -base64 32
```

4. Configure o banco de dados:
```bash
# Gera o cliente Prisma
npx prisma generate

# Cria e aplica as migrações do banco de dados
npx prisma migrate dev

# (Opcional) Popula o banco com dados iniciais
npx prisma db seed
```

## 🚀 Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

2. Acesse o projeto em [http://localhost:3000](http://localhost:3000)

## 📦 Estrutura do Banco de Dados

O projeto utiliza SQLite com Prisma e possui os seguintes modelos principais:

- **Smartwatch**: Produtos do catálogo
- **Feature**: Características dos smartwatches
- **Order**: Pedidos dos clientes
- **OrderItem**: Itens de cada pedido
- **AdminUser**: Usuários administradores
- **Setting**: Configurações do sistema

## 🔐 Autenticação

O sistema utiliza NextAuth.js para autenticação. Para criar um usuário administrador inicial, você pode:

1. Usar o seed do banco de dados (se configurado)
2. Criar manualmente através da interface de administração
3. Inserir diretamente no banco de dados usando o Prisma Studio:
```bash
npx prisma studio
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run prisma:migrate` - Executa as migrações do banco de dados
- `npm run prisma:seed` - Popula o banco com dados iniciais

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
