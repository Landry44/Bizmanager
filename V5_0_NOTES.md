# BizManager V5.0 — Première version orientée déploiement

## Nouveautés
- Inscription publique `/register`.
- Création automatique d'un utilisateur + entreprise + membership OWNER dans une transaction PostgreSQL.
- Connexion automatique après inscription via session HTTP-only.
- Validation Zod et mot de passe bcrypt (12 rounds).
- Détection des e-mails déjà utilisés.
- Landing page avec CTA de création de compte.
- Conservation de toutes les fonctions V4.9.

## Identifiants de démonstration
- Email: `admin@bizmanager.local`
- Mot de passe: `admin123`
- Rôle: `OWNER`

## Déploiement
1. Fournir un PostgreSQL managé et renseigner `DATABASE_URL`.
2. Définir un `SESSION_SECRET` long et aléatoire.
3. Exécuter `npm install`, `npm run db:generate`, puis `npm run db:migrate`.
4. Pour les données de démonstration: `npm run db:seed`.
5. Construire avec `npm run build`, puis démarrer avec `npm start`.
6. Mettre l'application derrière HTTPS en production.

## Important
La V5.0 est prête côté architecture pour être déployée, mais un vrai lancement commercial nécessite encore l'infrastructure Cloud, le domaine, les sauvegardes, la supervision, la limitation anti-abus et le paiement des abonnements.
