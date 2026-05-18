
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BEM Shop API')
    .setDescription(
      'API de la plateforme e-commerce BEM Shop — gestion des produits, commandes, paiements, marketplace, fidélité et analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Auth',        'Inscription, connexion, OAuth et gestion des tokens')
    .addTag('Products',    'Catalogue produits public et administration')
    .addTag('Cart',        "Panier d'achat utilisateur")
    .addTag('Orders',      'Création et suivi des commandes')
    .addTag('Payments',    'Initiation de paiement et webhooks Stripe')
    .addTag('Marketplace', 'Soumission et validation de produits vendeurs')
    .addTag('Loyalty',     'Points de fidélité, badges et classement')
    .addTag('Users',       'Administration des utilisateurs')
    .addTag('Analytics',   'Statistiques et exports (admin)')
    .addTag('Categories',  'Gestion des catégories et sous-catégories de produits')
    .addTag('Upload',      'Upload d\'images produits vers Cloudinary (admin)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);

  // ── Debug : strategies enregistrées dans Passport ──────────────────────────
  const strategies = Object.keys((passport as any)._strategies ?? {});
  console.log('✅ Passport strategies actives :', strategies);
  // Si "google" n'apparaît pas ici → le problème vient de l'instantiation
}

bootstrap();
