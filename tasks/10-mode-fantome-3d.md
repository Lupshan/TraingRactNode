> **Remplacé par la [tâche 11](./11-ciblage-survol-tuto-mort.md)** : le mode fantôme (cellules semi-transparentes + re-clic au même endroit) a été jugé peu lisible à l'usage et remplacé par un aperçu au survol + profondeur réglable à la molette. Les fonctions pures `intersectRayBox`/`computeRayGridPath` documentées ci-dessous restent inchangées et réutilisées telles quelles.

# 10 — Mode fantôme : atteindre l'intérieur de la grille 3D

Complète les [tâches 08](./08-rendu-3d.md)/[09](./09-edition-3d.md) : le clic sur une face ne permet d'éditer que la couche externe exposée ("Limite acceptée" de la tâche 09). L'utilisateur a demandé comment remplir l'intérieur du cube — décision : bouton "Mode fantôme" (option choisie face à un mode coupe/tranche navigable).

## Décision et fonctionnement

- Un bouton bascule le mode fantôme : les cellules vivantes deviennent semi-transparentes (`opacity: 0.35`).
- Re-cliquer **au même endroit à l'écran** (dans un petit seuil de pixels) avance d'une cellule le long du trajet du rayon, vers l'intérieur de la grille, plutôt que de rebasculer la même cellule de bord. Cliquer ailleurs repart de la couche externe.
- Hors mode fantôme, comportement inchangé (équivalent à la tâche 09) : seule la première cellule du trajet — la couche externe — est éditée.

## Implémentation

- `intersectRayBox` (méthode des tranches, algorithme standard d'intersection rayon/boîte alignée sur les axes) trouve où le rayon de clic entre et sort de la grille.
- `computeRayGridPath` échantillonne le trajet entre ces deux points (pas de 0.5 unité — la direction étant un vecteur unitaire, ça ne peut jamais sauter une cellule entière, prouvé par un test dédié avec un rayon en diagonale) et renvoie la liste ordonnée et dédoublonnée des cellules traversées, de la plus proche de la caméra à la plus lointaine.
- Remplace l'ancienne `resolveCellFromBoxFaceHit` (tâche 09) — supprimée, devenue redondante : `path[0]` du nouveau calcul donne exactement le même résultat pour un simple clic (vérifié par un test), donc plus besoin de deux façons de résoudre une cellule cliquée.
- Un seul gestionnaire de clic (sur la boîte invisible de contour, comme en tâche 09) gère les deux modes ; le mode fantôme ne change que quel élément du trajet est utilisé (indice de profondeur qui avance à chaque clic au même endroit, ou repart de 0 sinon).

## À faire

- [x] `intersectRayBox` et `computeRayGridPath` dans `grid3DHelpers.js`, testés (rayon traversant, rayon manqué, origine déjà à l'intérieur, boîte derrière l'origine, non-saut de cellule sur un trajet diagonal, équivalence avec l'ancienne résolution par face)
- [x] Suppression de `resolveCellFromBoxFaceHit` (et ses tests), redondante
- [x] Matériau semi-transparent des cellules en mode fantôme (`depthWrite: false` pour un tri correct des cellules transparentes superposées)
- [x] Bouton "Mode fantôme" + message d'aide dans le panneau 3D de `App.jsx`

## Definition of done

- [x] Tests unitaires verts, couverture globale au-dessus du seuil de 80 %
- [x] `npm run lint`, `npm run build` passent
- [x] Vérifié visuellement de bout en bout avec Playwright (navigateur réel) : 4 clics au même endroit en mode fantôme posent 4 cellules distinctes empilées vers l'intérieur (confirmé en tournant la vue) ; mode normal non affecté (add/remove identique à la tâche 09) ; aucune erreur console
