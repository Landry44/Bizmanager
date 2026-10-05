# BizManager V5.2 — Commercialisation

## Plans
- Free: 0 FCFA, 2 utilisateurs, 100 produits, essai 14 jours.
- Business: 9 900 FCFA/mois, 10 utilisateurs, 5 000 produits.
- Enterprise: sur devis, jusqu'à 100 utilisateurs, 50 000 produits.

## API
- GET `/api/companies/:companyId/subscription`
- POST `/api/companies/:companyId/subscription`
- POST `/api/auth/register` crée automatiquement un abonnement Free avec 14 jours d'essai.

## Important
La V5.2 prépare la logique commerciale mais n'encaisse pas encore de paiement réel. Le prochain branchement devra utiliser un prestataire de paiement officiellement disponible pour le marché ciblé, avec vérification serveur des webhooks.
