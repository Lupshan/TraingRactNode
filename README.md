# Jeu de la vie

Simulateur du Jeu de la Vie de Conway en React (voir [`CLAUDE.md`](./CLAUDE.md) pour les specs du projet).

**Démo** : https://game-of-react.lupshan.workers.dev

## Stack

Vite + React (JavaScript), rendu Canvas, tests avec Vitest + React Testing Library.

## Commandes

```bash
npm install      # installer les dépendances
npm run dev      # serveur de dev avec hot-reload
npm run build    # build de prod dans dist/
npm run preview  # servir le build de prod en local
npm run test     # lancer les tests
npm run lint     # linter le code
npm run format   # formater le code avec Prettier
```

## Structure

- `src/components/` — composants React
- `src/engine/` — logique du jeu de la vie, indépendante de React
- `src/hooks/` — hooks custom

## Roadmap

Voir [`tasks/`](./tasks/README.md) pour le détail des tâches de la V1.
