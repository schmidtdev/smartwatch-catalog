import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Seed smartwatches
  const smartwatch1 = await prisma.smartwatch.create({
    data: {
      name: 'Galaxy Watch 5 Pro',
      brand: 'Samsung',
      description: 'The ultimate smartwatch for outdoor adventurers.',
      price: 399.99,
      imageUrl: '/images/galaxy-watch-5-pro.jpg', // Placeholder image URL
      isPublished: true,
      features: {
        create: [
          { name: 'GPS' },
          { name: 'Bateria de longa duração' },
          { name: 'Monitoramento de atividades' },
          { name: 'Resistência à água' },
        ],
      },
    },
  })
  console.log(`Created smartwatch with id: ${smartwatch1.id}`)

  const smartwatch2 = await prisma.smartwatch.create({
    data: {
      name: 'Apple Watch Series 8',
      brand: 'Apple',
      description: 'A grande tela Retina Sempre Ativa. Tudo o que você precisa para uma vida mais saudável, segura e conectada.',
      price: 429.00,
      imageUrl: '/images/apple-watch-series-8.jpg', // Placeholder image URL
      isPublished: true,
      features: {
        create: [
          { name: 'Detecção de Colisão' },
          { name: 'Sensor de temperatura' },
          { name: 'ECG' },
          { name: 'Monitoramento de atividades' },
        ],
      },
    },
  })
  console.log(`Created smartwatch with id: ${smartwatch2.id}`)

  const smartwatch3 = await prisma.smartwatch.create({
    data: {
      name: 'Forerunner 955 Solar',
      brand: 'Garmin',
      description: 'Corra por mais tempo com um smartwatch de corrida com GPS com carregamento solar.',
      price: 599.99,
      imageUrl: '/images/forerunner-955-solar.jpg', // Placeholder image URL
      isPublished: true,
      features: {
        create: [
          { name: 'Carregamento Solar' },
          { name: 'GPS Multibanda' },
          { name: 'Métricas de desempenho avançadas' },
          { name: 'Mapas coloridos integrados' },
        ],
      },
    },
  })
  console.log(`Created smartwatch with id: ${smartwatch3.id}`)

  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'password' // TODO: Change default password in production!

  // Hash the password
  const hashedPassword = await hash(password, 10) // 10 is the salt rounds

  // Create or update the admin user
  const adminUser = await prisma.adminUser.upsert({
    where: { email: email },
    update: { password: hashedPassword },
    create: {
      email: email,
      password: hashedPassword,
    },
  })

  console.log(`Admin user created/updated: ${adminUser.email}`)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 