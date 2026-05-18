PROJET BEM
Plateforme e-commerce
Spécifications Techniques — Stack Moderne


NestJS · Next.js · PostgreSQL


2026
Powered by : Equipe tech BEM Dakar

SOMMAIRE
1. Introduction
2. Spécifications Techniques
   2.1 Architecture Générale
   2.2 Fonctionnalités Techniques
   2.3 Environnement Technique
   2.4 Contraintes Techniques
   2.5 Plan de Maintenance
3. Parcours Client
   3.1 Découverte et Navigation
   3.2 Inscription / Connexion
   3.3 Achat
   3.4 Engagement Post-Achat
   3.5 Support et Fidélisation
4. Proposition Financière
5. Conclusion
6. Équipes Principales

1. Introduction
Ce document détaille les spécifications techniques pour le développement d'une plateforme e-commerce dédiée à une communauté étudiante. La stack retenue est NestJS (backend), Next.js (frontend) et PostgreSQL (base de données) est choisie pour sa robustesse, sa typage fort (TypeScript), sa scalabilité et son excellence en matière de DX (Developer Experience).

La plateforme vise à offrir une expérience fluide, sécurisée et engageante : marketplace étudiante, produits personnalisés, gamification, paiement mobile et support en temps réel.

2. Spécifications Techniques
2.1 Architecture Générale
Couche
Technologie
Rôle
Frontend
Next.js 14 (App Router) + Tailwind CSS
UI dynamique, SSR/SSG, SEO optimisé
Backend
NestJS 10 (TypeScript)
API RESTful modulaire + WebSockets
ORM
Prisma ORM
Accès typé à PostgreSQL
BDD
PostgreSQL 16
Données relationnelles, ACID
Cache
Redis
Sessions, cache API, queues Bull
CMS Back-office
Admin Panel custom (NestJS + Next.js)
Gestion produits / commandes / stocks
Hébergement
DigitalOcean Droplet (4 Go RAM, 2 CPU)
Scalabilité initiale, auto-scaling


Sécurité :
Certificat SSL via Let's Encrypt
Chiffrement AES-256 pour les données sensibles
Protection anti-DDoS via Cloudflare
Authentification JWT (access + refresh tokens) avec Passport.js
Guards NestJS pour le contrôle d'accès basé sur les rôles (RBAC)

Intégrations paiement :
Mobile Money (MTN, Orange Money) via APIs locales
Stripe pour les paiements par carte bancaire
PayPal pour les transactions internationales

Maintenance :
Surveillance via UptimeRobot (disponibilité 99,9 %)
Sauvegardes automatiques hebdomadaires sur AWS S3 / DigitalOcean Spaces
Mise à jour mensuelle des dépendances et correctifs de sécurité

2.2 Fonctionnalités Techniques
1. Catalogue multi-catégories
Recherche full-text via PostgreSQL tsvector + pg_search (alternative légère à Elasticsearch)
Pagination cursor-based pour des performances optimales
Filtres dynamiques (prix, marque, taille, catégorie) côté NestJS

2. Gestion des comptes utilisateurs
Inscription / connexion via email ou OAuth 2.0 (Google, Facebook) avec NextAuth.js
Rôles : étudiants, parents, alumni, invités — gérés par un RolesGuard NestJS
Profil utilisateur : historique commandes, points fidélité, tableau de bord personnel

3. Panier & Commande
Panier persistant : stocké en PostgreSQL (table cart) + synchronisation localStorage côté client
Validation des paiements via webhook Stripe/PayPal (endpoint sécurisé NestJS)
Options de livraison : campus (géolocalisation Google Maps API) ou domicile

4. Marketplace étudiante
Espace vendeur étudiant avec soumission de produit validée par un admin
Commission configurable (ex. : 10 % par transaction) — calculée côté NestJS service

5. Produits personnalisés
Interface de personnalisation avec Fabric.js (canvas) pour prévisualisation temps réel
Stockage des designs dans PostgreSQL (bytea) ou DigitalOcean Spaces (S3-compatible)


8. Back-office
Dashboard admin Next.js : gestion produits, commandes, stocks
Rapports analytics (ventes, utilisateurs actifs) avec Chart.js / Recharts
Export CSV via la librairie csv-parser / json2csv côté NestJS

2.3 Environnement Technique
Catégorie
Outils / Librairies
Langages
TypeScript 5.x, HTML5, CSS3
Frontend
Next.js 14, React 18, Tailwind CSS, Zustand, React Query, NextAuth.js
Backend
NestJS 10, Prisma ORM, Passport.js, class-validator, class-transformer, Bull Queue
Tests
Jest (unitaires + intégration), Supertest (API), Playwright (E2E)
DevOps
Docker + Docker Compose, GitHub Actions (CI/CD), Nginx reverse proxy
APIs externes
Google Maps API, Cloudflare API, Stripe, PayPal, Mobile Money
Monitoring
Sentry (error tracking), UptimeRobot, Prometheus + Grafana (optionnel)


2.4 Contraintes Techniques
Performance : LCP < 2,5 s grâce au SSR/SSG Next.js + lazy loading images (next/image)
Compatibilité : Responsive (mobile, tablette, desktop), navigateurs modernes (Chrome, Firefox, Safari, Edge)
Accessibilité : Conformité WCAG 2.1 niveau AA
Scalabilité : 10 000 utilisateurs actifs / mois au lancement, auto-scaling DigitalOcean
SEO : Rendu serveur natif Next.js App Router pour un indexage optimal

2.5 Plan de Maintenance
Mises à jour : Correctifs mensuels et audit des dépendances (npm audit)
Support : Réponse sous 48h par email ou chat
Monitoring : Suivi temps de réponse API, taux d'erreur (Sentry), transactions
Sauvegardes : Snapshot PostgreSQL quotidien ; restauration possible sous 4h

3. Parcours Client
3.1 Découverte et Navigation
Accueil : Page d'accueil SSR Next.js avec promotions, bannières dynamiques et accès rapide au catalogue.
Action : Clic sur une catégorie ou utilisation de la barre de recherche full-text
Catalogue : Affichage des produits avec filtres (prix, marque, taille) et tri (popularité, nouveauté).
Action : Sélection d'un produit pour consulter la fiche détaillée
Fiche produit : Détails, personnalisation (canvas Fabric.js), avis clients.
Action : Ajout au panier ou exploration de la marketplace étudiante

3.2 Inscription / Connexion
Création de compte : Via email ou OAuth (Google, Facebook) — géré par NextAuth.js.
Résultat : Email de confirmation, accès au profil et tableau de bord
Connexion : Retrouve son panier persistant et ses points de fidélité.
Action : Passe à la commande

3.3 Achat
Panier : Vérification des articles, ajustement quantités, code promo.
Action : Clic sur « Passer la commande »
Livraison : Choix entre livraison sur campus (géolocalisation) ou domicile.
Action : Sélection d'une option et validation
Paiement : Mobile Money, Stripe ou PayPal.
Résultat : Redirection vers la passerelle, puis confirmation par email/notification

3.4 Engagement Post-Achat
Suivi de commande : État en temps réel dans le profil utilisateur (WebSocket NestJS).
Action : Contact support via chatbot si besoin
Gamification : Gain de points de fidélité et déblocage de badge.
Action : Utilisation des points pour une réduction future
Marketplace étudiante : Découverte de produits vendus par d'autres étudiants.
Action : Ajout au panier ou soumission d'une proposition de vente

3.5 Support et Fidélisation
Assistance : Question via chatbot ou messagerie WebSocket en temps réel.
Résultat : Réponse rapide ou redirection vers un agent humain
Fidélité : Offres personnalisées par email (Nodemailer) ou notifications push.
Action : Retour sur la plateforme pour un nouvel achat

5. Conclusion
La plateforme proposée repose sur une architecture moderne, maintenable et scalable : NestJS offre une structure modulaire et typée pour l'API, Next.js garantit performance SEO et expérience utilisateur de premier plan, et PostgreSQL assure intégrité des données relationnelles avec une puissance de requêtage avancée.

L'ensemble des choix technologiques respecte les principes SOLID, favorise une base de code testable (Jest + Playwright) et une livraison continue (GitHub Actions + Docker). Ce projet est prêt à répondre aux besoins de la communauté étudiante tout en offrant un potentiel d'évolution vers un assistant IA intégré (LangChain.js / LangGraph).


V2 : 

6. Gamification
Système de points : 1 point = 100 FCFA dépensé — géré dans table loyalty_points
Badges déblocables (ex. : « Acheteur régulier » après 5 commandes)
Leaderboard mensuel via une vue PostgreSQL agrégée

7. Assistance en ligne
Chatbot IA basé sur Dialogflow (ou Botpress) pour les questions fréquentes
Messagerie en temps réel via Socket.IO intégré dans NestJS (Gateway WebSocket)


Diagramme use cases — 3 acteurs, 13 cas
Les cas en teal sont tous clickables et génèrent directement le module NestJS correspondant. Le cas Soumettre un produit est en coral car il appartient à l'acteur Étudiant Vendeur, un sous-acteur du Client.
Diagramme de classes — 11 entités Prisma
Les relations clés pour le backend :
User est le hub central , il possède un Cart, passe des Order, gagne des LoyaltyPoint, débloque des Badge, écrit des Review.
Cart → CartItem → Product : la chaîne panier.
Order → OrderItem → Product : la chaîne commande avec prix unitaire figé à la vente.
Order → Payment : séparé intentionnellement pour gérer les états PENDING / SUCCESS / FAILED indépendamment de la commande.
Product → Category avec parentId nullable sur Category pour les sous-catégories.
Product → User (vendorId) nullable : null = produit BEM, non-null = marketplace étudiant.

Les ENUMS 

enum UserRole      { STUDENT PARENT ALUMNI GUEST ADMIN }
enum OrderStatus   { PENDING CONFIRMED SHIPPED DELIVERED CANCELLED }
enum DeliveryType  { CAMPUS HOME }
enum PaymentProvider { STRIPE PAYPAL MOBILE_MONEY }
enum PaymentStatus { PENDING SUCCESS FAILED REFUNDED }


On n'a pas besoin de se connecter pour passer une commande, ni pour voir les produits ainsi les enpoints des cart
