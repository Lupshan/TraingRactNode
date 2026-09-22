# Jeu de la vie

Simulateur du Jeu de la Vie de Conway en React (voir [`CLAUDE.md`](./CLAUDE.md) pour les specs du projet).

**Démo** : https://game-of-react.lupshan.workers.dev

## Stack

Vite + React (JavaScript), rendu Canvas, tests avec Vitest + React Testing Library.
La bibliothèque de motifs communautaire s'appuie sur un petit Worker Cloudflare
(`worker/`) avec un binding KV pour le stockage partagé — voir plus bas.

## Commandes

```bash
npm install       # installer les dépendances
npm run dev       # serveur de dev avec hot-reload (frontend seul)
npm run dev:worker # Worker local (API /api/patterns) sur le port 8787
npm run build     # build de prod dans dist/
npm run preview   # servir le build de prod en local
npm run test      # lancer les tests
npm run lint      # linter le code
npm run format    # formater le code avec Prettier
```

Pour tester la bibliothèque communautaire en local (partage de motifs), lancer
`npm run dev:worker` dans un terminal et `npm run dev` dans un autre — Vite
proxie `/api` vers `http://localhost:8787`. Sans `dev:worker`, l'appli
fonctionne normalement mais la section « Motifs de la communauté » reste
vide (erreur réseau silencieuse, sans impact sur le reste).

## Structure

- `src/components/` — composants React
- `src/engine/` — logique du jeu de la vie, indépendante de React (moteur,
  RLE, canonicalisation de forme)
- `src/hooks/` — hooks custom
- `src/patterns/` — bibliothèque de motifs de base + règles de validation
- `src/api/` — client HTTP pour la bibliothèque de motifs communautaire
- `worker/` — Worker Cloudflare : sert les assets statiques et l'API
  `/api/patterns` (stockage KV, dédoublonnage par forme canonique —
  invariant par translation, rotation et réflexion)

## Bibliothèque de motifs

- **Motifs de base** (planeur, clignotant, crapaud, phare, pulsar, vaisseau
  léger, bloc, ruche) : intégrés au bundle, pas de requête réseau.
- **Motifs communautaires** : n'importe qui peut dessiner un motif sur la
  grille et le partager (pas de compte). Le Worker calcule une signature de
  forme invariante par rotation/réflexion pour refuser les doublons — y
  compris ceux qui reproduisent un motif de base sous une autre orientation.

Pour déployer, le binding KV `PATTERNS` doit exister sur le projet Cloudflare
(`npx wrangler kv namespace create PATTERNS`), avec son id renseigné dans
`wrangler.jsonc`.

## Roadmap

Voir [`tasks/`](./tasks/README.md) pour le détail des tâches de la V1.
