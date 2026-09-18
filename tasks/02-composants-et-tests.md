# 02 — Composants de la V1 + tests

Objectif : définir proprement tous les composants nécessaires au bon déroulé de la V1 (2D), avec les tests qui vont avec.

## Composants identifiés

- [ ] **Moteur de simulation** (`engine/gameOfLife.js`) — calcul de la génération suivante à partir d'une grille et d'un jeu de règles. Logique pure, sans dépendance React, pour être facilement testable unitairement.
- [ ] **`Grid`/`Board`** — rendu Canvas de la grille (un rectangle par cellule vivante), redessiné à chaque génération
- [ ] **Gestion du clic sur la grille** — activer/désactiver une cellule manuellement (à l'arrêt ou en pause) ; nécessite de convertir une position souris en coordonnées de cellule sur le Canvas
- [ ] **`Controls`** — start / pause / step (avancer d'une génération) / reset / réglage de la vitesse de simulation
- [ ] **`RulesPanel`** — panneau de configuration des règles (naissance/survie) ; l'implémentation complète du live-update est traitée en tâche 04, mais le composant d'affichage/saisie peut être posé ici
- [ ] **État global de la simulation** — grille courante, génération, règles actives, état start/pause/vitesse (`useState`/`useReducer` ou contexte React selon la complexité)

## Tests associés

- [ ] Tests unitaires du moteur : génération suivante correcte sur des patterns de référence (still life, blinker, glider)
- [ ] Tests du moteur sur les cas limites de bords (une fois le comportement tranché en tâche 03)
- [ ] Tests de rendu des composants (React Testing Library) :
  - `Controls` déclenche bien les actions attendues (start lance la boucle, pause l'arrête, reset vide la grille, etc.)
  - Le clic sur la grille modifie bien l'état de la cellule correspondante
- [ ] Ces tests viennent alimenter la CI mise en place en tâche 01

## Definition of done

- Tous les composants listés sont implémentés et intégrés dans l'app
- La grille s'affiche et réagit au clic
- Les tests unitaires et de composants passent en CI
