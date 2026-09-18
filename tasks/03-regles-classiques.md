# 03 — Implémenter les règles classiques du jeu de la vie

**Décision** : bords morts — les cellules hors grille sont considérées mortes (pas de rebouclage torique).

## À faire

- [ ] Implémenter les règles classiques B3/S23 dans le moteur de simulation (`engine/gameOfLife.js`) : une cellule morte avec exactement 3 voisins vivants naît, une cellule vivante avec 2 ou 3 voisins vivants survit, sinon elle meurt
- [ ] Le comptage des voisins hors grille doit compter comme "mort" (bords morts) — pas d'accès circulaire aux indices opposés
- [ ] Valider le moteur avec des patterns de référence connus : still life (bloc), oscillateur (blinker), vaisseau (glider) — en complément des tests unitaires posés en tâche 02
- [ ] Brancher le moteur au rendu Canvas et aux contrôles : le bouton "start" doit faire tourner la simulation en continu à la vitesse choisie, "step" avance d'une génération, "reset" vide/réinitialise la grille

## Definition of done

- Un glider posé sur la grille se déplace correctement sur plusieurs générations
- Les contrôles (start/pause/step/reset/vitesse) pilotent correctement le moteur
- Les tests de la tâche 02 passent avec l'implémentation réelle des règles B3/S23
