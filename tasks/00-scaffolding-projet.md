# 00 — Initialisation du projet (scaffolding)

**Pourquoi cette tâche** : ajoutée par rapport à la liste initiale — le repo ne contient pour l'instant que `CLAUDE.md`, il n'y a ni `package.json` ni structure de projet. C'est un prérequis à la CI (tâche 01) et aux composants (tâche 02).

## À faire

- [ ] Initialiser le projet avec Vite (template `react`, JavaScript — pas de TypeScript, cf. `CLAUDE.md`)
- [ ] Structure de dossiers de base :
  - `src/components/` — composants React (Grid, Controls, RulesPanel, ...)
  - `src/engine/` — logique pure du jeu de la vie (pas de dépendance React, facilement testable)
  - `src/hooks/` — hooks custom si besoin (ex. boucle de simulation)
- [ ] ESLint + Prettier (config minimale cohérente JS/React)
- [ ] `.gitignore` (`node_modules`, `dist`, etc.)
- [ ] Choisir et installer le framework de test — Vitest + React Testing Library (cohérent avec Vite, pas besoin d'outil supplémentaire type Jest)
- [ ] Vérifier que `npm run dev`, `npm run build` et `npm run test` fonctionnent (même avec un test placeholder)

## Definition of done

- Le projet se lance en local (`npm run dev`) et affiche une page React vide/placeholder
- Le build de prod fonctionne (`npm run build`)
- Un test placeholder passe (`npm run test`)
- Lint configuré et sans erreur sur le code présent
