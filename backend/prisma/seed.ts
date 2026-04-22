import { randomUUID } from 'crypto';

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  /*
   * =========================
   * 1. USERS
   * =========================
   */
  const users = {
    joao: {
      id: randomUUID(),
      name: 'João Silva',
      email: 'joao@example.com',
      password: await hash('Senha123', 12),
      role: 'user',
      avatar: null,
      createdAt: now,
      updatedAt: now,
    },
    maria: {
      id: randomUUID(),
      name: 'Maria Santos',
      email: 'maria@example.com',
      role: 'user',
      password: await hash('Senha123', 12),
      avatar: null,
      createdAt: now,
      updatedAt: now,
    },
    pedro: {
      id: randomUUID(),
      name: 'Pedro Oliveira',
      email: 'pedro@example.com',
      role: 'user',
      password: await hash('Senha123', 12),
      avatar: null,
      createdAt: now,
      updatedAt: now,
    },
  };

  console.log('--- Criando Usuários ---');
  await prisma.user.createMany({
    data: Object.values(users),
  });

  /*
   * =========================
   * 2. CATEGORIES
   * =========================
   */
  const categories = {
    eletronicos: {
      id: randomUUID(),
      name: 'Eletrônicos',
      createdAt: now,
      updatedAt: now,
    },
    livros: {
      id: randomUUID(),
      name: 'Livros',
      createdAt: now,
      updatedAt: now,
    },
    roupas: {
      id: randomUUID(),
      name: 'Roupas',
      createdAt: now,
      updatedAt: now,
    },
    casa: {
      id: randomUUID(),
      name: 'Casa e Jardim',
      createdAt: now,
      updatedAt: now,
    },
    esportes: {
      id: randomUUID(),
      name: 'Esportes',
      createdAt: now,
      updatedAt: now,
    },
  };

  console.log('--- Criando Categorias ---');
  await prisma.category.createMany({
    data: Object.values(categories),
  });

  /*
   * =========================
   * 3. PRODUCTS
   * =========================
   */
  const products = {
    notebook: {
      id: randomUUID(),
      name: 'Notebook Dell',
      priceAmount: 3500,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.eletronicos.id,
      createdAt: now,
      updatedAt: now,
    },
    fone: {
      id: randomUUID(),
      name: 'Fone Bluetooth',
      priceAmount: 450,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.eletronicos.id,
      createdAt: now,
      updatedAt: now,
    },
    cleanCode: {
      id: randomUUID(),
      name: 'Clean Code',
      priceAmount: 90,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.livros.id,
      createdAt: now,
      updatedAt: now,
    },
    designPatterns: {
      id: randomUUID(),
      name: 'Design Patterns',
      priceAmount: 120,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.livros.id,
      createdAt: now,
      updatedAt: now,
    },
    camiseta: {
      id: randomUUID(),
      name: 'Camiseta Premium',
      priceAmount: 80,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.roupas.id,
      createdAt: now,
      updatedAt: now,
    },
    jaqueta: {
      id: randomUUID(),
      name: 'Jaqueta de Couro',
      priceAmount: 450,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.roupas.id,
      createdAt: now,
      updatedAt: now,
    },
    lampada: {
      id: randomUUID(),
      name: 'Lâmpada LED Inteligente',
      priceAmount: 90,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.casa.id,
      createdAt: now,
      updatedAt: now,
    },
    tapete: {
      id: randomUUID(),
      name: 'Tapete Persa',
      priceAmount: 1200,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.casa.id,
      createdAt: now,
      updatedAt: now,
    },
    bola: {
      id: randomUUID(),
      name: 'Bola de Futebol',
      priceAmount: 150,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.esportes.id,
      createdAt: now,
      updatedAt: now,
    },
    bike: {
      id: randomUUID(),
      name: 'Bicicleta Mountain Bike',
      priceAmount: 1500,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.esportes.id,
      createdAt: now,
      updatedAt: now,
    },
    dumbbell: {
      id: randomUUID(),
      name: 'Kit Dumbbells',
      priceAmount: 350,
      priceCurrency: 'BRL',
      image: null,
      categoryId: categories.esportes.id,
      createdAt: now,
      updatedAt: now,
    },
  };

  console.log('--- Criando Produtos ---');
  await prisma.product.createMany({
    data: Object.values(products),
  });

  /*
   * =========================
   * 4. FAVORITES
   * =========================
   */
  const favorites = [
    {
      userId: users.joao.id,
      targetType: 'product',
      targetId: products.notebook.id,
      createdAt: now,
    },
    {
      userId: users.maria.id,
      targetType: 'product',
      targetId: products.cleanCode.id,
      createdAt: now,
    },
  ];

  console.log('--- Criando Favoritos ---');
  await prisma.favorite.createMany({
    data: favorites,
  });

  console.log('✅ Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
