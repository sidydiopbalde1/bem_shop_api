"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding products...');
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'stylo' },
            update: {},
            create: { name: 'Stylo', slug: 'stylo' },
        }),
        prisma.category.upsert({
            where: { slug: 'Audio' },
            update: {},
            create: { name: 'Audio', slug: 'audio' },
        }),
        prisma.category.upsert({
            where: { slug: 'Accessoires' },
            update: {},
            create: { name: 'Accessoires', slug: 'accessoires' },
        }),
        prisma.category.upsert({
            where: { slug: 'Gaming' },
            update: {},
            create: { name: 'Gaming', slug: 'gaming' },
        }),
    ]);
    const [accessoires, stylo, audio, gaming] = categories;
    const products = [
        {
            name: 'Accroche-Sac BEM',
            description: "Garde ton sac propre et sécurisé partout\
 Un accessoire discret mais ultra pratique\
✔️ Fixation facile sur table\
 ✔️ Design élégant\
 ✔️ Résistant et durable\
Parfait pour restaurants, salles de cours ou événements\
",
            price: 3900,
            purchasePrice: 8000,
            stock: 50,  
            stockThreshold: 20,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780405342/products/pzjtau7mswdvqlzyuouw.jpg"
            ],
            isApproved: true,
        },
        {
            name: 'Support Téléphone & Stylet BEM',
            description: 'Travaille et navigue plus facilement.\
 Un accessoire 3-en-1 pratique pour ton quotidien.\
✔️ Support téléphone intégré\
 ✔️ Stylo à bille fluide\
 ✔️ Embout tactile pour écran\
 ✔️ Léger et compact\
Idéal pour les cours et le multitâche.\
',
            price: 1400,
            purchasePrice: 3000,
            stock: 50,
            stockThreshold: 25,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780405115/products/u1kiklzbqwz2ydi92tui.jpg",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780405115/products/y0r72clmsnnvz70qgck5.jpg"
            ],
            isApproved: true,
        },
        {
            name: 'Selfie LED Light',
            description: 'Améliore instantanément la qualité de tes photos et vidéos.\
 Un éclairage portable idéal pour tes contenus.\
✔️ Lumière LED haute intensité\
 ✔️ Couleurs ajustables (RGB)\
 ✔️ Clip universel smartphone\
 ✔️ Idéal pour selfies, TikTok, live\
Pour toujours être sous ton meilleur angle.\
',
            price: 8000,
            purchasePrice: 6500,
            stock: 50,
            stockThreshold: 15,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780404884/products/ejw7oneuq5xk9dzadjxl.png"
            ],
            isApproved: true,
        },
        {
            name: 'Câble 3-en-1 Lumineux BEM',
            description: 'Un seul câble pour tous tes appareils.\
 Pratique, rapide et stylé avec son logo lumineux.\
✔️ Multi-connecteurs (USB, USB-C, autres)\
 ✔️ Charge rapide\
 ✔️ Logo LED intégré\
 ✔️ Format compact\
Parfait pour le bureau, la maison ou les déplacements.\
⚡ Nouveau produit\
',
            price: 5000,
            purchasePrice: 14000,
            stock: 50,
            stockThreshold: 10,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1779441272/products/gkfofmf6ohoydxfn5ryy.png",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1779441272/products/o50fi7sdzpjywhuy5pcv.png",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780404487/products/bjgsvixs6mot2gjxubkx.jpg"
            ],
            isApproved: true,
        },
        {
            name: 'Power Bank BEM',
            description: 'Ne tombe plus jamais en panne de batterie.\
 Cette power bank te permet de rester connecté toute la journée, où que tu sois.\
✔️ Capacité 10 000 mAh\
 ✔️ Charge rapide\
 ✔️ Compatible tous appareils\
 ✔️ Design compact et robuste\
Ton indispensable au quotidien.\
🔥 Best seller\
',
            price: 7000,
            purchasePrice: 9500,
            stock: 50,
            stockThreshold: 12,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780404216/products/v3vuktcw5q884fjqiuh7.jpg",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780404217/products/tmytxj65voqeboxfvdz7.jpg"
            ],
            isApproved: true,
        },
        {
            name: 'Mini Ventilateur Portable BEM',
            description: 'La chaleur ne sera plus un problème.\
 Compact et puissant, ce mini ventilateur t’accompagne partout pour rester au frais.\
✔️ 5 vitesses réglables\
 ✔️ Recharge USB\
 ✔️ Autonomie 2 à 4 heures\
 ✔️ Léger et pliable\
Idéal pour les journées chaudes à Dakar.\
🔥 Disponible en quantité limitée\
',
            price: 6500,
            purchasePrice: 2200,
            stock: 50,
            stockThreshold: 20,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780403939/products/llw2toksbwdmtu4vqhyq.jpg",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780403779/products/p1zrzxz4jm9yqxqeq6pa.jpg",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780403779/products/ntwni9mcv0quav9lpx0x.jpg"   
            ],
            isApproved: true,
        },
        {
            name: 'Bouteille Intelligente BEM',
            description: 'Reste hydraté avec style, toute la journée.\
 Cette bouteille intelligente affiche la température de ta boisson en temps réel et conserve la chaleur ou la fraîcheur pendant plusieurs heures.\
✔️ Affichage digital de la température\
 ✔️ Maintien thermique jusqu’à 6 heures\
 ✔️ 100 % étanche\
 ✔️ Format pratique (350 ml)\
Parfaite pour les cours, le sport ou les déplacements.\
🔥 Stock limité — collection 2026\
 📍 Retrait à BEM Dakar ou livraison disponible\
',
            price: 4500,
            purchasePrice: 12000,
            stock: 50,
            stockThreshold: 10,
            categoryId: accessoires.id,
            imageUrls: [
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780403153/products/ujwhatafoudwdoqwricx.jpg",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780403155/products/bg7ysymhwk4pjck6glvg.jpg",
                "https://res.cloudinary.com/dodmxir1f/image/upload/v1780403153/products/vftuxdfiimpatupx9cca.png"   
            ],
            isApproved: true,
        }
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
//# sourceMappingURL=seed.js.map