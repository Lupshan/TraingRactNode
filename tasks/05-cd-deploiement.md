# 05 — CD et déploiement V1

**Plateforme retenue** : Cloudflare Pages.

**Décision** : connexion directe Cloudflare Pages ↔ repo GitHub (build et déploiement gérés par Cloudflare lui-même sur chaque push vers `main`), plutôt qu'un workflow GitHub Actions dédié. Pas de gating CI→déploiement côté Cloudflare : inutile ici puisque la protection de branche sur `main` (task 01) empêche déjà tout commit dont la CI est rouge d'y atteindre. Plus simple, zéro secret à gérer côté GitHub.

## À faire

- [ ] Créer le projet Cloudflare Pages et le connecter au repo GitHub
- [ ] Configuration du build de production pour Vite (commande `npm run build`, dossier `dist` en sortie) côté Cloudflare Pages
- [ ] Vérifier le déploiement sur l'environnement réel (smoke test manuel post-déploiement)
- [ ] Mettre à jour le `README.md` avec le lien vers la démo déployée

## Definition of done

- Chaque push dans `main` déclenche un déploiement automatique (géré par Cloudflare, pas par une CI red qui pourrait de toute façon pas atteindre `main` grâce à la protection de branche)
- L'app est accessible publiquement à une URL stable
