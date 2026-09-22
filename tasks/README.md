# Tâches V1 — Simulateur Jeu de la Vie (2D)

Suivi des tâches nécessaires pour livrer la V1 (2D uniquement, cf. [`CLAUDE.md`](../CLAUDE.md)). Chaque tâche correspond en principe à une branche `feature/<nom>` et une PR distincte.

| # | Tâche | Statut |
|---|-------|--------|
| [00](./00-scaffolding-projet.md) | Initialisation du projet (scaffolding) | Fait |
| [01](./01-ci-de-base.md) | CI de base | Fait |
| [02](./02-composants-et-tests.md) | Composants de la V1 + tests | Fait |
| [03](./03-regles-classiques.md) | Règles classiques du jeu de la vie | Fait |
| [04](./04-regles-temps-reel.md) | Modification des règles en temps réel | Fait |
| [05](./05-cd-deploiement.md) | CD et déploiement V1 | À faire |

## Au-delà de la V1

| # | Tâche | Statut |
|---|-------|--------|
| [06](./06-bibliotheque-motifs.md) | Bibliothèque de motifs (base + communautaire) | Code fait, déploiement en attente |

## Notes par rapport à la liste initiale

- **00 (scaffolding)** ajoutée : le repo ne contenait que `CLAUDE.md`, il faut initialiser le projet (Vite, structure, tooling) avant de pouvoir écrire une CI ou des tests.
- **02** inclut explicitement les contrôles de simulation (start/pause/step/reset/vitesse) et l'édition manuelle de la grille (clic sur une cellule) — ce sont des composants produit à part entière, pas juste des détails d'implémentation des règles.
- **03** inclut la décision sur le comportement des bords de grille (torique vs bords morts), notée comme "à trancher" dans le `CLAUDE.md`.
- **05** inclut le choix de la plateforme de déploiement en préalable, nécessaire avant de configurer la CD.

Ordre de dépendance : 00 → 01 → 02 → 03 → 04 → 05 (chaque tâche suppose la précédente terminée, sauf 01 qui peut évoluer en parallèle des autres).
