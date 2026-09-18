# 05 — CD et déploiement V1

**Plateforme retenue** : Cloudflare Pages.

## À faire

- [ ] Créer le projet Cloudflare Pages et le connecter au repo GitHub
- [ ] Workflow GitHub Actions de déploiement (`.github/workflows/cd.yml`), déclenché sur merge dans `main`, dépendant du succès de la CI (tâche 01) — via l'action `cloudflare/wrangler-action` (ou déploiement direct géré par Cloudflare Pages sur push, à trancher selon simplicité voulue)
- [ ] Configuration du build de production pour Vite (commande de build, dossier `dist` en sortie) côté Cloudflare Pages
- [ ] Variables d'environnement / secrets Cloudflare (API token) stockés dans les secrets GitHub Actions si le déploiement passe par la CI
- [ ] Vérifier le déploiement sur l'environnement réel (smoke test manuel post-déploiement)
- [ ] (Optionnel) Mettre à jour le `README.md` avec le lien vers la démo déployée et les instructions de dev local

## Definition of done

- Chaque merge dans `main` déclenche un déploiement automatique
- L'app est accessible publiquement à une URL stable
- Le déploiement échoue proprement (et n'écrase pas la prod) si la CI est rouge
