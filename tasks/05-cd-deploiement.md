# 05 — CD et déploiement V1

**Plateforme retenue** : Cloudflare (Workers & Pages, connexion Git directe).

**Décision** : connexion directe Cloudflare ↔ repo GitHub (build et déploiement gérés par Cloudflare lui-même sur chaque push vers `main`), plutôt qu'un workflow GitHub Actions dédié. Pas de gating CI→déploiement côté Cloudflare : inutile ici puisque la protection de branche sur `main` (task 01) empêche déjà tout commit dont la CI est rouge d'y atteindre. Plus simple, zéro secret à gérer côté GitHub.

**Correction en cours de route** : le projet a été créé via le flux unifié "Workers & Pages" de Cloudflare, qui déploie en tant que **Worker** (assets statiques) plutôt que via l'ancien produit "Pages" séparé. URL réelle : `*.workers.dev`, pas `*.pages.dev` comme prévu initialement — README corrigé en conséquence. Fonctionnellement équivalent pour ce projet (site statique servi par Cloudflare, déclenché sur push).

## À faire

- [x] Créer le projet Cloudflare et le connecter au repo GitHub
- [x] Configuration du build de production pour Vite (commande `npm run build`, dossier `dist` en sortie) côté Cloudflare
- [ ] Vérifier le déploiement sur l'environnement réel (smoke test manuel post-déploiement) — **en attente de confirmation** (mon environnement n'a pas accès réseau vers `*.workers.dev`)
- [x] Mettre à jour le `README.md` avec le lien vers la démo déployée

## Definition of done

- [x] Chaque push dans `main` déclenche un déploiement automatique (géré par Cloudflare, pas par une CI red qui pourrait de toute façon pas atteindre `main` grâce à la protection de branche)
- [ ] L'app est accessible publiquement à une URL stable — en attente de confirmation visuelle
