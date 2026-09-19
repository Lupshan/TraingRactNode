# 03 — Implémenter les règles classiques du jeu de la vie

**Décision** : bords morts — les cellules hors grille sont considérées mortes (pas de rebouclage torique).

## À faire

- [x] Implémenter les règles classiques B3/S23 dans le moteur de simulation (`engine/gameOfLife.js`) : une cellule morte avec exactement 3 voisins vivants naît, une cellule vivante avec 2 ou 3 voisins vivants survit, sinon elle meurt
- [x] Le comptage des voisins hors grille doit compter comme "mort" (bords morts) — pas d'accès circulaire aux indices opposés
- [x] Valider le moteur avec des patterns de référence connus : still life (bloc), oscillateur (blinker), vaisseau (glider) — en complément des tests unitaires posés en tâche 02
- [x] Brancher le moteur au rendu Canvas et aux contrôles : le bouton "start" doit faire tourner la simulation en continu à la vitesse choisie, "step" avance d'une génération, "reset" vide/réinitialise la grille

## Definition of done

- [x] Un glider posé sur la grille se déplace correctement sur plusieurs générations
- [x] Les contrôles (start/pause/step/reset/vitesse) pilotent correctement le moteur
- [x] Les tests de la tâche 02 passent avec l'implémentation réelle des règles B3/S23

## Note

Le moteur (B3/S23 par défaut, bords morts) et le branchage aux contrôles ont été posés dès la tâche 02, pour éviter un moteur factice à retravailler ensuite. Cette tâche s'est donc limitée à une vérification, sans nouveau code : glider placé à la souris dans l'app réellement lancée, avancé de 4 générations via le bouton "Step", déplacement de (+1,+1) confirmé par lecture directe des pixels du canvas (script Playwright, aucune erreur console).
