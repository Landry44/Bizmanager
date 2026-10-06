# BizManager V4.8

Version de stabilisation de BizManager : Next.js + Prisma + PostgreSQL + sessions HTTP-only + multi-entreprises.

## Démarrage
1. Installer Node.js 20+ et Docker Desktop.
2. Copier `.env.example` vers `.env` et définir un `SESSION_SECRET` long et aléatoire.
3. `docker compose up -d`
4. `npm install`
5. `npm run db:generate`
6. `npm run db:migrate`
7. `npm run db:seed`
8. `npm run dev`
9. Ouvrir `http://localhost:3000`

## Compte de démonstration
- Email : `admin@bizmanager.local`
- Mot de passe : `admin123`
- Rôle : `OWNER`

Changez immédiatement ce mot de passe en environnement réel.

## Diagnostic
`GET /api/health` vérifie la connexion PostgreSQL.

## Améliorations V4.8
- panier multi-produits ventes/achats
- gestion d'erreurs plus propre
- garde de session pour les pages privées
- correction de la page Documents non authentifiée
- diagnostic PostgreSQL
- seed réparateur : le compte admin existant est remis en OWNER et son mot de passe est synchronisé
- caisse multi-produits avec recherche produit et ajustement des quantités dans le panier
- conservation de l'isolation multi-entreprises et des permissions serveur
