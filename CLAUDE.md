# CLAUDE.md

Ce fichier définit le contexte, les spécifications et les conventions du projet pour guider le travail dessus.

## Projet

Simulateur du Jeu de la Vie de Conway en React, avec deux axes différenciants par rapport à une implémentation classique :

1. **Bascule 2D / 3D** — changement de dimension de la simulation, pas en temps réel (implique de réinitialiser la grille et le moteur de simulation).
2. **Règles modifiables en temps réel** — les règles de naissance/survie peuvent être changées pendant que la simulation tourne, sans reload.

## Stack technique

- **Build tool** : Vite
- **Langage** : JavaScript (pas de TypeScript)
- **Framework UI** : React
- **Rendu de la grille** : Canvas (API 2D context) — un seul élément `<canvas>`, dessin via `fillRect`, pas de nœud DOM par cellule
- **Backend** : aucun pour le moment. Node.js est réservé à une évolution future (voir Roadmap)
- **Déploiement** : Cloudflare Pages

## Scope V1 (2D uniquement)

- Grille 2D représentée par une matrice d'état (vivant / mort)
- Moteur de simulation : calcul de la génération suivante à partir des règles actives
- Rendu Canvas : un rectangle par cellule vivante, redessiné à chaque génération
- Contrôles de simulation : start / pause / step (avancer d'une génération) / reset / réglage de la vitesse
- Édition manuelle de la grille : clic sur une cellule pour l'activer/désactiver (à l'arrêt ou en pause)
- Panneau de règles : paramétrage du nombre de voisins pour naissance et survie (notation B/S, ex. `B3/S23` pour le jeu de la vie classique), appliqué dès la génération suivante sans interruption ni reload
- Comportement des bords de grille : bords morts (les cellules hors grille sont considérées mortes, pas de rebouclage torique)
- Taille de la grille (dimensions logiques, nombre de lignes/colonnes) configurable — **distincte** de la taille d'affichage (taille du canvas à l'écran / taille des cellules en pixels) : une grille de 50×50 peut être affichée en petit ou en grand sans changer le nombre de cellules simulées

## Hors scope V1 (roadmap)

- **Mode 3D** : rendu via Three.js / react-three-fiber, bascule 2D/3D non temps réel
- **Règles 3D** : espace de règles distinct de la 2D (voisinage et seuils différents), à concevoir séparément
- **Backend Node.js** : banque de motifs préconstruits (glider, oscillateurs, etc.), import/export au format RLE (standard LifeWiki), partage communautaire de patterns
- **Génération aléatoire avancée** : seeds partageables entre utilisateurs

## Convention Git

- **Une branche par feature** : `feature/<nom-court>` (ex. `feature/grille-canvas`, `feature/panneau-regles`)
- **Pas de branche de staging/develop** — le projet est trop petit pour que ça ait du sens, on travaille directement entre `feature/*` et `main`
- **Pull Request systématique** avant de merger dans `main`, même en solo sans reviewer externe — ça garde un historique propre et relisable par feature
- **Pas de force-push sur `main`**
- Commits clairs et descriptifs, un commit = un changement cohérent
