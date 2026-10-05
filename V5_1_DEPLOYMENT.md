# BizManager V5.1 — mise en ligne

Cette version est **prête au déploiement**, mais elle n'est pas encore publiquement accessible tant qu'elle n'est pas connectée à un compte Cloud et à une base PostgreSQL de production.

## Option recommandée
- Application : Vercel
- PostgreSQL : Neon ou Supabase
- Domaine : domaine personnel ou domaine fourni par Vercel

## Variables Vercel
Configurer dans Production :
- `DATABASE_URL`
- `SESSION_SECRET`
- `APP_URL`
- `APP_VERSION=5.1.0`

## Base de données
Avant le premier lancement production :
1. `npm ci`
2. `npx prisma generate`
3. `npx prisma migrate deploy`
4. Si une base neuve doit recevoir le compte de démonstration : `npm run db:seed`

Le compte de démonstration reste :
- Email : `admin@bizmanager.local`
- Mot de passe : `admin123`
- Rôle : `OWNER`

Changer ce mot de passe avant toute utilisation réelle.

## Vérification
Après déploiement, ouvrir :
`https://VOTRE-DOMAINE/api/health`

La réponse doit contenir `ok: true` et `database: true`.

## Docker
Un `Dockerfile` de production est inclus. Il utilise le mode Next.js standalone.

## Important
Le fichier ZIP seul n'est pas l'application publique. L'activation réelle nécessite un compte Cloud, une base PostgreSQL de production et, si souhaité, un domaine.
