# 05 — CD et déploiement V1

## À faire

- [ ] Choisir la plateforme d'hébergement — le projet est 100% statique/client (pas de backend), donc GitHub Pages, Vercel, Netlify ou Cloudflare Pages conviennent toutes ; à trancher selon préférence (gratuité, simplicité de config avec Vite, domaine personnalisé éventuel)
- [ ] Workflow GitHub Actions de déploiement (`.github/workflows/cd.yml`), déclenché sur merge dans `main`, dépendant du succès de la CI (tâche 01)
- [ ] Configuration du build de production (ex. `base` path Vite si déploiement sur un sous-chemin type GitHub Pages)
- [ ] Vérifier le déploiement sur l'environnement réel (smoke test manuel post-déploiement)
- [ ] (Optionnel) Mettre à jour le `README.md` avec le lien vers la démo déployée et les instructions de dev local

## Definition of done

- Chaque merge dans `main` déclenche un déploiement automatique
- L'app est accessible publiquement à une URL stable
- Le déploiement échoue proprement (et n'écrase pas la prod) si la CI est rouge
