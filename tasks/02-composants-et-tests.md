# 02 — Composants de la V1 + tests

Objectif : définir proprement tous les composants nécessaires au bon déroulé de la V1 (2D), avec les tests qui vont avec.

## Composants identifiés

- [x] **Moteur de simulation** (`engine/gameOfLife.js`) — calcul de la génération suivante à partir d'une grille et d'un jeu de règles. Logique pure, sans dépendance React, pour être facilement testable unitairement.
- [x] **`Grid`/`Board`** — rendu Canvas de la grille (un rectangle par cellule vivante), redessiné à chaque génération
- [x] **Gestion du clic sur la grille** — activer/désactiver une cellule manuellement (à l'arrêt ou en pause) ; nécessite de convertir une position souris en coordonnées de cellule sur le Canvas (en tenant compte de la taille d'affichage, cf. ci-dessous)
- [x] **`Controls`** — start / pause / step (avancer d'une génération) / reset / réglage de la vitesse de simulation
- [x] **`GridSettings`** (ou intégré à `Controls`) — deux réglages distincts :
  - **Taille de la grille** : dimensions logiques (nombre de lignes/colonnes), change le nombre de cellules simulées, implique un reset de la grille
  - **Taille d'affichage** : dimensions du canvas à l'écran / taille des cellules en pixels, purement visuel, ne change pas la simulation ni la matrice d'état
- [x] **`RulesPanel`** — panneau de configuration des règles (naissance/survie) ; l'implémentation complète du live-update est traitée en tâche 04, mais le composant d'affichage/saisie peut être posé ici
- [x] **État global de la simulation** — grille courante, dimensions logiques, dimensions d'affichage, génération, règles actives, état start/pause/vitesse (`useState`/`useReducer` ou contexte React selon la complexité)

## Tests associés

- [x] Tests unitaires du moteur : génération suivante correcte sur des patterns de référence (still life, blinker, glider)
- [x] Tests du moteur sur les cas limites de bords morts (une cellule en bordure ne doit pas compter de voisins hors grille)
- [x] Tests de rendu des composants (React Testing Library) :
  - `Controls` déclenche bien les actions attendues (start lance la boucle, pause l'arrête, reset vide la grille, etc.)
  - Le clic sur la grille modifie bien l'état de la cellule correspondante
  - Changer la taille de la grille reset bien la simulation avec les bonnes dimensions
  - Changer la taille d'affichage ne modifie pas l'état de la grille (pas de reset, pas de perte des cellules vivantes)
- [x] Ces tests viennent alimenter la CI mise en place en tâche 01

## Definition of done

- Tous les composants listés sont implémentés et intégrés dans l'app
- La grille s'affiche et réagit au clic
- Les tests unitaires et de composants passent en CI
