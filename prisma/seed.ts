import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products...');

  // ── Catégories ─────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'vetements' },
      update: {},
      create: { name: 'Vêtements', slug: 'vetements' },
    }),
    prisma.category.upsert({
      where: { slug: 'accessoires' },
      update: {},
      create: { name: 'Accessoires', slug: 'accessoires' },
    }),
    prisma.category.upsert({
      where: { slug: 'papeterie' },
      update: {},
      create: { name: 'Papeterie & Fournitures', slug: 'papeterie' },
    }),
    prisma.category.upsert({
      where: { slug: 'goodies' },
      update: {},
      create: { name: 'Goodies', slug: 'goodies' },
    }),
  ]);

  const [vetements, accessoires, papeterie, goodies] = categories;

  // ── Produits ────────────────────────────────────────────────────────────────
  const products = [
    // Vêtements
    {
      name: 'Hoodie BEM 2024',
      description: 'Hoodie officiel de la promotion BEM 2024, coton premium 320g. Logo brodé sur la poitrine.',
      price: 15000,
      purchasePrice: 8000,
      stock: 80,
      stockThreshold: 20,
      categoryId: vetements.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'T-Shirt BEM Classic',
      description: 'T-shirt 100 % coton, coupe unisexe. Sérigraphie logo BEM au dos.',
      price: 6500,
      purchasePrice: 3000,
      stock: 120,
      stockThreshold: 25,
      categoryId: vetements.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Polo BEM Corporate',
      description: 'Polo piqué professionnel avec logo brodé. Idéal pour les événements et présentations.',
      price: 12000,
      purchasePrice: 6500,
      stock: 60,
      stockThreshold: 15,
      categoryId: vetements.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Veste BEM Softshell',
      description: 'Veste légère coupe-vent, parfaite pour les matins frais sur le campus.',
      price: 25000,
      purchasePrice: 14000,
      stock: 40,
      stockThreshold: 10,
      categoryId: vetements.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Sweat BEM Zip',
      description: 'Sweat zippé à capuche, coton mélangé. Logo BEM brodé côté cœur.',
      price: 18000,
      purchasePrice: 9500,
      stock: 50,
      stockThreshold: 12,
      categoryId: vetements.id,
      imageUrls: [],
      isApproved: true,
    },

    // Accessoires
    {
      name: 'Casquette BEM Snapback',
      description: 'Casquette réglable snapback, broderie logo BEM sur le devant. Taille unique.',
      price: 5000,
      purchasePrice: 2200,
      stock: 100,
      stockThreshold: 20,
      categoryId: accessoires.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Sac à dos BEM',
      description: 'Sac à dos 25 L, compartiment laptop 15 pouces, patch logo BEM.',
      price: 22000,
      purchasePrice: 12000,
      stock: 35,
      stockThreshold: 10,
      categoryId: accessoires.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Tote Bag BEM',
      description: 'Tote bag en toile 100 % coton, impression sérigraphique logo BEM.',
      price: 3500,
      purchasePrice: 1200,
      stock: 150,
      stockThreshold: 30,
      categoryId: accessoires.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Lanière BEM',
      description: 'Lanière polyester sublimée aux couleurs BEM avec clip et porte-badge.',
      price: 2000,
      purchasePrice: 700,
      stock: 200,
      stockThreshold: 40,
      categoryId: accessoires.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Porte-monnaie BEM',
      description: 'Petit porte-monnaie en simili cuir, logo gravé, 3 emplacements carte.',
      price: 4500,
      purchasePrice: 2000,
      stock: 70,
      stockThreshold: 15,
      categoryId: accessoires.id,
      imageUrls: [],
      isApproved: true,
    },

    // Papeterie & Fournitures
    {
      name: 'Carnet A5 BEM',
      description: 'Carnet couverture rigide A5, 200 pages lignées, logo BEM gaufré.',
      price: 4000,
      purchasePrice: 1800,
      stock: 90,
      stockThreshold: 20,
      categoryId: papeterie.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Stylo BEM Pack x3',
      description: 'Pack de 3 stylos bille rétractables aux couleurs BEM. Encre bleue.',
      price: 2500,
      purchasePrice: 900,
      stock: 180,
      stockThreshold: 35,
      categoryId: papeterie.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Agenda BEM 2025',
      description: 'Agenda annuel A5, semainier, couverture cuir synthétique, logo BEM.',
      price: 7500,
      purchasePrice: 3500,
      stock: 55,
      stockThreshold: 10,
      categoryId: papeterie.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Classeur BEM A4',
      description: 'Classeur 4 anneaux A4 dos 4 cm, couverture rigide imprimée logo BEM.',
      price: 3000,
      purchasePrice: 1200,
      stock: 75,
      stockThreshold: 15,
      categoryId: papeterie.id,
      imageUrls: [],
      isApproved: true,
    },

    // Goodies
    {
      name: 'Mug BEM Thermos',
      description: 'Mug isotherme 350 ml, double paroi inox, logo BEM sérigraphié. Garde chaud 6h.',
      price: 8500,
      purchasePrice: 4000,
      stock: 65,
      stockThreshold: 15,
      categoryId: goodies.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Stickers BEM Pack x10',
      description: 'Pack de 10 stickers vinyle BEM waterproof. Différents formats et designs.',
      price: 1500,
      purchasePrice: 500,
      stock: 300,
      stockThreshold: 50,
      categoryId: goodies.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Pin\'s BEM',
      description: 'Pin\'s émaillé logo BEM, finition dorée, attache papillon. Diamètre 2,5 cm.',
      price: 2000,
      purchasePrice: 800,
      stock: 200,
      stockThreshold: 40,
      categoryId: goodies.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Tapis de souris BEM',
      description: 'Tapis de souris XL 80×40 cm, surface lisse, base antidérapante, logo BEM.',
      price: 6000,
      purchasePrice: 2800,
      stock: 45,
      stockThreshold: 10,
      categoryId: goodies.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Bouteille sport BEM',
      description: 'Gourde sport 750 ml, sans BPA, bouchon à visser, logo BEM sérigraphié.',
      price: 7000,
      purchasePrice: 3200,
      stock: 55,
      stockThreshold: 12,
      categoryId: goodies.id,
      imageUrls: [],
      isApproved: true,
    },
    {
      name: 'Coussin BEM',
      description: 'Coussin décoratif 40×40 cm, housse velours, logo BEM brodé. Idéal pour le bureau.',
      price: 9000,
      purchasePrice: 4500,
      stock: 30,
      stockThreshold: 8,
      categoryId: goodies.id,
      imageUrls: [],
      isApproved: true,
    },
  ];

  let created = 0;
  for (const data of products) {
    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    if (!existing) {
      await prisma.product.create({ data });
      created++;
    }
  }

  console.log(`✅ Seeding terminé : ${categories.length} catégories, ${created} produits créés (${products.length - created} déjà existants).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
